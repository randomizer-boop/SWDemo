"""
Логика Telegram-бота StarWise (aiogram 3.x). Апдейты приходят через вебхук
в api.py; здесь только Router и обработчики:

  /start              — кнопка запуска Mini App
  /support            — как написать в поддержку (также /paysupport, /start support)
  pre_checkout_query  — подтверждение платежа перед списанием
  successful_payment  — запись оплаты и выдача доступа (storage.record_payment)
  любое сообщение     — обращение в поддержку: сохраняется для админ-панели
"""

import logging
import os

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    PreCheckoutQuery,
    WebAppInfo,
)

import storage

logger = logging.getLogger("bot")

# URL фронтенда Mini App (env: MINI_APP_URL)
MINI_APP_URL = os.environ.get("MINI_APP_URL", "https://example.com")

# Длительность подписки, совпадает с SUBSCRIPTION_DAYS в api.py
SUBSCRIPTION_DAYS = 30

# Необязательно: чат (ID), куда пересылать обращения в поддержку (env: SUPPORT_CHAT_ID)
SUPPORT_CHAT_ID = os.environ.get("SUPPORT_CHAT_ID")

SUPPORT_PROMPT = (
    "Напиши свой вопрос одним сообщением прямо сюда — ответим в этом же чате.\n\n"
    "Если вопрос про оплату, укажи раздел и примерное время оплаты."
)
SUPPORT_ACK = "Сообщение получено ✦ Ответим здесь, в этом чате."
SUPPORT_ATTACHMENT_NOTE = (
    "\n\nВложения поддержка пока не видит — опиши, пожалуйста, главное текстом."
)
SUPPORT_SAVE_ERROR = (
    "Не получилось сохранить сообщение. Попробуй, пожалуйста, ещё раз чуть позже."
)
UNKNOWN_COMMAND = (
    "Такой команды нет.\n/start — открыть приложение\n/support — написать в поддержку"
)

# Подписи вложений в переписке (сам файл в админ-панели не показывается)
ATTACHMENT_LABELS = {
    "photo": "фото",
    "document": "файл",
    "video": "видео",
    "animation": "GIF",
    "voice": "голосовое сообщение",
    "video_note": "видеосообщение",
    "audio": "аудио",
    "sticker": "стикер",
}

router = Router()


@router.message(CommandStart(deep_link=True, magic=F.args == "support"))
@router.message(Command("support", "paysupport"))
async def handle_support_command(message: Message) -> None:
    await message.answer(SUPPORT_PROMPT)


@router.message(CommandStart())
async def handle_start(message: Message) -> None:
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✦ Построить натальную карту",
                    web_app=WebAppInfo(url=MINI_APP_URL),
                )
            ]
        ]
    )
    await message.answer(
        "Привет! Здесь можно построить свою натальную карту и получить "
        "разборы по ключевым сферам жизни — личность, отношения, карьера, "
        "финансы — плюс ежедневный прогноз по транзитам.\n\n"
        "Нажми кнопку ниже, чтобы начать.\n\n"
        "Есть вопрос — просто напиши его сюда или нажми /support.",
        reply_markup=keyboard,
    )


@router.pre_checkout_query()
async def handle_pre_checkout_query(pre_checkout_query: PreCheckoutQuery) -> None:
    # Счёт сформирован бэкендом с фиксированной ценой — просто подтверждаем
    await pre_checkout_query.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(message: Message) -> None:
    payment = message.successful_payment
    telegram_user_id = message.from_user.id
    # Формат payload: "category:timestamp" (см. create_invoice в api.py)
    category_id = payment.invoice_payload.split(":", 1)[0]

    try:
        # charge_id нужен для возврата Stars; сумма и дата окончания
        # подписки берутся из данных Telegram
        storage.record_payment(
            telegram_user_id=telegram_user_id,
            category_id=category_id,
            amount=payment.total_amount,
            currency=payment.currency,
            telegram_payment_charge_id=payment.telegram_payment_charge_id,
            telegram_username=message.from_user.username,
            telegram_first_name=message.from_user.first_name,
            telegram_language_code=message.from_user.language_code,
            source="telegram_stars",
            subscription_days=SUBSCRIPTION_DAYS,
            subscription_expires_at_unix=payment.subscription_expiration_date,
        )
    except storage.DuplicatePaymentError:
        # Повторная доставка того же платежа — пропускаем
        logger.info(
            "Повторная доставка уже обработанного платежа (charge_id=%s) — пропускаем.",
            payment.telegram_payment_charge_id,
        )
        return
    # PaymentStorageError не перехватываем: api.py ответит 500,
    # и Telegram повторит доставку

    if category_id == "daily_subscription":
        await message.answer(
            "Готово! Подписка на ежедневный прогноз активна 30 дней ✦"
        )
    else:
        await message.answer(
            "Готово! Разбор открыт — загляни в приложение, чтобы прочитать его ✦"
        )


# Обращение в поддержку — любое сообщение в личном чате, не попавшее в обработчики выше
@router.message(F.chat.type == "private")
async def handle_support_message(message: Message) -> None:
    text = (message.text or message.caption or "").strip()
    attachment = ATTACHMENT_LABELS.get(message.content_type)
    if not text and not attachment:
        return  # служебное сообщение Telegram

    if message.text and message.text.startswith("/"):
        await message.answer(UNKNOWN_COMMAND)
        return

    stored_text = f"[{attachment}] {text}".strip() if attachment else text
    try:
        result = storage.add_incoming_support_message(
            message.from_user.id,
            stored_text,
            message.message_id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            language_code=message.from_user.language_code,
        )
    except Exception:
        logger.exception("Не удалось сохранить сообщение в поддержку")
        await message.answer(SUPPORT_SAVE_ERROR)
        return

    if not result["is_new"]:
        return  # повторная доставка того же сообщения

    forwarded = False
    if SUPPORT_CHAT_ID:
        try:
            await message.forward(SUPPORT_CHAT_ID)
            forwarded = True
        except Exception:
            logger.warning("Не удалось переслать обращение в SUPPORT_CHAT_ID", exc_info=True)

    if result["should_ack"]:
        note = SUPPORT_ATTACHMENT_NOTE if attachment and not forwarded else ""
        await message.answer(SUPPORT_ACK + note)
