
import ChartWheel from "../components/ChartWheel";
import PointIcon from "../components/PointIcon";
import { CATEGORIES, FREE_TEASER_ID } from "../categories";
import { formatDate, formatTime, formatGender } from "../lib/format";
import "./Home.css";
import { t } from "../i18n";

export default function Home({
  chart,
  birthData,
  userName,
  unlockedCategoryIds = [],
  onOpenCategory,
  onNavigate,
  onEditBirthData,
}) {
  const sun = chart?.planets?.Солнце?.sign;
  const moon = chart?.planets?.Луна?.sign;
  const asc = chart?.angles?.ascendant?.sign;

  return (
    <div className="screen screen-home step-enter">
      <div className="screen-body home-body">
        <header className="home-header">
          <div className="greeting">
            <span className="hello">{t("Привет ✦")}</span>
            <h1>{userName}</h1>
          </div>
        </header>

        <section className="home-chart-section" aria-label={t("Натальная карта")}>
          <div className="home-chart-card">
            <div className="home-chart-header">
              <span className="home-chart-label">{t("НАТАЛЬНАЯ КАРТА")}</span>
              <button
                type="button"
                className="edit-data-button"
                onClick={onEditBirthData}
              >
                {t("Изменить данные")}
              </button>
            </div>

            <div className="home-chart-layout">
              <div className="home-chart-wheel">
                <ChartWheel chart={chart} size={240} />
              </div>

              <div className="home-chart-details">
                <div className="home-data-eyebrow">{t("ТВОИ ДАННЫЕ")}</div>

                <div className="home-data-row">
                  <span>{t("Дата")}</span>
                  <strong>{formatDate(birthData)}</strong>
                </div>

                {!birthData?.timeIsApproximate && (
                  <div className="home-data-row">
                    <span>{t("Время")}</span>
                    <strong>{formatTime(birthData)}</strong>
                  </div>
                )}

                <div className="home-data-row home-data-row-city">
                  <span>{t("Город")}</span>
                  <strong title={t(birthData?.city) || "—"}>
                    {t(birthData?.city) || "—"}
                  </strong>
                </div>

                <div className="home-data-row">
                  <span>{t("Пол")}</span>
                  <strong>{formatGender(birthData?.gender)}</strong>
                </div>

              </div>
            </div>

            <div className="big-three">
              <BigThreeItem name="Солнце" label="Солнце" value={sun} />
              <BigThreeItem name="Луна" label="Луна" value={moon} />
              <BigThreeItem label="ASC" value={asc} />
            </div>
          </div>
        </section>

        <button
          type="button"
          className="teaser-card"
          // Бесплатный тизер открывает свой отдельный экран
          onClick={() => onOpenCategory(FREE_TEASER_ID)}
        >
          <div className="teaser-top">
            <span className="teaser-tag">{t("Бесплатно")}</span>
            <span className="teaser-spark" aria-hidden="true">
              ✦
            </span>
          </div>

          <h2>{t("Твой портрет по трём точкам")}</h2>
          <p>
            {t("Короткий, но узнаваемый разбор личности — на основе Солнца, Луны и Асцендента.")}
          </p>

          <span className="teaser-cta">
            {t("Смотреть разбор")}
            <span aria-hidden="true">→</span>
          </span>
        </button>

        <div>
          <div className="section-title">
            <h3>{t("Разборы")}</h3>
            <span>{t("{n} категории", { n: CATEGORIES.length })}</span>
          </div>

          <div className="cat-grid">
            {CATEGORIES.map((cat) => {
              const isLocked =
                cat.locked && !unlockedCategoryIds.includes(cat.id);

              return (
              <button
                key={cat.id}
                type="button"
                className={`cat-card cat-${cat.id}`}
                onClick={() => onOpenCategory(cat.id)}
              >
                {isLocked ? (
                  <span className="lock-pill" aria-label={t("Закрыто")}>
                    🔒
                  </span>
                ) : (
                  <span className="unlocked-tag">{t("Открыто")}</span>
                )}
                <img
                  className="cat-icon"
                  src={cat.icon}
                  alt=""
                  aria-hidden="true"
                />
                <span className="cat-name">{t(cat.name)}</span>
                <span className="cat-desc">{t(cat.shortDesc)}</span>
              </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="daily-card"
          onClick={() => onNavigate("daily")}
        >
          <span className="daily-icon" aria-hidden="true">
            ✦
          </span>
          <span className="daily-body">
            <h3>
              {t("Прогноз на сегодня")}
              <span className="daily-lock" aria-label={t("Платная подписка")}>
                🔒
              </span>
            </h3>
            <p>{t("Открой, чтобы посмотреть транзиты дня")}</p>
          </span>
          <span className="daily-arrow" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </div>
  );
}

// name — ключ иконки в PointIcon; для ASC иконки нет — текстовая метка
function BigThreeItem({ name, label, value }) {
  return (
    <div className="bt-item">
      {name ? (
        <PointIcon name={name} size={12} className="bt-symbol" />
      ) : (
        <span className="bt-symbol bt-symbol-text">{label}</span>
      )}
      <span className="bt-value">{t(value) || "—"}</span>
    </div>
  );
}
