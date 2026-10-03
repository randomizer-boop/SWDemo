import { t } from "../i18n";

const ZODIAC = [
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
].map((glyph) => `${glyph}︎`);

const PLANETS_TO_DRAW = [
  "Солнце", "Луна", "Меркурий", "Венера", "Марс",
  "Юпитер", "Сатурн", "Уран", "Нептун", "Плутон",
];

// "Натура" аспекта: зелёный — гармоничный, жёлтый — нейтральный, красный — напряжённый
export const ASPECT_NATURE = {
  "Трин": "positive",
  "Секстиль": "positive",
  "Соединение": "neutral",
  "Квиконс": "neutral",
  "Квадрат": "negative",
  "Оппозиция": "negative",
};

export const NATURE_COLOR = {
  positive: "#4fa87e",
  neutral: "#dda63f",
  negative: "#dd6a63",
};

const ASPECT_STYLE = {
  "Соединение": { dash: null, width: 1.15 },
  "Секстиль": { dash: null, width: 1.0 },
  "Трин": { dash: null, width: 1.05 },
  "Квадрат": { dash: "5 4", width: 1.0 },
  "Оппозиция": { dash: "5 4", width: 1.0 },
  "Квиконс": { dash: "1.5 3.5", width: 0.85 },
};

const ELEMENTS = [
  { bg: "#fbedd9", accent: "#d79a51", line: "#ecd9bc" },
  { bg: "#e6f0e8", accent: "#5b9a79", line: "#cfdfd2" },
  { bg: "#e6f0f7", accent: "#6a9fc7", line: "#d2e2ee" },
  { bg: "#eee8f8", accent: "#8065c7", line: "#ddd2ef" },
];

function norm360(a) {
  return ((a % 360) + 360) % 360;
}

function elementOf(longitude) {
  return Math.floor(norm360(longitude) / 30) % 4;
}

