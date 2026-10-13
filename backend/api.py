
import hashlib
import hmac
import json
import logging
import os
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from zoneinfo import ZoneInfo

from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand, Update
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from timezonefinder import TimezoneFinder

import bot as bot_logic
import storage
from main_engine import (
    build_natal_chart_by_city,
    calculate_natal_chart,
    find_timezone_offset,
)

logger = logging.getLogger("api")


app = FastAPI(
    title="StarWise Engine API",
    description="API для расчёта натальной карты",
    version="1.0.0",
)

# Создаёт таблицы БД при старте (идемпотентно)
storage.init_db()

# CORS: пока разрешены все источники
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================================================================
# ПОДСКАЗКИ ГОРОДА — GeoNames (env: GEONAMES_USERNAME)
# ===========================================================================
GEONAMES_USERNAME = os.environ.get("GEONAMES_USERNAME")
if not GEONAMES_USERNAME:
    logger.warning(
        "GEONAMES_USERNAME не задан — /cities/search будет отвечать "
        "пустым списком подсказок, пока переменная окружения не "
        "прописана (см. комментарий выше)."
    )
# Бесплатный аккаунт GeoNames работает только по http
GEONAMES_URL = "http://api.geonames.org/searchJSON"
GEONAMES_TIMEOUT = 4  # секунд

# In-memory кэш подсказок по префиксу (живёт, пока жив процесс)
_city_search_cache: dict[str, list[dict]] = {}
_CACHE_MAX_ENTRIES = 2000

tf = TimezoneFinder()  # fallback, если GeoNames вдруг не вернул timezone

# ===========================================================================
# ОПЛАТА — Telegram Stars (POST /create-invoice), env: TELEGRAM_BOT_TOKEN
# ===========================================================================
# Здесь только создание счёта; подтверждение оплаты — successful_payment в bot.py
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CREATE_INVOICE_URL = "https://api.telegram.org/bot{token}/createInvoiceLink"
TELEGRAM_TIMEOUT = 8  # секунд

# ===========================================================================
# TELEGRAM-БОТ — вебхук в этом же процессе (логика в bot.py)
# ===========================================================================
# env: TELEGRAM_WEBHOOK_SECRET — проверка, что запрос пришёл от Telegram
TELEGRAM_WEBHOOK_SECRET = os.environ.get("TELEGRAM_WEBHOOK_SECRET")
if not TELEGRAM_WEBHOOK_SECRET:
    logger.warning(
        "TELEGRAM_WEBHOOK_SECRET не задан — /telegram/webhook будет "
        "принимать запросы без проверки подлинности отправителя. "
        "Задать перед публичным запуском, см. комментарий выше."
    )

bot: Bot | None = None
dispatcher: Dispatcher | None = None
if TELEGRAM_BOT_TOKEN:
    bot = Bot(token=TELEGRAM_BOT_TOKEN)
    dispatcher = Dispatcher()
    dispatcher.include_router(bot_logic.router)
else:
    logger.warning(
        "TELEGRAM_BOT_TOKEN не задан — /telegram/webhook будет отвечать "
        "503, бот не сможет отвечать пользователям."
    )


@app.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    if not bot or not dispatcher:
        raise HTTPException(
            status_code=503,
            detail="Бот не сконфигурирован — TELEGRAM_BOT_TOKEN не задан на сервере.",
        )

    if TELEGRAM_WEBHOOK_SECRET:
        received_secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
        if received_secret != TELEGRAM_WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Неверный секрет вебхука.")

    # Ошибка обработки апдейта -> всё равно 200, иначе Telegram отключит вебхук.
    # Исключение: PaymentStorageError -> 500, чтобы Telegram повторил доставку платежа.
    try:
        body = await request.json()
        update = Update.model_validate(body)
        await dispatcher.feed_update(bot, update)
    except storage.PaymentStorageError:
        logger.exception(
            "Временный сбой записи платежа — отвечаем 500, чтобы Telegram "
            "повторил доставку этого апдейта позже"
        )
        raise HTTPException(
            status_code=500,
            detail="Временная ошибка хранилища, повторите доставку позже.",
        )
    except Exception:
        logger.exception("Ошибка обработки апдейта от Telegram (webhook)")

    return {"ok": True}


