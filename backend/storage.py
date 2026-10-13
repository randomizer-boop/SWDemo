"""
Серверное хранилище (PostgreSQL / Neon, psycopg2).

Таблицы:
  users              — пользователи Telegram и их профиль
  content_categories — каталог того, что можно купить (цена, описание, активность)
  payments           — лог транзакций (оплата Stars или ручная выдача админом)
  user_entitlements  — текущий доступ: одна строка на (пользователь, категория);
                       expires_at NULL — бессрочно, иначе подписка
  birth_profiles     — данные рождения и рассчитанная карта пользователя
                       (чтобы приложение не начинало с онбординга заново)
  support_messages   — переписка с поддержкой через бота: direction 'in' —
                       сообщение пользователя, 'out' — ответ из админ-панели

Используется в bot.py (платежи, сообщения в поддержку) и api.py
(/purchases, /profile, /admin/*).
"""

import os
from contextlib import contextmanager
from typing import Optional

import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get("DATABASE_URL")


@contextmanager
def _connect():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL не задан — нужна pooled connection string от "
            "Neon (Dashboard -> Connection Details -> переключатель "
            "'Pooled connection'). Без неё хранилище покупок работать "
            "не может."
        )
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Создаёт таблицы, индексы и стартовый каталог (идемпотентно)."""
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                telegram_user_id BIGINT NOT NULL UNIQUE,
                username TEXT,
                first_name TEXT,
                language_code TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_seen_at TIMESTAMPTZ
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS content_categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price_stars INTEGER,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id),
                category_id TEXT NOT NULL REFERENCES content_categories(id),
                amount INTEGER NOT NULL,
                currency TEXT NOT NULL DEFAULT 'XTR',
                telegram_payment_charge_id TEXT UNIQUE,
                status TEXT NOT NULL DEFAULT 'paid',
                source TEXT NOT NULL DEFAULT 'telegram_stars',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                refunded_at TIMESTAMPTZ
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS user_entitlements (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category_id TEXT NOT NULL REFERENCES content_categories(id),
                payment_id BIGINT REFERENCES payments(id),
                granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                expires_at TIMESTAMPTZ,
                UNIQUE (user_id, category_id)
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS birth_profiles (
                user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                birth_data JSONB NOT NULL,
                chart JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS support_messages (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                direction TEXT NOT NULL,
                text TEXT NOT NULL,
                telegram_message_id BIGINT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                read_at TIMESTAMPTZ
            )
            """
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_support_user_id ON support_messages (user_id, id)"
        )
        # Быстрый подсчёт непрочитанных (индекс только по непрочитанным входящим)
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_support_unread
            ON support_messages (user_id)
            WHERE direction = 'in' AND read_at IS NULL
            """
        )
        # Защита от повторной доставки одного и того же сообщения Telegram
        cur.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS idx_support_incoming_unique
            ON support_messages (user_id, telegram_message_id)
            WHERE direction = 'in'
            """
        )
        # Индексы по FK-колонкам (Postgres не создаёт их автоматически)
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id)"
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON user_entitlements (user_id)"
        )
        # Стартовый каталог; ON CONFLICT DO NOTHING — не затирает изменённые цены
        cur.execute(
            """
            INSERT INTO content_categories (id, name, description, price_stars, is_active)
            VALUES
                ('personality', 'Личность',
                 'Полный разбор личности: Солнце, Луна, Асцендент, управитель ASC, Меркурий',
                 149, TRUE),
                ('love', 'Отношения',
                 'Как ты влюбляешься и что притягивает: Венера, Марс, Луна, 7 дом',
                 149, TRUE),
                ('career', 'Карьера',
                 'MC, предназначение и путь: управитель MC, Сатурн, Северный узел',
                 149, TRUE),
                ('money', 'Финансы',
                 'Склад характера в деньгах: 2 и 8 дома, Венера, Юпитер, Сатурн',
                 149, TRUE),
                ('daily_subscription', 'Ежедневный прогноз + Таро',
                 'Прогноз дня по транзитам к твоей карте и карта Таро дня — каждый день',
                 249, TRUE)
            ON CONFLICT (id) DO NOTHING
            """
        )
        cur.close()


