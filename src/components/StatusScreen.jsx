import "./StatusScreen.css";
import { t } from "../i18n";

// Единый экран "нештатных" состояний: нет сети, ошибка сервера, ничего не найдено

const VARIANTS = {
  offline: {
    icon: "📡",
    title: "Нет подключения к интернету",
    text: "Проверь связь и попробуй ещё раз.",
    actionLabel: "Повторить",
  },
  server: {
    icon: "⚠️",
    title: "Сервер сейчас недоступен",
    text: "Мы уже знаем о проблеме. Попробуй ещё раз через минуту.",
    actionLabel: "Повторить",
  },
  notFound: {
    icon: "🔍",
    title: "Ничего не нашли",
    text: "Этот раздел недоступен или ссылка устарела.",
    actionLabel: "На главную",
  },
  generic: {
    icon: "✦",
    title: "Что-то пошло не так",
    text: "Попробуй ещё раз.",
    actionLabel: "Повторить",
  },
};

export default function StatusScreen({
  variant = "generic",
  title,
  text,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  const preset = VARIANTS[variant] || VARIANTS.generic;

  return (
    <div className="screen step-enter screen-status">
      <div className="screen-body status-center">
        <span className="status-icon" aria-hidden="true">
          {preset.icon}
        </span>

        <h2 className="status-title">{title || t(preset.title)}</h2>
        <p className="status-text">{text || t(preset.text)}</p>

        {onAction && (
          <button type="button" className="btn-primary" onClick={onAction}>
            {actionLabel || t(preset.actionLabel)}
          </button>
        )}

        {onSecondary && (
          <button type="button" className="btn-ghost" onClick={onSecondary}>
            {secondaryLabel || t("Назад")}
          </button>
        )}
      </div>
    </div>
  );
}

// Общий экран загрузки
export function LoadingScreen({ title, text }) {
  return (
    <div className="screen step-enter screen-status">
      <div className="screen-body status-center">
        <span className="status-spinner" aria-hidden="true" />
        <h2 className="status-title">{title || t("Загрузка…")}</h2>
        {text && <p className="status-text">{text}</p>}
      </div>
    </div>
  );
}

// Вариант StatusScreen по ошибке fetch: "offline" (нет сети) или "server"
export function classifyFetchError() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "offline";
  }
  return "server";
}