@app.on_event("startup")
async def _set_bot_commands():
    """Меню команд бота (кнопка «Меню» в чате)."""
    if not bot:
        return
    try:
        await bot.set_my_commands(
            [
                BotCommand(command="start", description="Открыть StarWise"),
                BotCommand(command="support", description="Написать в поддержку"),
            ],
            request_timeout=5,
        )
    except Exception as e:
        # Не критично: сервер работает и без этого (например, Telegram недоступен из сети)
        logger.warning("Меню команд бота не обновлено — нет связи с Telegram: %s", e)


@app.on_event("shutdown")
async def _close_bot_session():
    if bot:
        await bot.session.close()

# Каталог категорий и цены — таблица content_categories (storage.py).
# Период Stars-подписки:
SUBSCRIPTION_DAYS = 30
SUBSCRIPTION_PERIOD_SECONDS = SUBSCRIPTION_DAYS * 24 * 60 * 60  # 30 дней в секундах


class CreateInvoiceRequest(BaseModel):
    category: str
    init_data: str | None = None


# ===========================================================================
# ПРОВЕРКА initData — подпись данных Telegram Mini App
# ===========================================================================
# Подтверждает, что запрос пришёл от реального пользователя Telegram.
def verify_telegram_init_data(
    init_data: str, bot_token: str, max_age_seconds: int = 86400
) -> dict | None:
    try:
        pairs = dict(urllib.parse.parse_qsl(init_data, strict_parsing=True))
    except ValueError:
        return None

    received_hash = pairs.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        return None

    auth_date = int(pairs.get("auth_date", 0))
    if max_age_seconds and (time.time() - auth_date) > max_age_seconds:
        # initData устарел (защита от replay)
        return None

    user_raw = pairs.get("user")
    try:
        user = json.loads(user_raw) if user_raw else None
    except (TypeError, ValueError):
        return None

    return {"auth_date": auth_date, "user": user}


def _geonames_search(query: str, lang: str = "ru") -> list[dict]:
    cache_key = f"{lang}:{query.lower()}"
    cached = _city_search_cache.get(cache_key)
    if cached is not None:
        return cached

    if not GEONAMES_USERNAME:
        raise RuntimeError(
            "GEONAMES_USERNAME не задан — см. комментарий выше блока "
            "геокодера в этом файле."
        )

    params = {
        "name_startsWith": query,
        "maxRows": 8,
        "username": GEONAMES_USERNAME,
        "featureClass": "P",  # только населённые пункты
        "orderby": "population",  # крупные и узнаваемые города — первыми
        "lang": lang,
        "style": "full",  # чтобы в ответе сразу был часовой пояс
    }
    url = f"{GEONAMES_URL}?{urllib.parse.urlencode(params)}"

    with urllib.request.urlopen(url, timeout=GEONAMES_TIMEOUT) as response:
        payload = json.loads(response.read().decode("utf-8"))

    if "status" in payload:
        # GeoNames отдаёт ошибки в теле 200-го ответа
        raise RuntimeError(payload["status"].get("message", "GeoNames error"))

    results = payload.get("geonames", [])

    if len(_city_search_cache) >= _CACHE_MAX_ENTRIES:
        _city_search_cache.clear()
    _city_search_cache[cache_key] = results

    return results


class CitySearchResult(BaseModel):
    city: str
    region: str | None = None
    country: str | None = None
    label: str
    latitude: float
    longitude: float
    timezone_name: str | None = None


class NatalChartRequest(BaseModel):
    city_name: str = Field(min_length=2)
    year: int
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)

    # Координаты города, выбранного из подсказки (необязательны)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timezone_name: str | None = None


@app.get("/")
def root():
    return {"message": "StarWise Backend is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cities/search", response_model=dict[str, list[CitySearchResult]])
