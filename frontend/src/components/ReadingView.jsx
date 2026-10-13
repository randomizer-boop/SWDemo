import { useState } from "react";
import "./ReadingView.css";

// Цвет плашки стихии по названию
const ELEMENT_CHIP = {
  Воздух: "air",
  Земля: "earth",
  Вода: "water",
  Огонь: "fire",
};

export function SparkIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5c.6 4.9 1.7 7.6 3.4 9.2 1.6 1.5 4.2 2.4 8.6 2.8-4.4.4-7 1.3-8.6 2.8-1.7 1.6-2.8 4.3-3.4 9.2-.6-4.9-1.7-7.6-3.4-9.2C7 14.8 4.4 13.9 0 13.5c4.4-.4 7-1.3 8.6-2.8C10.3 9.1 11.4 6.4 12 1.5z" />
    </svg>
  );
}

function Chip({ label }) {
  const element = ELEMENT_CHIP[label];
  return (
    <span className={`rv-chip${element ? ` rv-chip-${element}` : ""}`}>
      {label}
    </span>
  );
}

function AspectRow({ aspect }) {
  return (
    <li className={`rv-aspect rv-tone-${aspect.tone || "neutral"}`}>
      <div className="rv-aspect-head">
        <span className="rv-aspect-dot" aria-hidden="true" />
        <span className="rv-aspect-name">{aspect.name}</span>
        {aspect.orb && <span className="rv-aspect-orb">{aspect.orb}</span>}
      </div>
      <p>{aspect.text}</p>
    </li>
  );
}

export function SectionCard({ eyebrow, title, children, variant }) {
  return (
    <section className={`rv-card${variant ? ` rv-card-${variant}` : ""}`}>
      {eyebrow && (
        <span className="rv-eyebrow">
          <SparkIcon size={11} />
          {eyebrow}
        </span>
      )}
      {title && <h3 className="rv-card-title">{title}</h3>}
      {children}
    </section>
  );
}

