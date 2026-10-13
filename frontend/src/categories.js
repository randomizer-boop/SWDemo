// Единый источник правды по категориям разбора (порядок, лимиты точек, цена в Stars)

import personalityIcon from "./assets/icons/personality.svg";
import romanceIcon from "./assets/icons/romance.svg";
import careerIcon from "./assets/icons/career.svg";
import financeIcon from "./assets/icons/finance.svg";
import forecastIcon from "./assets/icons/forecast.svg";

export const CATEGORY_ICONS = {
  personality: personalityIcon,
  love: romanceIcon,
  career: careerIcon,
  money: financeIcon,
};

// Бесплатный тизер "Кто ты" с главного экрана — не входит в CATEGORIES.
// Его тексты лежат в src/content (см. lib/whoYouAre.js).
export const FREE_TEASER_ID = "personality_teaser";

export const FREE_TEASER = {
  id: FREE_TEASER_ID,
  icon: CATEGORY_ICONS.personality,
};

export const CATEGORIES = [
  {
    id: "personality",
    icon: CATEGORY_ICONS.personality,
    name: "Личность",
    shortDesc: "Пять точек, из которых складывается характер",
    teaser:
      "Глубже, чем бесплатный обзор на главном экране: Солнце, Луна, Асцендент, управитель ASC и Меркурий — как эти пять точек складываются в цельный характер.",
    locked: true,
    price: 149,
  },
  {
    id: "love",
    icon: CATEGORY_ICONS.love,
    name: "Отношения",
    shortDesc: "Как ты влюбляешься и что притягивает",
    teaser:
      "Твой любовный «почерк»: Венера, Марс и то, что стоит в 7 доме. Не синастрия с конкретным человеком — это появится позже.",
    locked: true,
    price: 149,
  },
  {
    id: "career",
    icon: CATEGORY_ICONS.career,
    name: "Карьера",
    shortDesc: "MC, предназначение, путь",
    teaser:
      "От вершины карты к деталям: знак MC → управитель MC → Сатурн → Северный узел и Парс Фортуны.",
    locked: true,
    price: 149,
  },
  {
    id: "money",
    icon: CATEGORY_ICONS.money,
    name: "Финансы",
    shortDesc: "Склад характера в деньгах",
    teaser:
      "Без обещаний конкретных сумм — только тенденции и дисциплина через связку домов и планет денег.",
    locked: true,
    price: 149,
  },
];

// Подписка «Ежедневный прогноз + Таро» — не разовый разбор, поэтому не в CATEGORIES.
// id и цена совпадают с backend (content_categories: daily_subscription)
export const DAILY_SUBSCRIPTION = {
  id: "daily_subscription",
  icon: forecastIcon,
  name: "Прогноз",
  price: 249,
};

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