def search_cities(
    # Поиск начинается с 3 букв (как и на фронтенде)
    q: str = Query(min_length=2, max_length=100),
):
    query = q.strip()
    if len(query) < 3:
        return {"results": []}

    try:
        raw_results = _geonames_search(query)
    except (URLError, TimeoutError, RuntimeError, ValueError) as e:
        # Сбой GeoNames -> пустой список подсказок, причина пишется в лог
        logger.warning(
            "GeoNames недоступен для запроса %r (%s): %s",
            query,
            type(e).__name__,
            e,
        )
        return {"results": []}

    results = []
    seen = set()

    for item in raw_results:
        city = item.get("name") or item.get("toponymName")
        if not city:
            continue

        region = item.get("adminName1") or None
        country = item.get("countryName") or None

        label_parts = [city]
        if region and region != city:
            label_parts.append(region)
        if country and country not in label_parts:
            label_parts.append(country)
        label = ", ".join(label_parts)

        try:
            latitude = float(item["lat"])
            longitude = float(item["lng"])
        except (KeyError, TypeError, ValueError):
            continue

        # Запасной расчёт таймзоны, если GeoNames её не вернул
        tz_name = (item.get("timezone") or {}).get("timeZoneId")
        if not tz_name:
            tz_name = tf.timezone_at(lat=latitude, lng=longitude)

        key = (
            city.strip().lower(),
            (region or "").strip().lower(),
            (country or "").strip().lower(),
        )
        if key in seen:
            continue
        seen.add(key)

        results.append(
            CitySearchResult(
                city=city,
                region=region,
                country=country,
                label=label,
                latitude=latitude,
                longitude=longitude,
                timezone_name=tz_name,
            )
        )

    return {"results": results}


@app.post("/calculate")
def calculate_natal_chart_endpoint(data: NatalChartRequest):
    try:
        # Город выбран из подсказки — считаем по его координатам
        if data.latitude is not None and data.longitude is not None:
            birth_date = datetime(
                data.year,
                data.month,
                data.day,
                data.hour,
                data.minute,
            )

            if data.timezone_name:
                tz = ZoneInfo(data.timezone_name)
                offset = birth_date.replace(tzinfo=tz).utcoffset()
                if offset is None:
                    raise ValueError("Не удалось определить смещение часового пояса")
                tz_offset = offset.total_seconds() / 3600
            else:
                tz_offset, _ = find_timezone_offset(
                    data.latitude,
                    data.longitude,
                    birth_date,
                )

            chart_data = calculate_natal_chart(
                year=data.year,
                month=data.month,
                day=data.day,
                hour=data.hour,
                minute=data.minute,
                lat=data.latitude,
                lon=data.longitude,
                tz_offset=tz_offset,
            )
        else:
            # Передано только название города — геокодим на бэкенде
            chart_data = build_natal_chart_by_city(
                city_name=data.city_name,
                year=data.year,
                month=data.month,
                day=data.day,
                hour=data.hour,
                minute=data.minute,
            )

        return {
            "status": "success",
            "data": chart_data,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        # Не отдаём traceback клиенту. Подробности остаются в консоли FastAPI.
        raise HTTPException(
            status_code=500,
            detail="Не удалось рассчитать натальную карту.",
        ) from e


@app.post("/create-invoice")
def create_invoice(data: CreateInvoiceRequest):
    category = storage.get_category(data.category)
    if not category or not category["is_active"]:
        raise HTTPException(
            status_code=404,
            detail="Неизвестная или отключённая категория для оплаты.",
        )

    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(
            status_code=500,
            detail=(
                "TELEGRAM_BOT_TOKEN не задан на сервере — см. комментарий "
                "выше блока оплаты в этом файле."
            ),
        )

    # Счёт создаётся только для подтверждённого пользователя Mini App
    verified = verify_telegram_init_data(data.init_data or "", TELEGRAM_BOT_TOKEN)
    if not verified or not verified.get("user"):
        raise HTTPException(
            status_code=401,
            detail="Не удалось подтвердить подлинность initData.",
        )

    title = category["name"]
    description = category["description"] or ""
    price_stars = category["price_stars"]

    payload = {
        "title": title,
        "description": description,
        # payload связывает оплату с категорией (читается в bot.py)
        "payload": f"{data.category}:{int(time.time())}",
        "currency": "XTR",  # Telegram Stars
        "prices": [{"label": title, "amount": price_stars}],
        # Для Stars provider_token — пустая строка
        "provider_token": "",
    }
    if data.category == "daily_subscription":
        payload["subscription_period"] = SUBSCRIPTION_PERIOD_SECONDS

    request_body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        TELEGRAM_CREATE_INVOICE_URL.format(token=TELEGRAM_BOT_TOKEN),
        data=request_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=TELEGRAM_TIMEOUT) as response:
            result = json.loads(response.read().decode("utf-8"))
    except URLError as e:
        raise HTTPException(
            status_code=502,
            detail="Не удалось связаться с Telegram для создания счёта.",
        ) from e

    if not result.get("ok"):
        # Описание ошибки Telegram отдаёт в теле ответа
        raise HTTPException(
            status_code=502,
            detail=result.get(
                "description", "Telegram отклонил запрос на создание счёта."
            ),
        )

    return {"invoice_url": result["result"]}


