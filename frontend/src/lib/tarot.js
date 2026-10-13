// Карта Таро дня: Старшие Арканы и их соответствия планетам/знакам
// (система Golden Dawn). Карта выбирается детерминированно по дате.
export const MAJOR_ARCANA = [
  { name: "Шут", correspondence: "Уран" },
  { name: "Маг", correspondence: "Меркурий" },
  { name: "Верховная Жрица", correspondence: "Луна" },
  { name: "Императрица", correspondence: "Венера" },
  { name: "Император", correspondence: "Овен" },
  { name: "Иерофант", correspondence: "Телец" },
  { name: "Влюблённые", correspondence: "Близнецы" },
  { name: "Колесница", correspondence: "Рак" },
  { name: "Сила", correspondence: "Лев" },
  { name: "Отшельник", correspondence: "Дева" },
  { name: "Колесо Фортуны", correspondence: "Юпитер" },
  { name: "Справедливость", correspondence: "Весы" },
  { name: "Повешенный", correspondence: "Нептун" },
  { name: "Смерть", correspondence: "Скорпион" },
  { name: "Умеренность", correspondence: "Стрелец" },
  { name: "Дьявол", correspondence: "Козерог" },
  { name: "Башня", correspondence: "Марс" },
  { name: "Звезда", correspondence: "Водолей" },
  { name: "Луна", correspondence: "Рыбы" },
  { name: "Солнце", correspondence: "Солнце" },
  { name: "Суд", correspondence: "Плутон" },
  { name: "Мир", correspondence: "Сатурн" },
];

// Строковый хэш (djb2) — раскладывает даты по индексам карт
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// dateKey — "YYYY-MM-DD" в локальном часовом поясе
export function todayDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function cardOfTheDay(dateKey = todayDateKey()) {
  const index = hashString(dateKey) % MAJOR_ARCANA.length;
  return MAJOR_ARCANA[index];
}