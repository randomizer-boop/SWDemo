import { CATEGORIES } from "../categories";
import "./WhatYouLearn.css";
import { t } from "../i18n";

const TOPICS = [
  {
    id: "personality",
    label: "Личность",
    hint: "Как ты устроен(а) внутри",
  },
  {
    id: "love",
    label: "Любовь",
    hint: "Как ты чувствуешь и выбираешь",
  },
  {
    id: "career",
    label: "Карьера",
    hint: "Твой путь и сильные стороны",
  },
  {
    id: "money",
    label: "Финансы",
    hint: "Деньги, ресурсы и стабильность",
  },
];

export default function WhatYouLearn({
  onNext,
  onBack,
  step,
  total,
}) {
  return (
    <div className="screen screen-learn step-enter">
      <div className="progress-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={i === step ? "active" : ""}
          />
        ))}
      </div>

      <div className="screen-body">
        <h2 className="wyl-title">
          {t("Что ты узнаешь")}
        </h2>

        <p className="wyl-subtitle">
          {t("Натальная карта раскрывает больше, чем один знак зодиака.")}
        </p>

        <div className="wyl-grid">
          {TOPICS.map((topic) => {
            const category = CATEGORIES.find((item) => item.id === topic.id);

            return (
              <div
                key={topic.id}
                className={`wyl-card wyl-${topic.id}`}
              >
                <div className="wyl-top">
                  <img
                    className="wyl-symbol"
                    src={category?.icon}
                    alt=""
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <div className="wyl-label">
                    {t(topic.label)}
                  </div>

                  <div className="wyl-hint">
                    {t(topic.hint)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="footer-cta">
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
        >
          {t("Далее")}
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={onBack}
        >
          {t("Назад")}
        </button>
      </div>
    </div>
  );
}
