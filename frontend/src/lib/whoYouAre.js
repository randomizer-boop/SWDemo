// Бесплатный экран «Кто ты»: собирает готовый набор текстов из статического
// контента (src/content/*.json) по рассчитанной карте. Только чтение JSON —
// никаких запросов к серверу и никакой генерации текста.

import signs from "../content/signs.json";
import houses from "../content/houses.json";
import combinations from "../content/combinations.json";
import aspects from "../content/aspects.json";
import smallTexts from "../content/smallTexts.json";
import ui from "../content/ui.json";
import teaser from "../content/teaser.json";
import { formatDegree } from "./format";

// Порядок вкладок и карточек: Асцендент → Солнце → Луна
const POSITION_ORDER = teaser.cardOrder; // ["Asc", "Sun", "Moon"]

// Движок отдаёт знаки, планеты и аспекты по-русски; ключи контента — английские
const SIGN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_KEY = {
  "Овен": "Aries",
  "Телец": "Taurus",
  "Близнецы": "Gemini",
  "Рак": "Cancer",
  "Лев": "Leo",
  "Дева": "Virgo",
  "Весы": "Libra",
  "Скорпион": "Scorpio",
  "Стрелец": "Sagittarius",
  "Козерог": "Capricorn",
  "Водолей": "Aquarius",
  "Рыбы": "Pisces",
};

const ELEMENT_ORDER = ["fire", "earth", "air", "water"];

const PLANET_KEY = {
  "Луна": "Moon",
  "Меркурий": "Mercury",
  "Венера": "Venus",
  "Марс": "Mars",
  "Юпитер": "Jupiter",
  "Сатурн": "Saturn",
  "Уран": "Uranus",
  "Нептун": "Neptune",
  "Плутон": "Pluto",
};

const ASPECT_KEY = {
  "Соединение": "conjunction",
  "Секстиль": "sextile",
  "Квадрат": "square",
  "Трин": "trine",
  "Оппозиция": "opposition",
};

// Подписи точек: tab — на вкладке, name — в тексте («Солнце в 12 доме»)
const POSITION_META = {
  Asc: { tab: "ASC", name: "Асцендент", blendLabel: ui.outside },
  Sun: { tab: "Солнце", name: "Солнце", blendLabel: ui.inside },
  Moon: { tab: "Луна", name: "Луна", blendLabel: ui.inFeelings },
};

// ===== «Особенность карты» — «Правила для движка», п. 5 =====
// Баллы связи = точность (1 − орбис / допуск) × вес планеты × вес связи.

// Допуск (орбис) по виду связи, в градусах
const FEATURE_ORB = {
  conjunction: 6,
  opposition: 6,
  square: 5,
  trine: 5,
  sextile: 4,
};

// Вес планеты: «выше» у Сатурна, Плутона, Урана, Нептуна, Марса, Юпитера,
// «ниже» у Меркурия, Венеры, Луны. Точных чисел в правилах нет — заданы здесь.
const PLANET_WEIGHT = {
  Saturn: 1,
  Pluto: 1,
  Uranus: 1,
  Neptune: 1,
  Mars: 1,
  Jupiter: 1,
  Mercury: 0.7,
  Venus: 0.7,
  Moon: 0.7,
};

// Вес связи — те же значения, что в lib/aspects.js (ASPECT_TYPE_WEIGHT)
const ASPECT_WEIGHT = {
  conjunction: 1,
  opposition: 1,
  square: 0.9,
  trine: 0.9,
  sextile: 0.7,
};

// Мягкие связи: если у Солнца есть только они — показываем запасной текст
const SOFT_ASPECTS = new Set(["trine", "sextile"]);

// Управитель знака Солнца — связь с ним пропускаем (у Льва управитель — само Солнце)
const SIGN_RULER = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Pluto",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Uranus",
  Pisces: "Neptune",
};

// Максимальная скорость Луны, градусов в сутки — для режима «без времени»
const MOON_MAX_SPEED = 15.4;

// Подставляет значения в шаблон: "{sign}", "{asc.keyword}" и т.п.
function fill(template, vars) {
  return String(template).replace(/\{([\w.]+)\}/g, (match, key) =>
    key in vars ? vars[key] : match
  );
}

function elementOf(signKey) {
  return ELEMENT_ORDER[SIGN_ORDER.indexOf(signKey) % 4];
}

function isOpposite(a, b) {
  return Math.abs(SIGN_ORDER.indexOf(a) - SIGN_ORDER.indexOf(b)) === 6;
}

// Положение точки в карте: { signKey, degree, house }
function readPoint(chart, id) {
  const raw =
    id === "Asc"
      ? chart?.angles?.ascendant
      : chart?.planets?.[POSITION_META[id].name];
  const signKey = SIGN_KEY[raw?.sign];
  if (!signKey) return null;
  return {
    signKey,
    degree: raw.degree_in_sign,
    // Асцендент — начало 1 дома
    house: id === "Asc" ? 1 : raw.house ?? null,
  };
}