@app.get("/purchases")
def get_purchases(
    x_telegram_init_data: str = Header(
        ..., description="Telegram.WebApp.initData с клиента (lib/telegram.js getInitData())"
    ),
):
    # initData приходит заголовком; покупки отдаются из серверного хранилища (storage.py)
    init_data = x_telegram_init_data
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="TELEGRAM_BOT_TOKEN не задан на сервере — без него нельзя проверить initData.",
        )

    verified = verify_telegram_init_data(init_data, TELEGRAM_BOT_TOKEN)
    if not verified or not verified.get("user"):
        raise HTTPException(
            status_code=401,
            detail="Не удалось подтвердить подлинность initData.",
        )

    telegram_user_id = verified["user"]["id"]

    return {
        "unlocked_categories": storage.get_unlocked_categories(telegram_user_id),
        "subscription": storage.get_subscription(telegram_user_id),
    }


# ===========================================================================
# ПРОФИЛЬ — сохранённые данные рождения и карта (GET / PUT /profile)
# ===========================================================================
# Нужен, чтобы вернувшийся пользователь попадал сразу на главный экран,
# а не проходил онбординг заново (в том числе на другом устройстве).
PROFILE_MAX_BYTES = 300_000


class SaveProfileRequest(BaseModel):
    birth_data: dict
    chart: dict


def _verified_telegram_user(init_data: str) -> dict:
    """Проверяет initData и возвращает пользователя Telegram (иначе 401 / 500)."""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="TELEGRAM_BOT_TOKEN не задан на сервере — без него нельзя проверить initData.",
        )
    verified = verify_telegram_init_data(init_data, TELEGRAM_BOT_TOKEN)
    if not verified or not verified.get("user") or "id" not in verified["user"]:
        raise HTTPException(
            status_code=401,
            detail="Не удалось подтвердить подлинность initData.",
        )
    return verified["user"]


@app.get("/profile")
def get_profile(x_telegram_init_data: str = Header(...)):
    user = _verified_telegram_user(x_telegram_init_data)
    profile = storage.load_birth_profile(
        user["id"],
        username=user.get("username"),
        first_name=user.get("first_name"),
        language_code=user.get("language_code"),
    )
    return {"profile": profile}


@app.put("/profile")
def save_profile(data: SaveProfileRequest, x_telegram_init_data: str = Header(...)):
    user = _verified_telegram_user(x_telegram_init_data)
    if not data.birth_data or not data.chart:
        raise HTTPException(status_code=400, detail="Пустые данные профиля.")
    size = len(json.dumps(data.birth_data)) + len(json.dumps(data.chart))
    if size > PROFILE_MAX_BYTES:
        raise HTTPException(status_code=413, detail="Слишком большой профиль.")

    updated_at = storage.save_birth_profile(
        user["id"],
        data.birth_data,
        data.chart,
        username=user.get("username"),
        first_name=user.get("first_name"),
        language_code=user.get("language_code"),
    )
    return {"status": "saved", "updated_at": updated_at}


# ===========================================================================
# АДМИНКА — единая панель /admin: платежи, возвраты, доступ, поддержка, категории
# ===========================================================================
# Защита: токен в заголовке X-Admin-Token (env: ADMIN_TOKEN)
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")
TELEGRAM_REFUND_URL = "https://api.telegram.org/bot{token}/refundStarPayment"
TELEGRAM_SEND_MESSAGE_URL = "https://api.telegram.org/bot{token}/sendMessage"
SUPPORT_REPLY_MAX_LENGTH = 4000
SUPPORT_REPLY_PREFIX = "Поддержка StarWise:\n\n"


