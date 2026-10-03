import LegalLinks from "../components/LegalLinks";
import "./Hero.css";
import { t } from "../i18n";

export default function Hero({ onNext, onOpenLegal }) {
  return (
    <div className="screen screen-hero step-enter">
      <div className="hero-scene" aria-hidden="true">
        <div className="hero-orb hero-orb-a">
          <span className="hero-orb-ring" />
        </div>
        <div className="hero-orb hero-orb-b">
          <span className="hero-orb-ring" />
        </div>
        <div className="hero-orb hero-orb-c" />
      </div>

      <div className="screen-body hero-body">
        <div className="brand-mark">
          <span className="spark">✦</span>
          <span className="brand-name">StarWise</span>
        </div>

        <h1 className="hero-title">
          {t("Твоя натальная карта —")}
          <br />
          <span>{t("понятным языком.")}</span>
        </h1>

        <p className="hero-subtitle">
          {t("Узнай больше о своей личности, отношениях, карьере и финансах по натальной карте.")}
        </p>
      </div>

      <div className="footer-cta">
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
        >
          {t("Рассчитать карту")}
        </button>

        {/* Невидимая кнопка-заглушка — держит высоту футера, как на экранах с "Назад" */}
        <button
          type="button"
          className="btn-ghost"
          style={{ visibility: "hidden" }}
          tabIndex={-1}
          aria-hidden="true"
        >
          {t("Назад")}
        </button>
      </div>

      {/* Строка согласия + ссылки на документы — у нижнего края экрана */}
      <div className="hero-legal">
        <p className="legal-note">
          {t("Используя StarWise, ты соглашаешься с Условиями использования и принимаешь к сведению Политику конфиденциальности.")}
        </p>
        <LegalLinks onOpen={onOpenLegal} />
      </div>
    </div>
  );
}