// «Не знаю точное время»: карта посчитана на время из формы (по умолчанию
// полдень). Возвращает пояснение к карточке Луны: весь день в одном знаке —
// или могла быть в соседнем.
function moonApproximateNote(moon, birthData) {
  if (typeof moon.degree !== "number") return null;
  const hour = Number(birthData?.time?.hour ?? 12);
  const minute = Number(birthData?.time?.minute ?? 0);
  const dayPart = (hour * 60 + minute) / 1440;
  const earliest = moon.degree - MOON_MAX_SPEED * dayPart;
  const latest = moon.degree + MOON_MAX_SPEED * (1 - dayPart);

  if (earliest > 0 && latest < 30) return ui.noTime.moon_one_sign_note;

  const index = SIGN_ORDER.indexOf(moon.signKey);
  const neighbour = SIGN_ORDER[(index + (earliest <= 0 ? 11 : 1)) % 12];
  return fill(ui.noTime.moon_may_differ_note, {
    sign_prepositional: signs.Moon[neighbour].namePrepositional,
  });
}

function buildCard(id, point, { signRepeats }) {
  const content = signs[id][point.signKey];
  const meta = POSITION_META[id];
  const element = elementOf(point.signKey);

  // У Асцендента дом всегда 1, фразы про дом у него нет
  const house = point.house;
  const housePhrase = house ? houses[id]?.[point.signKey]?.[String(house)] : null;

  return {
    id,
    tabLabel: meta.tab,
    positionName: meta.name,
    signKey: point.signKey,
    signName: content.name,
    element,
    elementName: ui.elementNames[element],
    eyebrow: content.subtitle,
    title: content.title,
    degree: formatDegree(point.degree),
    house,
    tagline: content.tagline,
    keywords: content.keywords,
    paragraphs: content.paragraphs,
    houseLine: housePhrase
      ? fill(ui.templates.houseLine, { planet: meta.name, n: house }) + housePhrase
      : null,
    strength: content.strength,
    // Знак уже встречался на экране — берём запасную «зону внимания»
    watch: signRepeats ? content.watchAlt : content.watch,
    blendLabel: meta.blendLabel,
    blendPhrase: content.blendPhrase,
    note: null,
  };
}

// Пояснения к блоку «Как это складывается» («Правила для движка», п. 4):
// совпавшие знаки — шаблон double_sign, противоположные — axis_note
// (один раз на пару знаков).
function buildSignNotes(points) {
  const { Asc, Sun, Moon } = points;
  const kw = (id) => signs[id][points[id].signKey].formulaKeyword;
  const sameSign = (a, b) => a && b && a.signKey === b.signKey;
  const names = (point) => {
    const content = signs.Sun[point.signKey];
    return { sign: content.name, sign_genitive: content.nameGenitive };
  };
  const notes = [];

  if (sameSign(Asc, Sun) && sameSign(Sun, Moon)) {
    notes.push(
      fill(ui.doubleSign.all_three, {
        ...names(Sun),
        kw_a: kw("Asc"),
        kw_b: kw("Sun"),
        kw_c: kw("Moon"),
      })
    );
  } else if (sameSign(Asc, Sun)) {
    notes.push(
      fill(ui.doubleSign.asc_eq_sun, {
        ...names(Sun),
        kw_a: kw("Asc"),
        kw_b: kw("Sun"),
      })
    );
  } else if (sameSign(Sun, Moon)) {
    notes.push(fill(ui.doubleSign.sun_eq_moon, names(Sun)));
  } else if (sameSign(Asc, Moon)) {
    notes.push(
      fill(ui.doubleSign.asc_eq_moon, {
        ...names(Moon),
        kw_a: kw("Asc"),
        kw_b: kw("Moon"),
      })
    );
  }

  // Из трёх точек противоположной может быть только одна пара знаков
  const pairs = [
    [Asc, Sun],
    [Sun, Moon],
    [Asc, Moon],
  ];
  const axis = pairs.find(
    ([a, b]) => a && b && isOpposite(a.signKey, b.signKey)
  );
  if (axis) {
    notes.push(
      fill(ui.doubleSign.axis_note, {
        sign_a: signs.Sun[axis[0].signKey].name,
        sign_b: signs.Sun[axis[1].signKey].name,
      })
    );
  }

  return notes;
}

// Подпись точности связи по орбису («точная связь» и т.п.)
function accuracyLabel(orb) {
  const list = smallTexts.accuracyLabels;
  const match = list.find((item) => orb >= item.orb_from && orb < item.orb_to);
  return (match || list[list.length - 1]).label;
}

