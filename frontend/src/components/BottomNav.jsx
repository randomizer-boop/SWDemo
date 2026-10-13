import "./BottomNav.css";
import { t } from "../i18n";

// Иконки нижней навигации — свои SVG одного размера (символы-глифы на iOS
// подменяются эмодзи и выглядят по-разному)
const ICONS = {
  home: (
    <>
      <path d="M4 11.2 12 4.5l8 6.7" />
      <path d="M6.2 9.8V19a.8.8 0 0 0 .8.8h10a.8.8 0 0 0 .8-.8V9.8" />
      <path d="M10 19.8v-5h4v5" />
    </>
  ),
  chart: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" fill="currentColor" />
    </>
  ),
  daily: (
    <path d="M12 3.5l1.9 6.6 6.6 1.9-6.6 1.9L12 20.5l-1.9-6.6-6.6-1.9 6.6-1.9z" />
  ),
  profile: (
    <>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M5 19.8c.5-3.4 3.3-5.4 7-5.4s6.5 2 7 5.4" />
    </>
  ),
};

const ITEMS = [
  { id: "home", label: "Главная" },
  { id: "chart", label: "Карта" },
  { id: "daily", label: "Прогноз" },
  { id: "profile", label: "Профиль" },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label={t("Основная навигация")}>
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={
            "nav-item" + (active === item.id ? " active" : "")
          }
          onClick={() => onNavigate(item.id)}
        >
          <svg
            className="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICONS[item.id]}
          </svg>
          <span>{t(item.label)}</span>
        </button>
      ))}
    </nav>
  );
}