def _get_or_create_user(
    cur,
    telegram_user_id: int,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    language_code: Optional[str] = None,
) -> int:
    """Возвращает внутренний users.id, создавая пользователя при первом
    появлении; уже известные поля профиля пустыми не затирает."""
    cur.execute(
        """
        INSERT INTO users (telegram_user_id, username, first_name, language_code, last_seen_at)
        VALUES (%s, %s, %s, %s, NOW())
        ON CONFLICT (telegram_user_id) DO UPDATE SET
            username = COALESCE(EXCLUDED.username, users.username),
            first_name = COALESCE(EXCLUDED.first_name, users.first_name),
            language_code = COALESCE(EXCLUDED.language_code, users.language_code),
            updated_at = NOW(),
            last_seen_at = NOW()
        RETURNING id
        """,
        (telegram_user_id, username, first_name, language_code),
    )
    return cur.fetchone()[0]


# ===========================================================================
# ПРОФИЛЬ: ДАННЫЕ РОЖДЕНИЯ И РАССЧИТАННАЯ КАРТА
# ===========================================================================

def load_birth_profile(
    telegram_user_id: int,
    *,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    language_code: Optional[str] = None,
) -> Optional[dict]:
    """Отмечает визит пользователя (создаёт его при первом входе) и возвращает
    сохранённый профиль {"birth_data", "chart", "updated_at": unix-мс} или None."""
    with _connect() as conn:
        cur = conn.cursor()
        user_id = _get_or_create_user(
            cur, telegram_user_id, username, first_name, language_code
        )
        cur.execute(
            """
            SELECT birth_data, chart, (EXTRACT(EPOCH FROM updated_at) * 1000)::BIGINT
            FROM birth_profiles
            WHERE user_id = %s
            """,
            (user_id,),
        )
        row = cur.fetchone()
        cur.close()
    if not row:
        return None
    return {"birth_data": row[0], "chart": row[1], "updated_at": int(row[2])}


def save_birth_profile(
    telegram_user_id: int,
    birth_data: dict,
    chart: dict,
    *,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    language_code: Optional[str] = None,
) -> int:
    """Сохраняет или заменяет данные рождения и карту пользователя.
    Возвращает updated_at (unix-мс)."""
    with _connect() as conn:
        cur = conn.cursor()
        user_id = _get_or_create_user(
            cur, telegram_user_id, username, first_name, language_code
        )
        cur.execute(
            """
            INSERT INTO birth_profiles (user_id, birth_data, chart)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id) DO UPDATE SET
                birth_data = EXCLUDED.birth_data,
                chart = EXCLUDED.chart,
                updated_at = NOW()
            RETURNING (EXTRACT(EPOCH FROM updated_at) * 1000)::BIGINT
            """,
            (user_id, psycopg2.extras.Json(birth_data), psycopg2.extras.Json(chart)),
        )
        updated_at = cur.fetchone()[0]
        cur.close()
    return int(updated_at)


