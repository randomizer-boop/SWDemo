import ChartWheel, { ASPECT_NATURE, NATURE_COLOR } from "../components/ChartWheel";
import PointIcon from "../components/PointIcon";
import { rankAspects } from "../lib/aspects";
import "./ChartScreen.css";
import { useState } from "react";
import { t, tx } from "../i18n";

// Порядок вывода точек в списке "Планеты"
const PLANET_DISPLAY_ORDER = [
  "Солнце", "Луна", "Меркурий", "Венера", "Марс", "Юпитер", "Сатурн",
  "Уран", "Нептун", "Плутон", "Хирон", "Раху", "Кету", "Лилит",
  "Селена", "Вертекс", "Парс Фортуны",
];

// Короткая подпись "натуры" аспекта
const NATURE_LABEL = {
  positive: "гармоничный",
  neutral: "нейтральный",
  negative: "напряжённый",
};

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatDegree(value) {
  if (typeof value !== "number") return "—";
  const deg = Math.floor(value);
  const min = Math.round((value - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

// Знак зодиака — только текстом, без юникод-глифа
function signLabel(sign) {
  return sign ? t(sign) : "—";
}

function formatBirthLine(birthData) {
  if (!birthData?.date) return null;
  const { day, month, year } = birthData.date;
  const d = Number(day);
  const m = Number(month);
  if (!d || !m || !year) return null;

  const parts = [`${d} ${tx("month", MONTHS_GENITIVE[m - 1] || "")} ${year}`.trim()];

  if (birthData.timeIsApproximate) {
    parts.push(t("время неизвестно"));
  } else if (birthData.time) {
    const h = String(birthData.time.hour ?? "").padStart(2, "0");
    const min = String(birthData.time.minute ?? "").padStart(2, "0");
    if (birthData.time.hour !== undefined) parts.push(`${h}:${min}`);
  }

  if (birthData.city) parts.push(t(birthData.city));

  return parts.join(" · ");
}

export default function ChartScreen({ chart, birthData }) {
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const [showAllAspects, setShowAllAspects] = useState(false);
  const [showAllConfigurations, setShowAllConfigurations] = useState(false);
  if (!chart) {
    return (
      <div className="screen screen-chart step-enter">
        <div className="screen-body chart-body">
          <div className="cs-empty">
            <span className="spark" style={{ fontSize: 30 }}>
              ✦
            </span>
            <p>{t("Сначала построй карту на главном экране.")}</p>
          </div>
        </div>
      </div>
    );
  }

  const planets = PLANET_DISPLAY_ORDER.map((name) => {
    const data = chart.planets?.[name];
    if (!data) return null;
    return { name, ...data };
  }).filter(Boolean);

  const houses = Object.entries(chart.houses || {}).map(([num, data]) => ({
    num: Number(num),
    ...data,
  }));

  // Показываем топ-8 аспектов по важности (см. lib/aspects.js)
  const ASPECT_LIMIT = 8;
  const allAspects = rankAspects(chart.aspects);
  const aspects = showAllAspects ? allAspects : allAspects.slice(0, ASPECT_LIMIT);

  const allConfigurations = chart.configurations || [];
  const configurations = showAllConfigurations
    ? allConfigurations
    : allConfigurations.slice(0, 4);

  const PLANET_LIMIT = 8;
  const visiblePlanets = showAllPlanets ? planets : planets.slice(0, PLANET_LIMIT);

  const asc = chart.angles?.ascendant;
  const mc = chart.angles?.midheaven;
  const dsc = chart.angles?.descendant;
  const birthLine = formatBirthLine(birthData);

  return (
    <div className="screen screen-chart step-enter">
      <div className="screen-body chart-body">
        <header className="cs-header">
          <span className="hello">{t("Полная карта ✦")}</span>
          <h1>{t("Твоя натальная карта")}</h1>
          {birthLine && <span className="cs-birth-line">{birthLine}</span>}
        </header>

        <div className="cs-wheel-card">
          <ChartWheel chart={chart} size={296} />
        </div>

        <div className="cs-axis-row">
          <AxisItem label="ASC" point={asc} />
          <AxisItem label="MC" point={mc} />
          <AxisItem label="DSC" point={dsc} />
        </div>

        <Section
          title={t("Планеты")}
          hint={t("Показывают, ЧТО в тебе действует: Солнце — суть, Луна — чувства, Меркурий — мышление и т.д. Знак — как это проявляется, дом — в какой сфере жизни.")}
        >
          <div className="cs-planet-grid">
            {visiblePlanets.map((p) => (
              <div className="cs-planet-cell" key={p.name}>
                <div className="cs-planet-cell-head">
                  <PointIcon name={p.name} size={14} className="cs-row-icon" />
                  <span className="cs-row-name">{t(p.name)}</span>
                  {p.retrograde && (
                    <span className="cs-retro" title={t("Ретроградный")}>
                      R
                    </span>
                  )}
                </div>
                <div className="cs-planet-cell-sub">
                  <span className="cs-row-sign">
                    {signLabel(p.sign)} · {formatDegree(p.degree_in_sign)}
                  </span>
                  <span className="cs-row-house">
                    {t("Д")}{p.house ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {planets.length > PLANET_LIMIT && (
            <ToggleButton
              expanded={showAllPlanets}
              hiddenCount={planets.length - PLANET_LIMIT}
              onClick={() => setShowAllPlanets((value) => !value)}
            />
          )}
        </Section>

        <Section
          title={t("Дома")}
          subtitle={t("Система Плацидус")}
          hint={t("12 сфер жизни — от тела и денег до карьеры и окружения. Каждая привязана к своему знаку зодиака.")}
        >
          <div className="cs-house-grid">
            {houses.map((h) => (
              <div className="cs-house-cell" key={h.num}>
                <span className="cs-house-num">{String(h.num).padStart(2, "0")}</span>
                <span className="cs-house-sign">{signLabel(h.sign)}</span>
                <span className="cs-house-degree">{formatDegree(h.degree_in_sign)}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title={t("Аспекты")}
          hint={t("Связи между планетами: где им легко работать вместе, а где они друг другу мешают.")}
        >
          {aspects.length === 0 ? (
            <EmptyState text={t("Значимых аспектов не найдено.")} />
          ) : (
            <>
            <div className="cs-aspect-legend">
              <LegendDot nature="positive" label={t("гармония")} />
              <LegendDot nature="neutral" label={t("нейтрально")} />
              <LegendDot nature="negative" label={t("напряжение")} />
            </div>
            <div className="cs-table cs-aspect-table">
              <div className="cs-table-head cs-aspect-cols">
                <span />
                <span>{t("Пара")}</span>
                <span>{t("Аспект")}</span>
                <span className="cs-col-right">{t("Орбис")}</span>
              </div>
              {aspects.map((a, i) => {
                const nature = ASPECT_NATURE[a.aspect] || "neutral";
                const color = NATURE_COLOR[nature];
                return (
                  <div
                    className={`cs-table-row cs-aspect-cols cs-nature-${nature}`}
                    key={`${a.planet1}-${a.planet2}-${i}`}
                  >
                    <span
                      className="cs-aspect-dot"
                      style={{ background: color }}
                      title={t(NATURE_LABEL[nature])}
                      aria-hidden="true"
                    />
                    <span className="cs-aspect-pair">
                      {t(a.planet1)} — {t(a.planet2)}
                    </span>
                    <span className="cs-aspect-name">{t(a.aspect)}</span>
                    <span className="cs-aspect-orb cs-col-right">{a.orb}°</span>
                  </div>
                );
              })}
            </div>
            {allAspects.length > ASPECT_LIMIT && (
              <ToggleButton
                expanded={showAllAspects}
                hiddenCount={allAspects.length - ASPECT_LIMIT}
                onClick={() => setShowAllAspects((value) => !value)}
              />
            )}
            </>
          )}
        </Section>

        <Section
          title={t("Конфигурации")}
          hint={t("Устойчивые узоры из трёх и более планет — усиливают выраженную в них тему.")}
        >
          {configurations.length === 0 ? (
            <EmptyState text={t("Конфигураций не найдено.")} />
          ) : (
            <>
            <div className="cs-table">
              {configurations.map((c, i) => (
                <div className="cs-table-row cs-config-row" key={`${c.type}-${i}`}>
                  <span className="cs-config-type">{t(c.type)}</span>
                  <span className="cs-config-planets">
                    {c.planets.map((name) => t(name)).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
            {allConfigurations.length > 4 && (
              <ToggleButton
                expanded={showAllConfigurations}
                hiddenCount={allConfigurations.length - 4}
                onClick={() => setShowAllConfigurations((value) => !value)}
              />
            )}
            </>
          )}
        </Section>
      </div>
    </div>
  );
}

function AxisItem({ label, point }) {
  return (
    <div className="cs-axis-item">
      <span className="cs-axis-label">{label}</span>
      <span className="cs-axis-value">
        {point ? `${signLabel(point.sign)} ${formatDegree(point.degree_in_sign)}` : "—"}
      </span>
    </div>
  );
}

function Section({ title, subtitle, hint, children }) {
  return (
    <section className="cs-section">
      <div className="cs-section-title">
        <h3>{title}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {hint && <p className="cs-section-hint">{hint}</p>}
      {children}
    </section>
  );
}

function LegendDot({ nature, label }) {
  return (
    <span className="cs-legend-item">
      <span className="cs-legend-dot" style={{ background: NATURE_COLOR[nature] }} />
      {label}
    </span>
  );
}

function ToggleButton({ expanded, hiddenCount, onClick }) {
  return (
    <button type="button" className="cs-toggle-button" onClick={onClick}>
      <span>{expanded
          ? t("Свернуть")
          : t("Раскрыть") + (hiddenCount ? t(" · ещё {n}", { n: hiddenCount }) : "")}</span>
      <span className={`cs-toggle-chevron ${expanded ? "is-open" : ""}`}>⌄</span>
    </button>
  );
}

function EmptyState({ text }) {
  return <div className="cs-card cs-empty-state">{text}</div>;
}
