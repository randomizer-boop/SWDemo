// Отбор "важных" аспектов: убирает тавтологичные пары (Раху–Кету,
// Лилит–Селена) и ранжирует остальные по значимости.

// Пары, которые всегда в оппозиции по определению — не считаются аспектом
const TAUTOLOGICAL_PAIRS = [
  ["Раху", "Кету"],
  ["Лилит", "Селена"],
];

// "Вес" точки: светила > личные > социальные > внешние планеты > расчётные точки
const BODY_WEIGHT = {
  "Солнце": 3,
  "Луна": 3,
  "Меркурий": 2.2,
  "Венера": 2.2,
  "Марс": 2.2,
  "Юпитер": 1.8,
  "Сатурн": 1.8,
  "Уран": 1.3,
  "Нептун": 1.3,
  "Плутон": 1.3,
  "Хирон": 1,
  "Раху": 0.9,
  "Кету": 0.9,
  "Лилит": 0.9,
  "Вертекс": 0.7,
  "Парс Фортуны": 0.7,
  "Селена": 0.7,
};
const DEFAULT_BODY_WEIGHT = 0.6;

// Максимальный орбис по типу аспекта (как ASPECTS в backend/main_engine.py)
const ASPECT_MAX_ORB = {
  "Соединение": 8,
  "Секстиль": 6,
  "Квадрат": 7,
  "Трин": 7,
  "Квиконс": 3,
  "Оппозиция": 8,
};

// Вес типа аспекта
const ASPECT_TYPE_WEIGHT = {
  "Соединение": 1,
  "Оппозиция": 1,
  "Трин": 0.9,
  "Квадрат": 0.9,
  "Секстиль": 0.7,
  "Квиконс": 0.45,
};

function isTautological(a) {
  return TAUTOLOGICAL_PAIRS.some(
    ([x, y]) =>
      (a.planet1 === x && a.planet2 === y) ||
      (a.planet1 === y && a.planet2 === x)
  );
}

// Итоговый балл важности: (вес точек) × (вес типа аспекта) × (насколько
// узок орбис относительно допустимого максимума для этого типа).
export function aspectImportance(a) {
  const w1 = BODY_WEIGHT[a.planet1] ?? DEFAULT_BODY_WEIGHT;
  const w2 = BODY_WEIGHT[a.planet2] ?? DEFAULT_BODY_WEIGHT;
  const maxOrb = ASPECT_MAX_ORB[a.aspect] ?? 8;
  const orbTightness = Math.max(0, 1 - (a.orb ?? maxOrb) / maxOrb);
  const typeWeight = ASPECT_TYPE_WEIGHT[a.aspect] ?? 0.6;
  return (w1 + w2) * typeWeight * (0.4 + 0.6 * orbTightness);
}

// Убирает тавтологичные пары и сортирует аспекты по убыванию важности
export function rankAspects(aspects) {
  return (aspects || [])
    .filter((a) => !isTautological(a))
    .map((a) => ({ ...a, importance: aspectImportance(a) }))
    .sort((a, b) => b.importance - a.importance);
}