def delete_birth_profile(telegram_user_id: int) -> bool:
    """Удаляет сохранённые данные рождения и карту пользователя (платежи и
    доступ не трогает). Возвращает True, если профиль был."""
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            DELETE FROM birth_profiles
            WHERE user_id = (SELECT id FROM users WHERE telegram_user_id = %s)
            """,
            (telegram_user_id,),
        )
        deleted = cur.rowcount > 0
        cur.close()
    return deleted


# ===========================================================================
# КАТАЛОГ КАТЕГОРИЙ
# ===========================================================================

def list_categories(include_inactive: bool = True) -> list[dict]:
    query = "SELECT * FROM content_categories"
    if not include_inactive:
        query += " WHERE is_active = TRUE"
    query += " ORDER BY id"
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
    return [dict(row) for row in rows]


def get_category(category_id: str) -> Optional[dict]:
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM content_categories WHERE id = %s", (category_id,))
        row = cur.fetchone()
        cur.close()
    return dict(row) if row else None


def update_category(
    category_id: str,
    *,
    price_stars: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> dict:
    """Частичное обновление категории. Бросает ValueError, если категории
    нет или не передано ни одного поля."""
    fields = []
    params: list = []
    if price_stars is not None:
        fields.append("price_stars = %s")
        params.append(price_stars)
    if is_active is not None:
        fields.append("is_active = %s")
        params.append(is_active)
    if not fields:
        raise ValueError("Нужно передать хотя бы price_stars или is_active.")
    params.append(category_id)

    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            f"UPDATE content_categories SET {', '.join(fields)} WHERE id = %s RETURNING *",
            params,
        )
        row = cur.fetchone()
        cur.close()
    if not row:
        raise ValueError(f"Категория {category_id!r} не найдена.")
    return dict(row)


# ===========================================================================
# ПЛАТЕЖИ И ДОСТУП
# ===========================================================================

class DuplicatePaymentError(Exception):
    """Платёж с таким telegram_payment_charge_id уже записан
    (повторная доставка от Telegram)."""


class PaymentStorageError(Exception):
    """Временный сбой БД при записи платежа — api.py отвечает 500,
    чтобы Telegram повторил доставку."""


def get_payment_by_charge_id(telegram_payment_charge_id: str) -> Optional[dict]:
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT * FROM payments WHERE telegram_payment_charge_id = %s",
            (telegram_payment_charge_id,),
        )
        row = cur.fetchone()
        cur.close()
    return dict(row) if row else None


def record_payment(
    telegram_user_id: int,
    category_id: str,
    amount: int,
    *,
    currency: str = "XTR",
    telegram_payment_charge_id: Optional[str] = None,
    telegram_username: Optional[str] = None,
    telegram_first_name: Optional[str] = None,
    telegram_language_code: Optional[str] = None,
    source: str = "telegram_stars",
    subscription_days: Optional[int] = None,
    subscription_expires_at_unix: Optional[int] = None,
) -> int:
    """Пишет транзакцию в payments и выдаёт доступ в user_entitlements.
    Возвращает id записи в payments.

    source: "telegram_stars" — реальная оплата, "admin" — ручная выдача.
    Срок подписки: subscription_expires_at_unix (дата от Telegram),
    иначе subscription_days.

    Бросает DuplicatePaymentError и PaymentStorageError.
    """
    try:
        with _connect() as conn:
            cur = conn.cursor()
            user_id = _get_or_create_user(
                cur, telegram_user_id, telegram_username, telegram_first_name,
                telegram_language_code,
            )

            cur.execute(
                """
                INSERT INTO payments
                    (user_id, category_id, amount, currency, telegram_payment_charge_id, status, source)
                VALUES (%s, %s, %s, %s, %s, 'paid', %s)
                RETURNING id
                """,
                (user_id, category_id, amount, currency, telegram_payment_charge_id, source),
            )
            payment_id = cur.fetchone()[0]

            if category_id == "daily_subscription":
                if subscription_expires_at_unix is not None:
                    cur.execute(
                        """
                        INSERT INTO user_entitlements (user_id, category_id, payment_id, granted_at, expires_at)
                        VALUES (%s, %s, %s, NOW(), to_timestamp(%s))
                        ON CONFLICT (user_id, category_id) DO UPDATE SET
                            payment_id = EXCLUDED.payment_id,
                            granted_at = EXCLUDED.granted_at,
                            expires_at = EXCLUDED.expires_at
                        """,
                        (user_id, category_id, payment_id, subscription_expires_at_unix),
                    )
                else:
                    days = subscription_days or 30
                    cur.execute(
                        """
                        INSERT INTO user_entitlements (user_id, category_id, payment_id, granted_at, expires_at)
                        VALUES (%s, %s, %s, NOW(), NOW() + make_interval(days => %s))
                        ON CONFLICT (user_id, category_id) DO UPDATE SET
                            payment_id = EXCLUDED.payment_id,
                            granted_at = EXCLUDED.granted_at,
                            expires_at = EXCLUDED.expires_at
                        """,
                        (user_id, category_id, payment_id, days),
                    )
            else:
                cur.execute(
                    """
                    INSERT INTO user_entitlements (user_id, category_id, payment_id, granted_at, expires_at)
                    VALUES (%s, %s, %s, NOW(), NULL)
                    ON CONFLICT (user_id, category_id) DO UPDATE SET
                        payment_id = EXCLUDED.payment_id,
                        granted_at = EXCLUDED.granted_at,
                        expires_at = EXCLUDED.expires_at
                    """,
                    (user_id, category_id, payment_id),
                )
            cur.close()
        return payment_id
    except psycopg2.errors.UniqueViolation:
        # Транзакция откатилась — в новом соединении проверяем, не дубликат ли это
        if telegram_payment_charge_id:
            existing = get_payment_by_charge_id(telegram_payment_charge_id)
            if existing:
                raise DuplicatePaymentError(
                    f"Платёж с charge_id={telegram_payment_charge_id!r} "
                    f"уже записан ранее (payment_id={existing['id']})."
                ) from None
        # Другое нарушение UNIQUE — пробрасываем как есть
        raise
    except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
        # Временный сбой соединения с БД
        raise PaymentStorageError(str(e)) from e


def get_unlocked_categories(telegram_user_id: int) -> list[str]:
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT ue.category_id
            FROM user_entitlements ue
            JOIN users u ON u.id = ue.user_id
            WHERE u.telegram_user_id = %s
              AND ue.category_id != 'daily_subscription'
              AND (ue.expires_at IS NULL OR ue.expires_at > NOW())
            """,
            (telegram_user_id,),
        )
        rows = cur.fetchall()
        cur.close()
    return [row[0] for row in rows]


