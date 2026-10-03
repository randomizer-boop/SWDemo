// Настройки демо-версии (сайт-портфолио, без бэкенда)

// Ссылка на рабочего Telegram-бота. Вписать сюда (или задать переменную
// окружения VITE_BOT_URL в настройках Vercel). Пока пусто — кнопки
// "Открыть бота" не показываются.
export const BOT_URL = import.meta.env.VITE_BOT_URL || "";

// Имя демо-пользователя (в Telegram сюда подставляется first_name)
export const DEMO_USER_NAME = "Амина";

// Сколько "считается" карта в демо, мс (в проде — время ответа POST /calculate)
export const DEMO_CALC_DELAY_MS = 1800;

// Приложение открыто внутри рамки телефона на десктопной странице
export const IS_EMBEDDED = (() => {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("embed");
  } catch {
    return false;
  }
})();

// Ширина окна, с которой показываем страницу с рамкой телефона
export const DESKTOP_MIN_WIDTH = 900;