function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, innerR, outerR, startDeg, endDeg) {
  const startOuter = polarToXY(cx, cy, outerR, startDeg);
  const endOuter = polarToXY(cx, cy, outerR, endDeg);
  const startInner = polarToXY(cx, cy, innerR, endDeg);
  const endInner = polarToXY(cx, cy, innerR, startDeg);
  const span = Math.abs(endDeg - startDeg);
  const largeArc = span > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function polygonPoints(cx, cy, r, sides = 12, rotation = 0) {
  return Array.from({ length: sides }, (_, i) => {
    const p = polarToXY(cx, cy, r, rotation + i * (360 / sides));
    return `${p.x},${p.y}`;
  }).join(" ");
}

// Раздвигает метки близко стоящих планет вдоль кольца, чтобы они не наезжали друг на друга
function spreadPlanetsOnRing(list, minGapDeg) {
  if (list.length === 0) return [];
  const items = list.map((p) => ({ ...p, dispAngle: p.angle }));
  if (items.length === 1) return items;

  const sorted = [...items].sort((a, b) => a.angle - b.angle);
  const n = sorted.length;

  // "Разрезаем" окружность в самом большом промежутке между планетами
  let seam = 0;
  let maxGap = -1;
  for (let i = 0; i < n; i++) {
    const cur = sorted[i].angle;
    const next = (i === n - 1 ? sorted[0].angle + 360 : sorted[i + 1].angle);
    const gap = next - cur;
    if (gap > maxGap) {
      maxGap = gap;
      seam = (i + 1) % n;
    }
  }

  const chain = [...sorted.slice(seam), ...sorted.slice(0, seam)];
  chain[0].pos = chain[0].angle;
  for (let i = 1; i < n; i++) {
    let a = chain[i].angle;
    while (a < chain[i - 1].pos) a += 360;
    chain[i].pos = a;
  }

  for (let iter = 0; iter < 60; iter++) {
    let moved = false;
    for (let i = 1; i < n; i++) {
      const gap = chain[i].pos - chain[i - 1].pos;
      if (gap < minGapDeg) {
        const delta = (minGapDeg - gap) / 2;
        chain[i - 1].pos -= delta;
        chain[i].pos += delta;
        moved = true;
      }
    }
    if (!moved) break;
  }

  chain.forEach((p) => {
    p.dispAngle = norm360(p.pos);
  });

  return chain;
}

import { pointIconContent } from "./PointIcon";
import "./ChartWheel.css";

export default function ChartWheel({ chart, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.415;
  const zodiacBand = size * 0.095;
  const zodiacOuterR = outerR;
  const zodiacInnerR = outerR - zodiacBand;
  const houseOuterR = zodiacInnerR - size * 0.014;
  const houseInnerR = size * 0.238;
  const aspectR = size * 0.152;
  const centerR = size * 0.095;
  // Радиус кольца планет — между кольцом домов и хабом аспектов
  const planetR = (houseInnerR + aspectR) / 2 + size * 0.01;
  const badgeR = (zodiacOuterR + zodiacInnerR) / 2;
  const badgeSize = size * 0.052;
  const houseBadgeSize = size * 0.035;
  const planetMarkerR = size * 0.0305;

  const ascLon = chart?.angles?.ascendant?.longitude;
  const mcLon = chart?.angles?.midheaven?.longitude;
  const descLon = chart?.angles?.descendant?.longitude ?? (typeof ascLon === "number" ? norm360(ascLon + 180) : null);
  const icLon = typeof mcLon === "number" ? norm360(mcLon + 180) : null;

  const rotation = typeof ascLon === "number" ? norm360(270 - ascLon) : 0;
  const disp = (lon) => norm360(lon + rotation);

  const rawPlanets = PLANETS_TO_DRAW.map((name) => {
    const data = chart?.planets?.[name];
    if (!data) return null;
    return { name, angle: disp(data.longitude), element: elementOf(data.longitude) };
  }).filter(Boolean);

  const marker = planetMarkerR * 1.65;
  const minGapDeg = Math.max(9, ((marker * 1.18) / planetR) * (180 / Math.PI));
  const planets = spreadPlanetsOnRing(rawPlanets, minGapDeg).map((p) => ({
    ...p,
    dispR: planetR,
    // Метка сдвинута от истинного градуса — рисуем "поводок"
    displaced: Math.abs(norm360(p.dispAngle - p.angle + 180) - 180) > 1.2,
  }));

  const planetByName = Object.fromEntries(planets.map((p) => [p.name, p]));
  const aspects = (chart?.aspects || []).filter((a) => planetByName[a.planet1] && planetByName[a.planet2] && ASPECT_STYLE[a.aspect]);
  const houses = Object.values(chart?.houses || {});
  const axisPoints = [
    { key: "ASC", lon: ascLon }, { key: "DSC", lon: descLon },
    { key: "MC", lon: mcLon }, { key: "IC", lon: icLon },
  ].filter((p) => typeof p.lon === "number");

  const centerId = `cw-center-${size}`;

  return (
    <div className="wheel-stage">
      <div className="wheel-glow" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={t("Колесо натальной карты")}>
        <defs>
          <radialGradient id={centerId} cx="45%" cy="40%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1ebfa" />
          </radialGradient>
        </defs>

        {/* внешний геометрический циферблат */}
        <circle cx={cx} cy={cy} r={outerR + size * 0.012} fill="#fffdfd" stroke="#ddd2ec" strokeWidth="1" />
        {ZODIAC.map((glyph, i) => {
          const start = disp(i * 30);
          const rawEnd = disp(i * 30 + 30);
          const end = rawEnd <= start ? rawEnd + 360 : rawEnd;
          const el = ELEMENTS[Math.floor(i / 3)];
          return <path key={`sector-${i}`} d={wedgePath(cx, cy, zodiacInnerR, zodiacOuterR, start, end)} fill={el.bg} />;
        })}

        <circle cx={cx} cy={cy} r={zodiacOuterR} fill="none" stroke="#cfc1e5" strokeWidth="1.15" />
        <circle cx={cx} cy={cy} r={zodiacInnerR} fill="none" stroke="#d9cdea" strokeWidth="0.9" />

        {ZODIAC.map((glyph, i) => {
          const a = disp(i * 30);
          const from = polarToXY(cx, cy, zodiacInnerR - 1, a);
          const to = polarToXY(cx, cy, zodiacOuterR + 1, a);
          return <line key={`z-divider-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#ffffff" strokeWidth="1.1" />;
        })}

        {ZODIAC.map((glyph, i) => {
          const a = disp(i * 30 + 15);
          const pos = polarToXY(cx, cy, badgeR, a);
          const el = ELEMENTS[Math.floor(i / 3)];
          const d = badgeSize * 0.64;
          return (
            <g key={`sign-${i}`}>
              <rect x={pos.x - d} y={pos.y - d} width={d * 2} height={d * 2} rx={d * 0.18} transform={`rotate(45 ${pos.x} ${pos.y})`} fill="rgba(255,255,255,.66)" stroke={el.line} strokeWidth="0.7" />
              <text x={pos.x} y={pos.y + badgeSize * 0.02} textAnchor="middle" dominantBaseline="central" fontSize={badgeSize * 0.62} fill={el.accent}>{glyph}</text>
            </g>
          );
        })}

        {/* кольцо домов */}
        <circle cx={cx} cy={cy} r={houseOuterR} fill="#fcfbfe" stroke="#ded5ec" strokeWidth="0.9" />
        <circle cx={cx} cy={cy} r={houseInnerR} fill="none" stroke="#e4dcee" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={aspectR} fill="#faf8fd" stroke="#e8e0f0" strokeWidth="0.7" />

        {houses.map((house, index) => {
          const a = disp(house.longitude);
          const inner = polarToXY(cx, cy, houseInnerR, a);
          const outer = polarToXY(cx, cy, houseOuterR, a);
          const isAxis = index === 0 || index === 3 || index === 6 || index === 9;
          return <line key={`house-line-${index + 1}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={isAxis ? "#a993c9" : "#cfc4df"} strokeWidth={isAxis ? "1.45" : "0.72"} />;
        })}

        {houses.map((house, index) => {
          const next = houses[(index + 1) % houses.length]?.longitude ?? house.longitude + 30;
          let span = next - house.longitude;
          if (span <= 0) span += 360;
          const midAngle = disp(house.longitude + span / 2);
          const pos = polarToXY(cx, cy, (houseInnerR + houseOuterR) / 2, midAngle);
          return (
            <g key={`house-number-${index + 1}`}>
              <rect x={pos.x - houseBadgeSize * 0.65} y={pos.y - houseBadgeSize * 0.65} width={houseBadgeSize * 1.3} height={houseBadgeSize * 1.3} rx="2" fill="#ffffff" stroke="#e1d7ed" strokeWidth="0.55" />
              <text x={pos.x} y={pos.y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.024} fontWeight="800" fill="#9e8bbb">{index + 1}</text>
            </g>
          );
        })}

        {/* внутренний хаб аспектов */}
        <polygon points={polygonPoints(cx, cy, aspectR, 12, 15)} fill="none" stroke="#ded5eb" strokeWidth="0.75" />
        <polygon points={polygonPoints(cx, cy, aspectR * 0.62, 12, 15)} fill="none" stroke="#ebe5f2" strokeWidth="0.7" strokeDasharray="1 3" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = disp(i * 30);
          const from = polarToXY(cx, cy, centerR, a);
          const to = polarToXY(cx, cy, aspectR, a);
          return <line key={`axis-grid-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#e5deef" strokeWidth="0.7" />;
        })}

        {/* аспекты (цвет — по ASPECT_NATURE) */}
        {aspects.map((a, i) => {
          const p1 = planetByName[a.planet1];
          const p2 = planetByName[a.planet2];
          const pos1 = polarToXY(cx, cy, aspectR, p1.dispAngle);
          const pos2 = polarToXY(cx, cy, aspectR, p2.dispAngle);
          const style = ASPECT_STYLE[a.aspect];
          const color = NATURE_COLOR[ASPECT_NATURE[a.aspect]] || "#b6abcf";
          return <line key={`aspect-${i}`} x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y} stroke={color} strokeWidth={style.width} strokeDasharray={style.dash || undefined} opacity="0.62" />;
        })}

        {/* поводки к истинному градусу для сдвинутых меток */}
        {planets.filter((p) => p.displaced).map((planet) => {
          const truePos = polarToXY(cx, cy, houseInnerR, planet.angle);
          const dispPos = polarToXY(cx, cy, planet.dispR, planet.dispAngle);
          return (
            <path
              key={`leader-${planet.name}`}
              d={`M ${truePos.x} ${truePos.y} L ${dispPos.x} ${dispPos.y}`}
              stroke="#c9bce0"
              strokeWidth="0.6"
              fill="none"
            />
          );
        })}
        {planets.filter((p) => p.displaced).map((planet) => {
          const truePos = polarToXY(cx, cy, houseInnerR, planet.angle);
          return <circle key={`tick-${planet.name}`} cx={truePos.x} cy={truePos.y} r={size * 0.006} fill="#b6a6d6" />;
        })}

        {/* планеты */}
        {planets.map((planet) => {
          const pos = polarToXY(cx, cy, planet.dispR, planet.dispAngle);
          const el = ELEMENTS[planet.element];
          const iconSize = planetMarkerR * 1.3;
          return (
            <g key={planet.name}>
              <rect x={pos.x - marker / 2} y={pos.y - marker / 2} width={marker} height={marker} rx={5} fill="#ffffff" stroke={el.accent} strokeWidth="1.25" />
              <svg x={pos.x - iconSize / 2} y={pos.y - iconSize / 2} width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#251b3d" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
                {pointIconContent(planet.name)}
              </svg>
            </g>
          );
        })}

        {/* центр колеса */}
        <circle cx={cx} cy={cy} r={size * 0.016} fill={`url(#${centerId})`} stroke="#cfc1e5" strokeWidth="0.8" />

        {/* внешние подписи осей */}
        {axisPoints.map((p) => {
          const a = disp(p.lon);
          const pos = polarToXY(cx, cy, outerR + size * 0.055, a);
          return <text key={`axis-label-${p.key}`} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.026} fontWeight="800" letterSpacing=".06em" fill="#725caf">{p.key}</text>;
        })}
      </svg>
    </div>
  );
}
