// Единый источник правды по категориям разбора (порядок, лимиты точек, цена в Stars)

import personalityIcon from "./assets/icons/personality.svg";
import romanceIcon from "./assets/icons/romance.svg";
import careerIcon from "./assets/icons/career.svg";
import financeIcon from "./assets/icons/finance.svg";

export const CATEGORY_ICONS = {
  personality: personalityIcon,
  love: romanceIcon,
  career: careerIcon,
  money: financeIcon,
};

// Бесплатный тизер "Кто ты" с главного экрана — не входит в CATEGORIES
export const FREE_TEASER_ID = "personality_teaser";

export const FREE_TEASER = {
  id: FREE_TEASER_ID,
  icon: CATEGORY_ICONS.personality,
  name: "Кто ты",
  teaser:
    "Короткий, но узнаваемый портрет по трём точкам — Солнце, Луна и Асцендент.",
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

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}
