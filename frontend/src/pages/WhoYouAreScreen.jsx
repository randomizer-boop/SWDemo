import { useMemo, useRef, useState } from "react";
import { FREE_TEASER } from "../categories";
import StatusScreen from "../components/StatusScreen";
import PointIcon from "../components/PointIcon";
import ZodiacIcon from "../components/ZodiacIcon";
import { buildPortrait, nextLabel } from "../lib/whoYouAre";
import "./CategoryScreen.css";
import "./WhoYouAreScreen.css";
import Icon from "../components/Icon";
import { t, getLang } from "../i18n";

// ДЕМО: все строки портрета проходят через словарь (RU — как есть, EN — перевод)
function localize(value) {
  if (typeof value === "string") return t(value);
  if (Array.isArray(value)) return value.map(localize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localize(item)])
    );
  }
  return value;
}

// Бесплатный экран «Кто ты»: формула, три вкладки (Асцендент → Солнце → Луна),
// блок «Как это складывается» и «Особенность карты». Тексты — из src/content.
export default function WhoYouAreScreen({
  chart,
  birthData,
  personalityUnlocked = false,
  onBack,
  onOpenPersonality,
  onEditBirthData,
}) {
  const lang = getLang();
  const portrait = useMemo(
    () => localize(buildPortrait(chart, birthData)),
    // lang — чтобы при переключении RU/EN тексты пересобрались
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chart, birthData, lang]
  );
  const [activeId, setActiveId] = useState(null);
  const tabsRef = useRef(null);

  // Карты нет или в ней нет Асцендента/Солнца/Луны — понятный экран вместо пустоты
  if (!portrait) {
    return (
      <StatusScreen
        variant="generic"
        title={t("Портрет пока не собрать")}
        text={t("Сначала построй карту на главном экране.")}
        onAction={onBack}
        actionLabel={t("На главную")}
      />
    );
  }

  const { cards, labels } = portrait;
  // По умолчанию открыта первая вкладка — Асцендент
  const activeIndex = Math.max(
    0,
    cards.findIndex((item) => item.id === activeId)
  );
  const card = cards[activeIndex];
  const nextCard = cards[activeIndex + 1] || null;

  const goToNext = () => {
    setActiveId(nextCard.id);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="screen screen-category screen-wya step-enter">
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
            src={FREE_TEASER.icon}
            alt=""
            aria-hidden="true"
          />
        </div>

        <span className="wya-eyebrow-pill">
          <Icon name="spark" /> {portrait.eyebrow}
        </span>
        <h1 className="wya-title">{portrait.title}</h1>
        <span className="wya-title-rule" aria-hidden="true" />
        <p className="wya-subtitle">
          {highlightWords(
            portrait.subtitle,
            cards.map((item) => item.positionName)
          )}
        </p>

        <section className="wya-formula">
          <span className="wya-formula-label">
            <span aria-hidden="true"><Icon name="spark" /></span> {portrait.formula.title}
          </span>
          <p className="wya-formula-headline">{portrait.formula.headline}</p>
          <p className="wya-formula-text">{portrait.formula.text}</p>
        </section>

        {portrait.timeWarning && (
          <section className="wya-banner">
            <p>{portrait.timeWarning.text}</p>
            <button
              type="button"
              className="wya-pill-button"
              onClick={onEditBirthData}
            >
              {portrait.timeWarning.button}
            </button>
          </section>
        )}

        <div
          className="wya-tabs"
          role="tablist"
          aria-label={t("Точки портрета")}
          ref={tabsRef}
          style={{ "--wya-tab-count": cards.length }}
        >
          {cards.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === card.id}
              className={`wya-tab${item.id === card.id ? " is-active" : ""}`}
              data-element={item.element}
              onClick={() => setActiveId(item.id)}
            >
              <ZodiacIcon sign={item.signKey} size={24} className="wya-tab-glyph" />
              <span className="wya-tab-label">{item.tabLabel}</span>
              <span className="wya-tab-sign">{item.signName}</span>
            </button>
          ))}
        </div>

        {/* key — чтобы при смене вкладки карточка появлялась заново */}
        <article
          key={card.id}
          className="wya-card"
          data-element={card.element}
          role="tabpanel"
        >
          <header className="wya-card-head">
            <span className="wya-card-icon" aria-hidden="true">
              <PositionIcon id={card.id} />
            </span>
            <div>
              <span className="wya-eyebrow">{card.eyebrow}</span>
              <h2 className="wya-card-title">{card.title}</h2>
            </div>
          </header>

          <dl className="wya-stats">
            {card.degree && <Stat label={labels.degree} value={card.degree} />}
            {card.house && <Stat label={labels.house} value={card.house} />}
            <Stat label={labels.element} value={card.elementName} />
          </dl>

          <h3 className="wya-tagline">{card.tagline}</h3>

          <ul className="wya-chips">
            {card.keywords.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>

          {card.note && <p className="wya-note">{card.note}</p>}

          <div className="wya-text">
            {card.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {card.houseLine && <p>{card.houseLine}</p>}
          </div>

          <div className="wya-duo">
            <div className="wya-duo-box wya-strength">
              <span className="wya-duo-label">
                <span aria-hidden="true">↑</span> {labels.strength}
              </span>
              <p>{card.strength}</p>
            </div>
            <div className="wya-duo-box wya-watch">
              <span className="wya-duo-label">
                <span aria-hidden="true">!</span> {labels.watch}
              </span>
              <p>{card.watch}</p>
            </div>
          </div>

          {nextCard ? (
            <button type="button" className="wya-pill-button" onClick={goToNext}>
              {nextLabel(labels.nextTemplate, nextCard)}
            </button>
          ) : (
            !personalityUnlocked && (
              <div className="wya-after">
                <h3>{portrait.afterLast.title}</h3>
                <p>{portrait.afterLast.text}</p>
                <button
                  type="button"
                  className="wya-pill-button"
                  onClick={onOpenPersonality}
                >
                  {portrait.afterLast.button} →
                </button>
              </div>
            )
          )}
        </article>

        <section className="wya-blend">
          <h2 className="wya-blend-title">
            <span aria-hidden="true"><Icon name="spark" /></span> {portrait.blend.title}
          </h2>

          <ul className="wya-blend-rows">
            {cards.map((item) => (
              <li key={item.id} data-element={item.element}>
                <span className="wya-blend-label">{item.blendLabel}</span>
                <span className="wya-blend-sign">
                  <ZodiacIcon sign={item.signKey} size={15} strokeWidth={1.9} />
                  {item.signName}
                </span>
                <span className="wya-blend-phrase">{item.blendPhrase}</span>
              </li>
            ))}
          </ul>

          {portrait.blend.notes.map((note) => (
            <p key={note} className="wya-note">
              {note}
            </p>
          ))}

          <p className="wya-blend-text">
            {portrait.blend.text} {portrait.blend.rhythm}
          </p>

          <div className="wya-feature">
            <span className="wya-feature-label">
              {portrait.feature.label}
              {portrait.feature.accuracy && (
                <span className="wya-feature-accuracy">
                  {portrait.feature.accuracy}
                </span>
              )}
            </span>
            {portrait.feature.headline && (
              <strong>{portrait.feature.headline}</strong>
            )}
            <p>{portrait.feature.text}</p>
            {portrait.feature.where && (
              <p className="wya-feature-where">{portrait.feature.where}</p>
            )}
          </div>
        </section>

        <button type="button" className="wya-locked" onClick={onOpenPersonality}>
          <span className="wya-locked-body">
            <strong>{portrait.locked.cta}</strong>
            <span>{portrait.locked.text}</span>
          </span>
          <span className="wya-locked-icon" aria-hidden="true">
            {personalityUnlocked ? "→" : <Icon name="lock" />}
          </span>
        </button>
      </div>
    </div>
  );
}

// Выделяет в тексте названия точек («Асцендент», «Солнце», «Луна») жирным
function highlightWords(text, words) {
  const parts = text.split(new RegExp(`(${words.join("|")})`));
  return parts.map((part, i) =>
    words.includes(part) ? <b key={i}>{part}</b> : part
  );
}

function Stat({ label, value }) {
  return (
    <div className="wya-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// Значок точки в шапке карточки; для Асцендента — стрелка над линией горизонта
function PositionIcon({ id }) {
  if (id === "Sun") return <PointIcon name="Солнце" size={20} />;
  if (id === "Moon") return <PointIcon name="Луна" size={20} />;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="18.5" x2="20" y2="18.5" />
      <line x1="12" y1="18.5" x2="12" y2="5.5" />
      <path d="M7.6 9.9L12 5.5l4.4 4.4" />
    </svg>
  );
}
