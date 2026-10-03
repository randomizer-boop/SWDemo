import { useState } from "react";
import { FREE_TEASER_ID } from "../categories";
import "./DevScreenSwitcher.css";

// DEV-ONLY: переключалка экранов (рендерится только при import.meta.env.DEV)
const SCREENS = [
  { step: "hero", label: "Hero" },
  { step: "learn", label: "Онбординг · 1" },
  { step: "how", label: "Онбординг · 2" },
  { step: "form", label: "Форма ввода" },
  { step: "result", label: "Результат / расчёт" },
  { step: "home", label: "Главная" },
  { step: "chart", label: "Полная карта" },
  { step: "daily", label: "Прогноз дня" },
  { step: "profile", label: "Профиль" },
  { step: "category", categoryId: FREE_TEASER_ID, label: "Категория · Кто ты (бесплатно)" },
  { step: "category", categoryId: "personality", label: "Категория · Личность (платно)" },
  { step: "category", categoryId: "love", label: "Категория · Отношения" },
  { step: "category", categoryId: "career", label: "Категория · Карьера" },
  { step: "category", categoryId: "money", label: "Категория · Финансы" },
];

export default function DevScreenSwitcher({ currentStep, currentCategoryId, onJump }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dev-switcher">
      <button
        type="button"
        className="dev-switcher-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Переключатель экранов (только для разработки)"
        title="DEV: переключить экран"
      >
        🛠
      </button>

      {open && (
        <div className="dev-switcher-panel" role="menu">
          <div className="dev-switcher-title">DEV · экраны</div>
          {SCREENS.map((s) => {
            const isActive =
              s.step === currentStep &&
              (s.step !== "category" || s.categoryId === currentCategoryId);
            return (
              <button
                key={`${s.step}-${s.categoryId || ""}`}
                type="button"
                className={`dev-switcher-item${isActive ? " is-active" : ""}`}
                onClick={() => {
                  onJump(s.step, s.categoryId);
                  setOpen(false);
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