def _require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="ADMIN_TOKEN не задан на сервере — админ-эндпоинты отключены.",
        )
    if not x_admin_token or not hmac.compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Неверный admin-токен.")


ADMIN_PAGE = Path(__file__).resolve().parent / "admin.html"


@app.get("/admin", include_in_schema=False)
def admin_panel():
    """Страница админ-панели. Сама страница секретов не содержит — данные
    она получает через /admin/* с токеном X-Admin-Token."""
    return FileResponse(
        ADMIN_PAGE,
        media_type="text/html",
        headers={"Cache-Control": "no-store", "X-Frame-Options": "DENY"},
    )


@app.get("/admin/overview", dependencies=[Depends(_require_admin)])
def admin_overview():
    return storage.get_overview()


@app.get("/admin/users", dependencies=[Depends(_require_admin)])
def admin_list_users(
    search: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=100, le=500),
):
    return {"users": storage.list_users(search, limit)}


@app.delete(
    "/admin/users/{telegram_user_id}/profile", dependencies=[Depends(_require_admin)]
)
def admin_delete_profile(telegram_user_id: int):
    """Удаляет сохранённые данные рождения и карту пользователя: при следующем
    открытии приложение снова покажет ему онбординг. Покупки сохраняются."""
    if not storage.delete_birth_profile(telegram_user_id):
        raise HTTPException(status_code=404, detail="У пользователя нет сохранённой карты.")
    return {"status": "deleted"}


# --- Поддержка: переписка с пользователями через бота ---

class SupportReplyRequest(BaseModel):
    text: str = Field(min_length=1, max_length=SUPPORT_REPLY_MAX_LENGTH)


