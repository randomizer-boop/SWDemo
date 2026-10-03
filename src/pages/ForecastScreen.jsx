import { useEffect, useState } from "react";
import StatusScreen, { classifyFetchError } from "../components/StatusScreen";
import { PAYMENTS_ENABLED } from "../lib/constants";
import { formatLongDate } from "../lib/format";
import { cardOfTheDay, todayDateKey } from "../lib/tarot";
import "./CategoryScreen.css"; // общие стили .cat-card / .paywall-*
import "./ForecastScreen.css";
import DemoPaywallNote from "../demo/DemoPaywallNote";
import { t, tx } from "../i18n";

// TODO: заменить на реальный вызов бэкенда (расчёт транзитов дня).
// Сейчас — имитация задержки и текст-заглушка.
async function fetchDailyForecast(chart) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    text: "Прогноз дня доступен в полной версии.",
  };
}

export default function ForecastScreen({
  chart,
  isSubscribed = false,
  isSubscribing = false,
  subscribeError = null,
  onSubscribe,
}) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isSubscribed) return;

    let active = true;
    setLoading(true);
    setContent(null);
    setLoadError(null);

    fetchDailyForecast(chart)
      .then((data) => {
        if (active) {
          setContent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setLoadError(err.message || "forecast_failed");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isSubscribed, chart, retryCount]);

  const today = formatLongDate();
  const card = cardOfTheDay(todayDateKey());

  return (
    <div className="screen screen-forecast step-enter">
      <div className="screen-body forecast-body">
        <header className="fc-header">
          <span className="hello">{t("Прогноз дня ✦")}</span>
          <h1>{today}</h1>
          <p className="fc-subtitle">
            {t("Транзиты быстрых планет к твоей натальной карте и карта Таро дня — обновляется каждый день.")}
          </p>
        </header>

        {isSubscribed ? (
          <SubscribedContent
            loading={loading}
            content={content}
            error={loadError}
            card={card}
            onRetry={() => setRetryCount((n) => n + 1)}
          />
        ) : (
          <SubscriptionPaywall
            isSubscribing={isSubscribing}
            subscribeError={subscribeError}
            onSubscribe={onSubscribe}
          />
        )}
      </div>
    </div>
  );
}

function SubscribedContent({ loading, content, error, card, onRetry }) {
  if (loading) {
    return (
      <div className="cat-card cat-loading">
        <span className="spark" aria-hidden="true">
          ✦
        </span>
        <p>{t("Смотрим сегодняшние транзиты…")}</p>
      </div>
    );
  }

  if (error) {
    const variant = classifyFetchError();
    return (
      <div className="cat-card cat-load-error">
        <span className="status-icon" aria-hidden="true">
          {variant === "offline" ? "📡" : "⚠️"}
        </span>
        <p>
          {variant === "offline"
            ? t("Нет подключения к интернету.")
            : t("Не получилось собрать прогноз — сервер не ответил.")}
        </p>
        <button type="button" className="btn-primary" onClick={onRetry}>
          {t("Повторить")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="cat-card cat-text">
        <p>{t(content?.text)}</p>
      </div>

      <div className="fc-tarot-card">
        <div className="fc-tarot-badge" aria-hidden="true">
          🃏
        </div>
        <div className="fc-tarot-body">
          <span className="fc-tarot-eyebrow">{t("Карта дня")}</span>
          <h3>{tx("tarot", card.name)}</h3>
          <p>{t("Соответствие:")} {t(card.correspondence)}</p>
        </div>
      </div>
    </>
  );
}

function SubscriptionPaywall({ isSubscribing, subscribeError, onSubscribe }) {
  // При PAYMENTS_ENABLED=false цена видна, но кнопка неактивна ("в разработке")
  return (
    <div className="cat-card paywall-card">
      <p className="paywall-blur-line" />
      <p className="paywall-blur-line short" />
      <p className="paywall-blur-line" />

      <div className="paywall-cta">
        <span className="paywall-lock" aria-hidden="true">
          🔒
        </span>
        <p className="paywall-hint">
          {t("Ежедневный прогноз по транзитам + карта Таро дня. Подписка продлевается автоматически, отменить можно в любой момент в настройках Telegram.")}
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={PAYMENTS_ENABLED ? onSubscribe : undefined}
          disabled={!PAYMENTS_ENABLED || isSubscribing}
        >
          {isSubscribing ? t("Открываем оплату…") : t("Оформить за 249 ⭐ / мес")}
        </button>

        {/* ДЕМО: вместо "оплата в разработке" — пояснение и ссылка на бота */}
        {!PAYMENTS_ENABLED && <DemoPaywallNote />}

        {subscribeError && <p className="paywall-error">{subscribeError}</p>}
      </div>
    </div>
  );
}