// «Особенность карты»: связь Солнца с планетой, набравшая больше всего баллов,
// либо запасной текст («Правила для движка», п. 5)
function buildFeature(chart, sun) {
  const ruler = SIGN_RULER[sun.signKey];
  const candidates = [];

  for (const item of chart?.aspects || []) {
    const other =
      item.planet1 === "Солнце"
        ? item.planet2
        : item.planet2 === "Солнце"
          ? item.planet1
          : null;
    const planetKey = PLANET_KEY[other];
    const aspectKey = ASPECT_KEY[item.aspect];
    const entry = aspects.Sun?.[planetKey]?.[aspectKey];
    if (!entry?.possible || typeof item.orb !== "number") continue;
    if (planetKey === ruler) continue;

    const maxOrb = FEATURE_ORB[aspectKey];
    if (item.orb > maxOrb) continue;

    candidates.push({
      planet: other,
      aspect: item.aspect,
      aspectKey,
      orb: item.orb,
      text: entry.text,
      score:
        (1 - item.orb / maxOrb) *
        PLANET_WEIGHT[planetKey] *
        ASPECT_WEIGHT[aspectKey],
    });
  }

  const fallback = (text) => ({
    label: ui.specialty,
    headline: null,
    accuracy: null,
    text,
    where: null,
  });

  if (candidates.length === 0) {
    return fallback(smallTexts.noAspectFallback[elementOf(sun.signKey)]);
  }
  if (candidates.every((item) => SOFT_ASPECTS.has(item.aspectKey))) {
    return fallback(smallTexts.softAspectsFallback);
  }

  candidates.sort((a, b) => b.score - a.score || a.orb - b.orb);
  const best = candidates[0];
  // «Где проявляется» — по дому планеты
  const house = chart?.planets?.[best.planet]?.house;
  const where = house ? smallTexts.houseOfAspectingPlanet[String(house)] : null;

  return {
    label: ui.specialty,
    headline: `Солнце — ${best.planet} · ${best.aspect} · ${best.orb.toFixed(2)}°`,
    accuracy: accuracyLabel(best.orb),
    text: best.text,
    where: where ? `Где проявляется: ${where}.` : null,
  };
}

// Главная функция: карта → всё, что показывает экран. null — в карте нет
// Асцендента, Солнца или Луны (экран покажет заглушку).
// Если в форме отмечено «Не знаю точное время», карта посчитана на время по
// умолчанию (12:00) — портрет строится так же, по трём точкам; добавляются
// только предупреждение и пояснение в карточке Луны.
export function buildPortrait(chart, birthData) {
  const asc = readPoint(chart, "Asc");
  const sun = readPoint(chart, "Sun");
  const moon = readPoint(chart, "Moon");
  if (!asc || !sun || !moon) return null;

  const points = { Asc: asc, Sun: sun, Moon: moon };
  const timeIsApproximate = Boolean(birthData?.timeIsApproximate);

  const seenSigns = new Set();
  const cards = POSITION_ORDER.map((id) => {
    const point = points[id];
    const card = buildCard(id, point, {
      signRepeats: seenSigns.has(point.signKey),
    });
    seenSigns.add(point.signKey);
    return card;
  });

  if (timeIsApproximate) {
    cards.find((card) => card.id === "Moon").note = moonApproximateNote(
      moon,
      birthData
    );
  }

  const content = (id) => signs[id][points[id].signKey];
  const vars = {};
  for (const id of POSITION_ORDER) {
    const key = id.toLowerCase();
    vars[`${key}.sign`] = content(id).name;
    vars[`${key}.sign_genitive`] = content(id).nameGenitive;
    vars[`${key}.keyword`] = content(id).formulaKeyword;
    vars[`${key}.tagline`] = content(id).shortTagline;
    vars[`${key}.formula_line`] = content(id).formulaLine;
  }

  // «Как это складывается» — пара Асцендент + Солнце
  const combination = combinations.AscSun[asc.signKey][sun.signKey];

  return {
    eyebrow: teaser.eyebrow,
    title: teaser.title,
    subtitle: teaser.subtitle,
    formula: {
      title: teaser.formulaTitle,
      headline: fill(teaser.taglineLine, vars),
      text: fill(teaser.formulaIntro, vars),
    },
    cards,
    blend: {
      title: ui.howItComes,
      notes: buildSignNotes(points),
      text: combination.text,
      rhythm: combination.rhythm,
    },
    feature: buildFeature(chart, sun),
    // Время примерное — предупреждение и кнопка «Добавить время рождения»
    timeWarning: timeIsApproximate
      ? { text: ui.noTime.approximate_time_warning, button: ui.noTime.cta_button }
      : null,
    labels: {
      degree: ui.degree,
      house: ui.house,
      element: ui.element,
      strength: ui.strength,
      watch: ui.watch,
      nextTemplate: ui.nextButtonTemplate,
    },
    afterLast: ui.afterMoonCta,
    locked: { text: ui.lockedPersonality, cta: ui.lockedCta },
  };
}

// Текст кнопки «Дальше: Солнце · Телец →»
export function nextLabel(template, card) {
  return fill(template, { position: card.positionName, sign: card.signName });
}
