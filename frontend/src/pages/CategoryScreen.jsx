import { useEffect, useState } from "react";
import { getCategory } from "../categories";
import StatusScreen, { classifyFetchError } from "../components/StatusScreen";
import { PAYMENTS_ENABLED } from "../lib/constants";
import DemoPaywallNote from "../demo/DemoPaywallNote";
import { t, getLang } from "../i18n";
import "./CategoryScreen.css";
import Icon from "../components/Icon";
import PurchaseConsent from "../components/PurchaseConsent";

// ДЕМО: в проде здесь вызов бэкенда (POST /interpret). В демо бесплатный
// разбор "Кто ты" — готовый текст для демо-профиля; платные закрыты пейволлом.
async function fetchInterpretation(category) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  // ДЕМО: платные разборы закрыты, тексты есть только в полной версии
  return { text: t("Разбор доступен в полной версии.") };
}

export default function CategoryScreen({
  chart,
  categoryId,
  unlockedCategoryIds = [],
  isUnlocking = false,
  unlockError = null,
  onBack,
  onUnlock,
  onOpenLegal,
}) {
  // Бесплатный тизер «Кто ты» сюда не попадает — у него свой экран (WhoYouAreScreen)
  const category = getCategory(categoryId);

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
            onRetry={() => setRetryCount((n) => n + 1)}
          />
        ) : (
          <Paywall
            category={category}
            isUnlocking={isUnlocking}
            unlockError={unlockError}
            onUnlock={() => onUnlock(category)}
            onOpenLegal={onOpenLegal}
          />
        )}
      </div>
    </div>
  );
}

function UnlockedContent({ loading, content, error, onRetry }) {
  if (loading) {
    return (
      <div className="cat-card cat-loading">
        <span className="spark" aria-hidden="true">
          <Icon name="spark" />
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
          <Icon name={variant === "offline" ? "offline" : "warning"} />
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

  return (
    <div className="cat-card cat-text">
      <p>{t(content?.text)}</p>
    </div>
  );
}

function Paywall({ category, isUnlocking, unlockError, onUnlock, onOpenLegal }) {
  // При PAYMENTS_ENABLED=false цена видна, но кнопка неактивна ("в разработке")
  return (
    <div className="cat-card paywall-card">
      <p className="paywall-blur-line" />
      <p className="paywall-blur-line short" />
      <p className="paywall-blur-line" />

      <div className="paywall-cta">
        <span className="paywall-lock" aria-hidden="true">
          <Icon name="lock" />
        </span>
        <p className="paywall-hint">
          {t("Открой полный разбор «{name}»", {
            // В английском название с заглавной: “Personality”
            name: getLang() === "en" ? t(category.name) : t(category.name).toLowerCase(),
          })}
        </p>

        <PurchaseConsent onOpenLegal={onOpenLegal} />

        <button
          type="button"
          className="btn-primary"
          onClick={PAYMENTS_ENABLED ? onUnlock : undefined}
          disabled={!PAYMENTS_ENABLED || isUnlocking}
        >
          {isUnlocking ? (
            t("Открываем оплату…")
          ) : (
            <>
              {t("Открыть за {price}", { price: category.price })} <Icon name="star" />
            </>
          )}
        </button>

        {/* ДЕМО: вместо "оплата в разработке" — пояснение и ссылка на бота */}
        {!PAYMENTS_ENABLED && <DemoPaywallNote />}

        {unlockError && <p className="paywall-error">{unlockError}</p>}
      </div>
    </div>
  );
}
