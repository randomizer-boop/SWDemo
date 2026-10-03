import { BOT_URL } from "./config";
import { resetDemo } from "./reset";
import LangSwitch from "./LangSwitch";
import { t } from "../i18n";
import "./DemoShell.css";

// Мобильная версия страницы демо: тонкая полоска над приложением
export default function DemoBanner() {
  const restart = () => {
    resetDemo();
    window.location.reload();
  };

  return (
    <div className="demo-banner">
      <span className="demo-banner-title">✦ StarWise · {t("демо")}</span>
      <span className="demo-banner-links">
        <button type="button" onClick={restart}>
          {t("Заново")}
        </button>
        {BOT_URL && (
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer">
            {t("Бот ↗")}
          </a>
        )}
        <LangSwitch className="lang-switch-dark" />
      </span>
    </div>
  );
}