def _send_bot_message(chat_id: int, text: str) -> dict:
    """Отправляет сообщение пользователю от имени бота (Bot API sendMessage)."""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(
            status_code=500, detail="TELEGRAM_BOT_TOKEN не задан на сервере."
        )
    request = urllib.request.Request(
        TELEGRAM_SEND_MESSAGE_URL.format(token=TELEGRAM_BOT_TOKEN),
        data=json.dumps({"chat_id": chat_id, "text": text}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=TELEGRAM_TIMEOUT) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        # Отказ Telegram (4xx): причина — в теле ответа
        try:
            description = json.loads(e.read().decode("utf-8")).get("description", "")
        except Exception:
            description = ""
        if "blocked" in description:
            detail = "Пользователь заблокировал бота — сообщение не доставлено."
        elif "chat not found" in description:
            detail = "Пользователь ещё не запускал бота — написать ему нельзя."
        else:
            detail = description or "Telegram отклонил сообщение."
        raise HTTPException(status_code=502, detail=detail) from e
    except URLError as e:
        raise HTTPException(
            status_code=502, detail="Не удалось связаться с Telegram."
        ) from e
    if not result.get("ok"):
        raise HTTPException(
            status_code=502,
            detail=result.get("description", "Telegram отклонил сообщение."),
        )
    return result["result"]


@app.get("/admin/support", dependencies=[Depends(_require_admin)])
def admin_list_support_threads(limit: int = Query(default=100, le=500)):
    return {"threads": storage.list_support_threads(limit)}


@app.get("/admin/support/{telegram_user_id}", dependencies=[Depends(_require_admin)])
def admin_get_support_thread(telegram_user_id: int):
    """Переписка с пользователем; его сообщения отмечаются прочитанными."""
    thread = storage.get_support_thread(telegram_user_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Пользователь не найден.")
    return thread


@app.delete("/admin/support/{telegram_user_id}", dependencies=[Depends(_require_admin)])
def admin_delete_support_thread(telegram_user_id: int):
    """Удаляет всю переписку с пользователем (сам пользователь и платежи остаются)."""
    deleted = storage.delete_support_thread(telegram_user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Переписки с этим пользователем нет.")
    return {"status": "deleted", "messages": deleted}


@app.delete("/admin/support", dependencies=[Depends(_require_admin)])
def admin_cleanup_support(older_than_days: int = Query(ge=1, le=3650)):
    """Удаляет переписки без новых сообщений дольше указанного числа дней."""
    return storage.delete_old_support_threads(older_than_days)


@app.post(
    "/admin/support/{telegram_user_id}/reply", dependencies=[Depends(_require_admin)]
)
def admin_reply_support(telegram_user_id: int, data: SupportReplyRequest):
    text = data.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Пустое сообщение.")
    if not storage.get_support_thread(telegram_user_id, limit=1, mark_read=False):
        raise HTTPException(status_code=404, detail="Пользователь не найден.")

    # Сначала отправка в Telegram, потом запись: в переписке только доставленное
    sent = _send_bot_message(telegram_user_id, SUPPORT_REPLY_PREFIX + text)
    message = storage.add_outgoing_support_message(
        telegram_user_id, text, sent.get("message_id")
    )
    return {"message": message}


class ManualGrantRequest(BaseModel):
    telegram_user_id: int
    category_id: str  # id из content_categories, включая "daily_subscription"


@app.get("/admin/payments", dependencies=[Depends(_require_admin)])
def admin_list_payments(
    telegram_user_id: int | None = Query(default=None),
    status: str | None = Query(default=None, description="paid | refunded"),
    limit: int = Query(default=100, le=500),
):
    """Лог всех транзакций: оплаты Stars и ручные выдачи доступа."""
    return {"payments": storage.list_payments(telegram_user_id, status, limit)}


@app.post("/admin/payments/{payment_id}/refund", dependencies=[Depends(_require_admin)])
def admin_refund_payment(payment_id: int):
    payment = storage.get_payment(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Платёж не найден.")
    if payment["status"] == "refunded":
        raise HTTPException(status_code=400, detail="Платёж уже возвращён.")

    # Реальная оплата: сначала возврат Stars в Telegram, потом отзыв доступа у нас.
    # Ручная выдача (source="admin"): в Telegram не обращаемся.
    if payment["source"] == "telegram_stars":
        if not TELEGRAM_BOT_TOKEN:
            raise HTTPException(
                status_code=500, detail="TELEGRAM_BOT_TOKEN не задан на сервере."
            )
        if not payment["telegram_payment_charge_id"]:
            raise HTTPException(
                status_code=409,
                detail=(
                    "У этого платежа нет telegram_payment_charge_id — "
                    "возврат через Telegram невозможен."
                ),
            )
        request_body = json.dumps(
            {
                "user_id": payment["telegram_user_id"],
                "telegram_payment_charge_id": payment["telegram_payment_charge_id"],
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            TELEGRAM_REFUND_URL.format(token=TELEGRAM_BOT_TOKEN),
            data=request_body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=TELEGRAM_TIMEOUT) as response:
                result = json.loads(response.read().decode("utf-8"))
        except URLError as e:
            raise HTTPException(
                status_code=502,
                detail="Не удалось связаться с Telegram для возврата.",
            ) from e
        if not result.get("ok"):
            raise HTTPException(
                status_code=502,
                detail=result.get("description", "Telegram отклонил возврат."),
            )

    updated = storage.refund_payment(payment_id)
    return {"status": "refunded", "payment": updated}


@app.post("/admin/grant", dependencies=[Depends(_require_admin)])
def admin_grant_access(data: ManualGrantRequest):
    # Категория должна существовать; is_active не проверяем намеренно
    if not storage.get_category(data.category_id):
        raise HTTPException(status_code=404, detail="Неизвестная категория.")
    payment_id = storage.record_payment(
        telegram_user_id=data.telegram_user_id,
        category_id=data.category_id,
        amount=0,
        source="admin",
    )
    return {"status": "granted", "payment_id": payment_id}


class CategoryUpdateRequest(BaseModel):
    price_stars: int | None = None
    is_active: bool | None = None


@app.get("/admin/categories", dependencies=[Depends(_require_admin)])
def admin_list_categories():
    return {"categories": storage.list_categories()}


@app.patch("/admin/categories/{category_id}", dependencies=[Depends(_require_admin)])
def admin_update_category(category_id: str, data: CategoryUpdateRequest):
    try:
        updated = storage.update_category(
            category_id, price_stars=data.price_stars, is_active=data.is_active
        )
    except ValueError as e:
        detail = str(e)
        status_code = 404 if "не найдена" in detail else 400
        raise HTTPException(status_code=status_code, detail=detail) from e
    return {"category": updated}
