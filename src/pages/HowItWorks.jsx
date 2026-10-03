import "./HowItWorks.css";
import { t } from "../i18n";

const STEPS = [
  {
    n: "1",
    tone: "lavender",
    title: "Введи данные",
    text: "Дата, время и город рождения",
  },
  {
    n: "2",
    tone: "rose",
    title: "Мы построим карту",
    text: "Рассчитаем положения планет и домов",
  },
  {
    n: "3",
    tone: "sky",
    title: "Получишь разбор",
    text: "Понятный персональный текст",
  },
];

export default function HowItWorks({
  onNext,
  onBack,
  step,
  total,
}) {
  return (
    <div className="screen screen-how step-enter">
      <div className="progress-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={i === step ? "active" : ""}
          />
        ))}
      </div>

      <div className="screen-body">
        <h2 className="hiw-title">
          {t("Как это работает")}
        </h2>

        <div className="hiw-list">
          {STEPS.map((item) => (
            <div className={`hiw-card hiw-card-${item.tone}`} key={item.n}>
              <span className="hiw-ghost-number" aria-hidden="true">
                {item.n}
              </span>

              <span className={`hiw-badge hiw-badge-${item.tone}`}>
                {item.n}
              </span>

              <div className="hiw-content">
                <div className="hiw-step-title">
                  {t(item.title)}
                </div>

                <p className="hiw-step-text">
                  {t(item.text)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-cta">
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
        >
          {t("Начать")}
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