def get_subscription(telegram_user_id: int) -> Optional[dict]:
    """None — подписки не было. Иначе {"expires_at": unix-секунды,
    "active": bool} (формат ожидает фронтенд)."""
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT EXTRACT(EPOCH FROM ue.expires_at)::BIGINT, (ue.expires_at > NOW())
            FROM user_entitlements ue
            JOIN users u ON u.id = ue.user_id
            WHERE u.telegram_user_id = %s AND ue.category_id = 'daily_subscription'
            """,
            (telegram_user_id,),
        )
        row = cur.fetchone()
        cur.close()
    if not row or row[0] is None:
        return None
    expires_at, active = row
    return {"expires_at": int(expires_at), "active": bool(active)}


def get_payment(payment_id: int) -> Optional[dict]:
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            SELECT p.*, u.telegram_user_id, u.username, u.first_name,
                   c.name AS category_name
            FROM payments p
            JOIN users u ON u.id = p.user_id
            JOIN content_categories c ON c.id = p.category_id
            WHERE p.id = %s
            """,
            (payment_id,),
        )
        row = cur.fetchone()
        cur.close()
    return dict(row) if row else None


def list_payments(
    telegram_user_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 100,
) -> list[dict]:
    """Лог платежей для админки (свежие первыми).
    Фильтры: telegram_user_id, status ("paid" / "refunded")."""
    query = """
        SELECT p.*, u.telegram_user_id, u.username, u.first_name,
               c.name AS category_name
        FROM payments p
        JOIN users u ON u.id = p.user_id
        JOIN content_categories c ON c.id = p.category_id
        WHERE 1=1
    """
    params: list = []
    if telegram_user_id is not None:
        query += " AND u.telegram_user_id = %s"
        params.append(telegram_user_id)
    if status is not None:
        query += " AND p.status = %s"
        params.append(status)
    query += " ORDER BY p.created_at DESC LIMIT %s"
    params.append(limit)

    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
    return [dict(row) for row in rows]


def refund_payment(payment_id: int) -> dict:
    """Помечает платёж возвращённым и отзывает выданный им доступ.
    К Telegram не обращается — возврат Stars делается до вызова (см. api.py).
    Бросает ValueError, если платежа нет или он уже возвращён."""
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            SELECT p.*, u.telegram_user_id
            FROM payments p
            JOIN users u ON u.id = p.user_id
            WHERE p.id = %s
            """,
            (payment_id,),
        )
        payment = cur.fetchone()
        if not payment:
            raise ValueError(f"Платёж {payment_id} не найден.")
        if payment["status"] == "refunded":
            raise ValueError(f"Платёж {payment_id} уже возвращён.")

        cur.execute(
            """
            UPDATE payments SET status = 'refunded', refunded_at = NOW()
            WHERE id = %s
            RETURNING refunded_at
            """,
            (payment_id,),
        )
        refunded_at = cur.fetchone()["refunded_at"]

        cur.execute(
            """
            DELETE FROM user_entitlements
            WHERE user_id = %s AND category_id = %s AND payment_id = %s
            """,
            (payment["user_id"], payment["category_id"], payment_id),
        )
        cur.close()

    refunded = dict(payment)
    refunded["status"] = "refunded"
    refunded["refunded_at"] = refunded_at
    return refunded


# ===========================================================================
# АДМИНКА: СВОДКА И ПОЛЬЗОВАТЕЛИ
# ===========================================================================

def get_overview() -> dict:
    """Сводные цифры для админ-панели."""
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM users) AS users,
                (SELECT COUNT(*) FROM birth_profiles) AS profiles,
                (SELECT COUNT(*) FROM payments
                  WHERE status = 'paid' AND source = 'telegram_stars') AS paid_payments,
                (SELECT COALESCE(SUM(amount), 0) FROM payments
                  WHERE status = 'paid' AND source = 'telegram_stars') AS stars_total,
                (SELECT COUNT(*) FROM payments WHERE status = 'refunded') AS refunded_payments,
                (SELECT COUNT(*) FROM payments
                  WHERE status = 'paid' AND source = 'admin') AS manual_grants,
                (SELECT COUNT(*) FROM user_entitlements
                  WHERE category_id = 'daily_subscription'
                    AND expires_at > NOW()) AS active_subscriptions,
                (SELECT COUNT(*) FROM support_messages
                  WHERE direction = 'in' AND read_at IS NULL) AS support_unread
            """
        )
        row = cur.fetchone()
        cur.close()
    return {key: int(value) for key, value in row.items()}


