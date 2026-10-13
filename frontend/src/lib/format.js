import { t, tx } from "../i18n";
// Форматтеры данных рождения и дат

export function formatDate(birthData) {
  const date = birthData?.date;
  if (!date?.day || !date?.month || !date?.year) return "—";
  return `${String(date.day).padStart(2, "0")}.${String(date.month).padStart(
    2,
    "0"
  )}.${date.year}`;
}

export function formatTime(birthData) {
  if (!birthData?.time) return "—";
  return `${String(birthData.time.hour).padStart(2, "0")}:${String(
    birthData.time.minute
  ).padStart(2, "0")}`;
}

export function formatGender(gender) {
  if (gender === "female") return t("Ж");
  if (gender === "male") return t("М");
  return "—";
}

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

// Сегодняшняя дата в виде "3 сентября" (EN: "September 3")
export function formatLongDate(date = new Date()) {
  return t("{day} {month}", {
    day: date.getDate(),
    month: tx("month", MONTHS_GENITIVE[date.getMonth()]),
  });
}

// Градус внутри знака: 6.88 → "6°53′"
export function formatDegree(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  // Округляем до минут, но не выходим за пределы знака (29°59′)
  const totalMinutes = Math.min(Math.round(value * 60), 30 * 60 - 1);
  const deg = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  return `${deg}°${String(min).padStart(2, "0")}′`;
}
