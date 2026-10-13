// Демо-профиль: вымышленные данные рождения + готовый бесплатный разбор.
// Карта (demoChart.js) рассчитана движком проекта для этих же данных.

export { DEMO_CHART } from "./demoChart";

// Формат совпадает с тем, что собирает BirthForm (buildBirthData)
export const DEMO_BIRTH_DATA = {
  date: { day: "27", month: "04", year: "1997" },
  time: { hour: "07", minute: "30" },
  timeIsApproximate: false,
  city: "Ташкент, Узбекистан",
  gender: "female",
  location: { latitude: 41.2646, longitude: 69.2163 },
  timezoneName: "Asia/Tashkent",
};

// Подсказка города для формы (формат ответа GET /cities/search)
export const DEMO_CITY = {
  city: "Ташкент",
  region: null,
  country: "Узбекистан",
  label: DEMO_BIRTH_DATA.city,
  latitude: DEMO_BIRTH_DATA.location.latitude,
  longitude: DEMO_BIRTH_DATA.location.longitude,
  timezone_name: DEMO_BIRTH_DATA.timezoneName,
};
