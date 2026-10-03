import { CATEGORIES } from "../categories";
import { formatDate, formatTime, formatGender } from "../lib/format";
import { openTelegramLink } from "../lib/telegram";
import { APP_SHARE_URL, SUPPORT_URL, APP_VERSION } from "../lib/constants";
import LegalLinks from "../components/LegalLinks";
import "./ProfileScreen.css";
import { t } from "../i18n";

// Текст шаринг-сообщения Telegram
const SHARE_TEXT = "Посмотри свою натальную карту ✦";

export default function ProfileScreen({
  birthData,
  userName,
  unlockedCategoryIds = [],
  onOpenCategory,
  onEditBirthData,
  onRestorePurchases,
  isRestoringPurchases = false,
  onOpenLegal,
}) {
  const unlockedCount = CATEGORIES.filter(
    (c) => !c.locked || unlockedCategoryIds.includes(c.id)
  ).length;

  const handleShare = () => {
    if (!APP_SHARE_URL) return;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      APP_SHARE_URL
    )}&text=${encodeURIComponent(t(SHARE_TEXT))}`;
    openTelegramLink(shareUrl);
  };

  return (
    <div className="screen screen-profile step-enter">
      <div className="screen-body profile-body">
        <header className="profile-header">
          <span className="pf-avatar" aria-hidden="true">
            {(userName || "?").trim().charAt(0).toUpperCase()}
          </span>
          <div className="profile-header-text">
            <span className="hello">{t("Профиль ✦")}</span>
            <h1>{userName}</h1>
          </div>
        </header>

        <section className="pf-card" aria-label={t("Данные рождения")}>
          <div className="pf-card-head">
            <span className="pf-card-label">{t("ДАННЫЕ РОЖДЕНИЯ")}</span>
            <button
              type="button"
              className="edit-data-button"
              onClick={onEditBirthData}
            >
              {t("Изменить")}
            </button>
          </div>

          <div className="pf-data-grid">
            <PfRow label={t("Дата")} value={formatDate(birthData)} />
            {!birthData?.timeIsApproximate ? (
              <PfRow label={t("Время")} value={formatTime(birthData)} />
            ) : (
              <PfRow label={t("Время")} value={t("не указано")} />
            )}
            <PfRow label={t("Город")} value={t(birthData?.city) || "—"} />
            <PfRow label={t("Пол")} value={formatGender(birthData?.gender)} />
          </div>
        </section>

        <section aria-label={t("Мои разборы")}>
          <div className="section-title">
            <h3>{t("Мои разборы")}</h3>
            <span>
              {t("{n} из {m} открыто", { n: unlockedCount, m: CATEGORIES.length })}
            </span>
          </div>

          <div className="pf-purchase-list">
            {CATEGORIES.map((cat) => {
              const isUnlocked = !cat.locked || unlockedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="pf-purchase-row"
                  onClick={() => onOpenCategory(cat.id)}
                >
                  <img className="pf-purchase-icon" src={cat.icon} alt="" aria-hidden="true" />
                  <span className="pf-purchase-name">{t(cat.name)}</span>
                  {isUnlocked ? (
                    <span className="unlocked-tag">{t("Открыто")}</span>
                  ) : (
                    <span className="pf-purchase-price">{cat.price} ⭐</span>
                  )}
                </button>
              );
            })}
          </div>

          {onRestorePurchases && (
            <button
              type="button"
              className="pf-restore-link"
              onClick={onRestorePurchases}
              disabled={isRestoringPurchases}
            >
              {isRestoringPurchases
                ? t("Обновляем…")
                : t("Не видишь купленный разбор? Обновить")}
            </button>
          )}
        </section>

        {APP_SHARE_URL && (
          <button type="button" className="pf-share-card" onClick={handleShare}>
            <span className="pf-share-icon" aria-hidden="true">✦</span>
            <span className="pf-share-body">
              <strong>{t("Поделиться приложением")}</strong>
              <span>{t("Отправь другу — свою карту он тоже построит")}</span>
            </span>
            <span className="pf-share-arrow" aria-hidden="true">›</span>
          </button>
        )}

        <section aria-label={t("Поддержка")}>
          <div className="section-title">
            <h3>{t("Поддержка")}</h3>
          </div>

          <div className="pf-card pf-faq-card">
            <FaqItem
              q={t("Не нашёл свой город в списке")}
              a={t("Попробуй ввести название на английском или указать ближайший крупный город — расчёт всё равно будет точным для этой местности.")}
            />
            <FaqItem
              q={t("Не знаю точное время рождения")}
              a={t("Отметь «Не знаю точное время» в форме — рассчитаем карту по дате, без домов и Асцендента, которые без точного времени были бы неточными.")}
            />
            <FaqItem
              q={t("Оплатил, но раздел не открылся")}
              a={t("Нажми «Обновить» под списком разборов выше. Если не помогло — напиши в поддержку, укажи категорию и примерное время оплаты.")}
            />
          </div>

          {SUPPORT_URL && (
            <button
              type="button"
              className="pf-support-button"
              onClick={() => openTelegramLink(SUPPORT_URL)}
            >
              <span>{t("Написать в поддержку")}</span>
              <span aria-hidden="true">{"\u2197\uFE0E"}</span>
            </button>
          )}
        </section>

        <p className="pf-footnote">
          {t("Оплаченные разборы привязаны к твоему Telegram-аккаунту и сохраняются между заходами в приложение.")}
        </p>

        <LegalLinks onOpen={onOpenLegal} />

        <p className="pf-version">{t("StarWise · версия {v}", { v: APP_VERSION })}</p>
      </div>
    </div>
  );
}

function PfRow({ label, value }) {
  return (
    <div className="pf-data-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

// Пункт FAQ — нативный <details>/<summary>
function FaqItem({ q, a }) {
  return (
    <details className="pf-faq-item">
      <summary>{q}</summary>
      <p>{a}</p>
    </details>
  );
}
