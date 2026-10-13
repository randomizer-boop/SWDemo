import { useState } from "react";
import PointIcon from "../components/PointIcon";
import { t } from "../i18n";
import "./TeaserReading.css";

// Бесплатный разбор "Кто ты": формула, три точки-переключателя, карточка
// выбранной точки (факты из карты, ключевые слова, сила / зона внимания)
// и итог "Как это складывается".

const SIGN_GLYPH = {
  "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋",
  "Лев": "♌", "Дева": "♍", "Весы": "♎", "Скорпион": "♏",
  "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓",
};

const SIGN_ELEMENT = {
  "Овен": "fire", "Лев": "fire", "Стрелец": "fire",
  "Телец": "earth", "Дева": "earth", "Козерог": "earth",
  "Близнецы": "air", "Весы": "air", "Водолей": "air",
  "Рак": "water", "Скорпион": "water", "Рыбы": "water",
};

const ELEMENT_NAME = {
  fire: "Огонь",
  earth: "Земля",
  air: "Воздух",
  water: "Вода",
};

// Глиф знака в текстовом (не эмодзи) начертании
function signGlyph(sign) {
  const glyph = SIGN_GLYPH[sign];
  return glyph ? `${glyph}︎` : "";
}

// "6°53′" из градуса в знаке
function formatDegree(value) {
  if (typeof value !== "number") return "—";
  let deg = Math.floor(value);
  let min = Math.round((value - deg) * 60);
  if (min === 60) {
    deg += 1;
    min = 0;
  }
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

// Положение точки в карте: знак, градус, дом, стихия
function pointData(chart, point) {
  const raw =
    point === "ASC" ? chart?.angles?.ascendant : chart?.planets?.[point];
  if (!raw) return null;
  return {
    sign: raw.sign,
    degree: raw.degree_in_sign,
    house: point === "ASC" ? 1 : raw.house,
    element: SIGN_ELEMENT[raw.sign] || "water",
  };
}

function pointName(point) {
  return point === "ASC" ? "ASC" : t(point);
}

export default function TeaserReading({ reading, chart, onOpenFull }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const points = reading.points.map((p) => ({
    ...p,
    data: pointData(chart, p.point),
  }));
  const active = points[activeIndex];
  const next = points[activeIndex + 1];
  const { blend } = reading;

  const accentAspect = (chart?.aspects || []).find(
    (a) =>
      blend.accent.aspect.includes(a.planet1) &&
      blend.accent.aspect.includes(a.planet2)
  );

  return (
    <div className="tr">
      {/* ===== формула ===== */}
      <section className="tr-formula">
        <span className="tr-eyebrow">✦ {t("Твоя формула")}</span>
        <p className="tr-quote">{reading.formula}</p>
      </section>

      {/* ===== три точки — переключатель ===== */}
      <div className="tr-tiles" role="tablist" aria-label={t("Три точки карты")}>
        {points.map((p, i) => (
          <button
            key={p.point}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className={`tr-tile tr-el-${p.data?.element}${
              i === activeIndex ? " is-active" : ""
            }`}
            onClick={() => setActiveIndex(i)}
          >
            <span className="tr-tile-glyph" aria-hidden="true">
              {signGlyph(p.data?.sign)}
            </span>
            <span className="tr-tile-point">{pointName(p.point)}</span>
            <span className="tr-tile-sign">{t(p.data?.sign)}</span>
          </button>
        ))}
      </div>

      {/* ===== карточка выбранной точки ===== */}
      <article
        key={active.point}
        className={`cat-card tr-detail tr-el-${active.data?.element}`}
        role="tabpanel"
      >
        <header className="tr-detail-head">
          <span className="tr-badge" aria-hidden="true">
            {active.point === "ASC" ? (
              <span className="tr-badge-text">ASC</span>
            ) : (
              <PointIcon name={active.point} size={20} />
            )}
          </span>
          <div>
            <span className="tr-role">{active.role}</span>
            <h2 className="tr-title">{active.title}</h2>
          </div>
        </header>

        <dl className="tr-facts">
          <div>
            <dt>{t("Градус")}</dt>
            <dd>{formatDegree(active.data?.degree)}</dd>
          </div>
          <div>
            <dt>{t("Дом")}</dt>
            <dd>{active.data?.house ?? "—"}</dd>
          </div>
          <div>
            <dt>{t("Стихия")}</dt>
            <dd>{t(ELEMENT_NAME[active.data?.element])}</dd>
          </div>
        </dl>

        <p className="tr-tagline">{active.tagline}</p>

        <ul className="tr-keywords">
          {active.keywords.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>

        <p className="tr-text">{active.text}</p>

        <div className="tr-duo">
          <div className="tr-duo-item tr-duo-plus">
            <span className="tr-duo-label">
              <span aria-hidden="true">↑</span> {t("Сила")}
            </span>
            <p>{active.strength}</p>
          </div>
          <div className="tr-duo-item tr-duo-watch">
            <span className="tr-duo-label">
              <span aria-hidden="true">!</span> {t("Зона внимания")}
            </span>
            <p>{active.watch}</p>
          </div>
        </div>

        {next && (
          <button
            type="button"
            className="tr-next"
            onClick={() => setActiveIndex(activeIndex + 1)}
          >
            {t("Дальше")}: {pointName(next.point)} · {t(next.data?.sign)}
            <span aria-hidden="true"> →</span>
          </button>
        )}
      </article>

      {/* ===== итог ===== */}
      <article className="cat-card tr-blend">
        <h2 className="tr-blend-title">
          <span aria-hidden="true">✦ </span>
          {blend.title}
        </h2>

        <div className="tr-blend-rows">
          {blend.rows.map((row) => {
            const data = pointData(chart, row.point);
            return (
              <div
                className={`tr-blend-row tr-el-${data?.element}`}
                key={row.point}
              >
                <span className="tr-blend-label">{row.label}</span>
                <span className="tr-blend-sign">
                  <span aria-hidden="true">{signGlyph(data?.sign)}</span>{" "}
                  {t(data?.sign)}
                </span>
                <span className="tr-blend-text">{row.text}</span>
              </div>
            );
          })}
        </div>

        <p className="tr-text">{blend.text}</p>

        <div className="tr-accent">
          <span className="tr-accent-title">{blend.accent.title}</span>
          {accentAspect && (
            <span className="tr-accent-aspect">
              {t(accentAspect.planet1)} — {t(accentAspect.planet2)} ·{" "}
              {t(accentAspect.aspect)} · {accentAspect.orb}°
            </span>
          )}
          <p>{blend.accent.text}</p>
        </div>
      </article>

      {/* ===== переход к платному разбору ===== */}
      {onOpenFull && (
        <button type="button" className="tr-full" onClick={onOpenFull}>
          <span className="tr-full-body">
            <strong>{t("Полная характеристика")}</strong>
            <span>
              {t("Пять точек, аспекты и баланс стихий — в разделе «Личность»")}
            </span>
          </span>
          <span className="tr-full-lock" aria-hidden="true">
            🔒
          </span>
        </button>
      )}
    </div>
  );
}
