// Настройки приложения (все опциональны, задаются через env)

// Юзернейм бота и short_name Mini App — для ссылки "поделиться приложением"
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || null;
const APP_SHORT_NAME = import.meta.env.VITE_APP_SHORT_NAME || null;

export const APP_SHARE_URL =
  BOT_USERNAME && APP_SHORT_NAME
    ? `https://t.me/${BOT_USERNAME}/${APP_SHORT_NAME}`
    : null;

// Ссылка на поддержку: по умолчанию — чат с ботом (команда /start support)
export const SUPPORT_URL =
  import.meta.env.VITE_SUPPORT_URL ||
  (BOT_USERNAME ? `https://t.me/${BOT_USERNAME}?start=support` : null);

// Контакты для Политики конфиденциальности и Условий использования.
// Вписать значения в кавычки (или задать через env).
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "";
export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || "";

// Версия приложения — показывается в профиле
export const APP_VERSION = "0.1.0 (MVP)";

// Флаг оплаты: при false кнопки покупки показывают цену, но не открывают инвойс
export const PAYMENTS_ENABLED = false;