def list_users(search: Optional[str] = None, limit: int = 100) -> list[dict]:
    """Пользователи для админ-панели (последние по визиту первыми): профиль
    Telegram, есть ли сохранённая карта, действующий доступ, сумма оплат.
    search — Telegram ID целиком либо часть username / имени."""
    query = """
        SELECT u.id, u.telegram_user_id, u.username, u.first_name, u.language_code,
               u.created_at, u.last_seen_at,
               (bp.user_id IS NOT NULL) AS has_profile,
               COALESCE((
                   SELECT json_agg(json_build_object(
                              'category_id', ue.category_id,
                              'expires_at', ue.expires_at
                          ) ORDER BY ue.category_id)
                   FROM user_entitlements ue
                   WHERE ue.user_id = u.id
                     AND (ue.expires_at IS NULL OR ue.expires_at > NOW())
               ), '[]'::json) AS entitlements,
               (SELECT COALESCE(SUM(p.amount), 0) FROM payments p
                 WHERE p.user_id = u.id AND p.status = 'paid'
                   AND p.source = 'telegram_stars') AS stars_paid
        FROM users u
        LEFT JOIN birth_profiles bp ON bp.user_id = u.id
    """
    params: list = []
    if search:
        term = search.strip().lstrip("@")
        query += """
        WHERE u.telegram_user_id::TEXT = %s
           OR u.username ILIKE %s
           OR u.first_name ILIKE %s
        """
        params += [term, f"%{term}%", f"%{term}%"]
    query += " ORDER BY COALESCE(u.last_seen_at, u.created_at) DESC LIMIT %s"
    params.append(limit)

    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
    return [dict(row) for row in rows]


# ===========================================================================
# ПОДДЕРЖКА: ПЕРЕПИСКА ЧЕРЕЗ БОТА
# ===========================================================================

# Подтверждение «сообщение получено» шлём не чаще раза за этот интервал
SUPPORT_ACK_INTERVAL_MINUTES = 10


def add_incoming_support_message(
    telegram_user_id: int,
    text: str,
    telegram_message_id: int,
    *,
    username: Optional[str] = None,
    first_name: Optional[str] = None,
    language_code: Optional[str] = None,
) -> dict:
    """Сохраняет сообщение пользователя в поддержку. Возвращает
    {"is_new": bool, "should_ack": bool}: is_new False — Telegram доставил то же
    сообщение повторно; should_ack — стоит ли ответить «сообщение получено»."""
    with _connect() as conn:
        cur = conn.cursor()
        user_id = _get_or_create_user(
            cur, telegram_user_id, username, first_name, language_code
        )
        cur.execute(
            """
            SELECT direction, created_at > NOW() - make_interval(mins => %s)
            FROM support_messages
            WHERE user_id = %s
            ORDER BY id DESC
            LIMIT 1
            """,
            (SUPPORT_ACK_INTERVAL_MINUTES, user_id),
        )
        previous = cur.fetchone()
        cur.execute(
            """
            INSERT INTO support_messages (user_id, direction, text, telegram_message_id)
            VALUES (%s, 'in', %s, %s)
            ON CONFLICT (user_id, telegram_message_id) WHERE direction = 'in' DO NOTHING
            RETURNING id
            """,
            (user_id, text, telegram_message_id),
        )
        is_new = cur.fetchone() is not None
        cur.close()
    recent_incoming = bool(previous and previous[0] == "in" and previous[1])
    return {"is_new": is_new, "should_ack": is_new and not recent_incoming}