// Аспект по единой схеме: что показывает → как проявляется → что делать
function AspectScheme({ aspect, large = false }) {
  const rows = [
    ["Что показывает", aspect.shows],
    ["Как проявляется", aspect.manifests],
    ["Что с этим делать", aspect.todo],
  ];
  return (
    <div className={`rv-scheme rv-tone-${aspect.tone || "neutral"}${large ? " rv-scheme-large" : ""}`}>
      {!large && (
        <div className="rv-aspect-head">
          <span className="rv-aspect-dot" aria-hidden="true" />
          <span className="rv-aspect-name">{aspect.name}</span>
          {aspect.orb && <span className="rv-aspect-orb">{aspect.orb}</span>}
        </div>
      )}
      <ol className="rv-scheme-steps">
        {rows.map(([label, text]) => (
          <li key={label}>
            <span className="rv-scheme-label">{label}</span>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Шаблон v2: формула → что рассматриваем → основные темы → ключевой аспект →
// дополнительные акценты → как всё складывается → практический вывод
function TemplateReadingView({ reading }) {
  const [activeId, setActiveId] = useState(reading.themes[0]?.id);
  const theme =
    reading.themes.find((t) => t.id === activeId) || reading.themes[0];
  const key = reading.keyAspect;

  return (
    <div className="rv">
      <SectionCard eyebrow="Твоя формула" variant="formula">
        <p className="rv-formula">{reading.formula}</p>
      </SectionCard>

      <SectionCard eyebrow="Что мы рассматриваем">
        <ul className="rv-indicators">
          {reading.indicators.map((it) => (
            <li key={it.name} className={it.tone ? `rv-tone-${it.tone}` : ""}>
              <div className="rv-ind-head">
                {it.tone && <span className="rv-aspect-dot" aria-hidden="true" />}
                <span className="rv-ind-name">{it.name}</span>
                <span className="rv-ind-pos">{it.position}</span>
              </div>
              <p>{it.explain}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="rv-section-label">
        <SparkIcon size={11} />
        Основные темы
      </div>

      <div className="rv-tabs" role="tablist">
        {reading.themes.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === theme.id}
            className={`rv-tab${t.id === theme.id ? " is-active" : ""}`}
            onClick={() => setActiveId(t.id)}
          >
            {t.tab}
          </button>
        ))}
      </div>

      <section className="rv-card rv-point" key={theme.id}>
        <h2 className="rv-theme-title">{theme.title}</h2>
        <span className="rv-basis">{theme.basis}</span>
        <div className="rv-paragraphs">
          {theme.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
        {theme.aspects?.map((a) => (
          <AspectScheme key={a.name} aspect={a} />
        ))}
      </section>

      <SectionCard eyebrow="Ключевой аспект" variant="key">
        <div className={`rv-key-head rv-tone-${key.tone || "neutral"}`}>
          <h3 className="rv-card-title">{key.name}</h3>
          <span className="rv-aspect-orb">орб {key.orb}</span>
        </div>
        <AspectScheme aspect={key} large />
      </SectionCard>

      {reading.extras?.length > 0 && (
        <SectionCard eyebrow="Дополнительные акценты">
          <ul className="rv-extras">
            {reading.extras.map((x) => (
              <li key={x.name}>
                <div className="rv-ind-head">
                  <span className="rv-ind-name">{x.name}</span>
                  <span className="rv-ind-pos">{x.position}</span>
                </div>
                <p>{x.text}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard eyebrow="Как всё складывается вместе">
        <p className="rv-body">{reading.synthesis}</p>
      </SectionCard>

      <SectionCard eyebrow="Практический вывод" variant="feature">
        <p className="rv-advice">{reading.takeaway}</p>
      </SectionCard>
    </div>
  );
}

// Разбор: шаблон v2 или прежняя схема (вкладки по точкам)
export default function ReadingView({ reading }) {
  if (reading.template === "v2") {
    return <TemplateReadingView reading={reading} />;
  }
  return <PointsReadingView reading={reading} />;
}

// Прежняя схема: формула → вкладки точек → (стихии) → синтез → особенность
function PointsReadingView({ reading }) {
  const [activeId, setActiveId] = useState(reading.points[0]?.id);
  const point =
    reading.points.find((p) => p.id === activeId) || reading.points[0];

  return (
    <div className="rv">
      <SectionCard eyebrow="Твоя формула" variant="formula">
        <p className="rv-formula">{reading.formula}</p>
        {reading.intro && <p className="rv-intro">{reading.intro}</p>}
      </SectionCard>

      <div className="rv-tabs" role="tablist">
        {reading.points.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === point.id}
            className={`rv-tab${p.id === point.id ? " is-active" : ""}`}
            onClick={() => setActiveId(p.id)}
          >
            {p.tab}
          </button>
        ))}
      </div>

      <section className="rv-card rv-point" key={point.id}>
        <div className="rv-point-head">
          <div>
            {point.role && <span className="rv-role">{point.role}</span>}
            <h2 className="rv-point-title">{point.title}</h2>
          </div>
          <span className="rv-position">{point.position}</span>
        </div>

        {point.chips?.length > 0 && (
          <div className="rv-chips">
            {point.chips.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </div>
        )}

        <div className="rv-paragraphs">
          {point.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>

        {point.aspects?.length > 0 && (
          <>
            <div className="rv-divider" />
            <span className="rv-subhead">Связи с другими точками</span>
            <ul className="rv-aspects">
              {point.aspects.map((a) => (
                <AspectRow key={a.name} aspect={a} />
              ))}
            </ul>
          </>
        )}
      </section>

      {reading.elements && (
        <SectionCard eyebrow="Баланс стихий">
          <p className="rv-note">{reading.elements.note}</p>
          <ul className="rv-elements">
            {reading.elements.items.map((el) => (
              <li key={el.id} className={`rv-el rv-el-${el.id}`}>
                <div className="rv-el-head">
                  <span className="rv-el-name">{el.name}</span>
                  <span className="rv-el-count">{el.count}</span>
                </div>
                <div className="rv-el-bar">
                  <span style={{ width: `${(el.count / 4) * 100}%` }} />
                </div>
                <span className="rv-el-points">{el.points}</span>
              </li>
            ))}
          </ul>
          <p className="rv-body">{reading.elements.text}</p>
        </SectionCard>
      )}

      <SectionCard eyebrow="Как это складывается">
        <p className="rv-body">{reading.synthesis}</p>
      </SectionCard>

      <SectionCard
        eyebrow="Особенность карты"
        title={reading.feature.title}
        variant="feature"
      >
        <p className="rv-body">{reading.feature.text}</p>
      </SectionCard>
    </div>
  );
}
