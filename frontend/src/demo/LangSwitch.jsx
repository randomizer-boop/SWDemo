import { LANGS, getLang, setLang } from "../i18n";

// Переключатель языка RU / EN (общий для страницы демо и приложения)
export default function LangSwitch({ className = "" }) {
  const current = getLang();
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label="Language">
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          className={current === code ? "is-active" : ""}
          aria-pressed={current === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