def add_outgoing_support_message(
    telegram_user_id: int, text: str, telegram_message_id: Optional[int] = None
) -> dict:
    """Сохраняет ответ поддержки (уже отправленный пользователю через бота)."""
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            INSERT INTO support_messages (user_id, direction, text, telegram_message_id)
            SELECT id, 'out', %s, %s FROM users WHERE telegram_user_id = %s
            RETURNING id, direction, text, created_at
            """,
            (text, telegram_message_id, telegram_user_id),
        )
        row = cur.fetchone()
        cur.close()
    if not row:
        raise ValueError(f"Пользователь {telegram_user_id} не найден.")
    return dict(row)


def list_support_threads(limit: int = 100) -> list[dict]:
    """Переписки для админ-панели (с последним сообщением, свежие первыми)."""
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Последнее сообщение каждой переписки ищем по индексу (user_id, id):
        # скорость не зависит от числа пользователей без обращений
        cur.execute(
            """
            SELECT u.telegram_user_id, u.username, u.first_name,
                   last.text AS last_text,
                   last.direction AS last_direction,
                   last.created_at AS last_at,
                   (SELECT COUNT(*) FROM support_messages m
                     WHERE m.user_id = last.user_id AND m.direction = 'in'
                       AND m.read_at IS NULL) AS unread
            FROM (
                SELECT MAX(id) AS id
                FROM support_messages
                GROUP BY user_id
                ORDER BY 1 DESC
                LIMIT %s
            ) newest
            JOIN support_messages last ON last.id = newest.id
            JOIN users u ON u.id = last.user_id
            ORDER BY last.id DESC
            """,
            (limit,),
        )
        rows = cur.fetchall()
        cur.close()
    return [dict(row) for row in rows]


def delete_support_thread(telegram_user_id: int) -> int:
    """Удаляет всю переписку с пользователем. Возвращает число удалённых сообщений."""
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            DELETE FROM support_messages
            WHERE user_id = (SELECT id FROM users WHERE telegram_user_id = %s)
            """,
            (telegram_user_id,),
        )
        deleted = cur.rowcount
        cur.close()
    return deleted


def delete_old_support_threads(older_than_days: int) -> dict:
    """Удаляет переписки, в которых не было сообщений дольше older_than_days дней.
    Возвращает {"threads": число переписок, "messages": число сообщений}."""
    with _connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """
            WITH stale AS (
                SELECT user_id
                FROM support_messages
                GROUP BY user_id
                HAVING MAX(created_at) < NOW() - make_interval(days => %s)
            ),
            deleted AS (
                DELETE FROM support_messages m
                USING stale
                WHERE m.user_id = stale.user_id
                RETURNING m.user_id
            )
            SELECT COUNT(DISTINCT user_id), COUNT(*) FROM deleted
            """,
            (older_than_days,),
        )
        threads, messages = cur.fetchone()
        cur.close()
    return {"threads": int(threads), "messages": int(messages)}


def get_support_thread(
    telegram_user_id: int, *, limit: int = 300, mark_read: bool = True
) -> Optional[dict]:
    """Переписка с одним пользователем: {"user": {...}, "messages": [...]}
    (последние limit сообщений, от старых к новым). None — пользователя нет.
    mark_read — отметить его сообщения прочитанными."""
    with _connect() as conn:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            """
            SELECT id, telegram_user_id, username, first_name
            FROM users
            WHERE telegram_user_id = %s
            """,
            (telegram_user_id,),
        )
        user = cur.fetchone()
        if not user:
            cur.close()
            return None
        cur.execute(
            """
            SELECT * FROM (
                SELECT id, direction, text, created_at
                FROM support_messages
                WHERE user_id = %s
                ORDER BY id DESC
                LIMIT %s
            ) recent
            ORDER BY id
            """,
            (user["id"], limit),
        )
        messages = [dict(row) for row in cur.fetchall()]
        if mark_read:
            cur.execute(
                """
                UPDATE support_messages SET read_at = NOW()
                WHERE user_id = %s AND direction = 'in' AND read_at IS NULL
                """,
                (user["id"],),
            )
        cur.close()
    user = dict(user)
    user.pop("id")
    return {"user": user, "messages": messages}
