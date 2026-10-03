import { useEffect, useState } from "react";
import { getCategory, FREE_TEASER_ID, FREE_TEASER } from "../categories";
import StatusScreen, { classifyFetchError } from "../components/StatusScreen";
import { PAYMENTS_ENABLED } from "../lib/constants";
import TeaserReading from "./TeaserReading";
import DemoPaywallNote from "../demo/DemoPaywallNote";
import { DEMO_TEASER } from "../demo/demoData";
import { t, getLang } from "../i18n";
import "./CategoryScreen.css";

// ДЕМО: в проде здесь вызов бэкенда (POST /interpret). В демо бесплатный
// разбор "Кто ты" — готовый текст для демо-профиля; платные закрыты пейволлом.
async function fetchInterpretation(category) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (category.id === FREE_TEASER_ID) {
    return { reading: DEMO_TEASER };
  }
  return { text: "Разбор доступен в полной версии." };
}

export default function CategoryScreen({
  chart,
  categoryId,
  unlockedCategoryIds = [],
  isUnlocking = false,
  unlockError = null,
  onBack,
  onUnlock,
  onOpenCategory,
}) {
  // Бесплатный тизер не входит в CATEGORIES — подставляется по зарезервированному id
  const category =
    categoryId === FREE_TEASER_ID ? FREE_TEASER : getCategory(categoryId);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Открыто, если категория бесплатная или уже куплена
  const unlocked = category
    ? !category.locked || unlockedCategoryIds.includes(category.id)
    : false;

  useEffect(() => {
    if (!unlocked || !category) return;

    let active = true;
    setLoading(true);
    setContent(null);
    setLoadError(null);

    fetchInterpretation(category, chart)
      .then((data) => {
        if (active) {
          setContent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setLoadError(err.message || "interpretation_failed");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [category, unlocked, chart, retryCount]);

  // Неизвестный categoryId — понятный экран вместо пустоты
  if (!category) {
    return (
      <StatusScreen
        variant="notFound"
        onAction={onBack}
        actionLabel={t("На главную")}
      />
    );
  }

  return (
    <div className="screen screen-category step-enter">
      <div className="screen-body category-body">
        <div className="cat-header">
          <button
            type="button"
            className="icon-back"
            onClick={onBack}
            aria-label={t("Назад")}
          >
            ‹
          </button>

          <img
            className="cat-header-icon"
            src={category.icon}
            alt=""
            aria-hidden="true"
          />
        </div>

        <h1 className="cat-title">{t(category.name)}</h1>
        <p className="cat-subtitle">{t(category.teaser)}</p>

        {unlocked ? (
          <UnlockedContent
            loading={loading}
            content={content}
            error={loadError}
            chart={chart}
            onRetry={() => setRetryCount((n) => n + 1)}
            onOpenFull={
              category.id === FREE_TEASER_ID && onOpenCategory
                ? () => onOpenCategory("personality")
                : null
            }
          />
        ) : (
          <Paywall
            category={category}
            isUnlocking={isUnlocking}
            unlockError={unlockError}
            onUnlock={() => onUnlock(category)}
          />
        )}
      </div>
    </div>
  );
}

function UnlockedContent({ loading, content, error, chart, onRetry, onOpenFull }) {
  if (loading) {
    return (
      <div className="cat-card cat-loading">
        <span className="spark" aria-hidden="true">
          ✦
        </span>
        <p>{t("Собираем разбор по твоей карте…")}</p>
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
            : t("Не получилось собрать разбор — сервер не ответил.")}
        </p>
        <button type="button" className="btn-primary" onClick={onRetry}>
          {t("Повторить")}
        </button>
      </div>
    );
  }

  // Разбор "Кто ты": интерактивный портрет по трём точкам (на языке интерфейса)
  if (content?.reading) {
    const reading = content.reading[getLang()] || content.reading.ru;
    return (
      <TeaserReading reading={reading} chart={chart} onOpenFull={onOpenFull} />
    );
  }

  return (
    <div className="cat-card cat-text">
      <p>{t(content?.text)}</p>
    </div>
  );
}

function Paywall({ category, isUnlocking, unlockError, onUnlock }) {
  // При PAYMENTS_ENABLED=false цена видна, но кнопка неактивна
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
          {t("Открой полный разбор «{name}»", {
            name: t(category.name).toLowerCase(),
          })}
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={PAYMENTS_ENABLED ? onUnlock : undefined}
          disabled={!PAYMENTS_ENABLED || isUnlocking}
        >
          {isUnlocking
            ? t("Открываем оплату…")
            : t("Открыть за {price} ⭐", { price: category.price })}
        </button>

        {/* ДЕМО: вместо "оплата в разработке" — пояснение и ссылка на бота */}
        {!PAYMENTS_ENABLED && <DemoPaywallNote />}

        {unlockError && <p className="paywall-error">{unlockError}</p>}
      </div>
    </div>
  );
}
