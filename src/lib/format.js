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