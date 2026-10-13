import { useEffect, useState } from "react";
import { LEGAL_DOCS, LEGAL_LABELS } from "../lib/legal";
import { SUPPORT_EMAIL, WEBSITE_URL } from "../lib/constants";
import "./LegalScreen.css";
import { getLang } from "../i18n";

const LANGS = ["ru", "en"];

// Адреса публичных страниц документов (privacy.html, terms.html)
const PUBLIC_PATH = { privacy: "/privacy", terms: "/terms" };

// Полноэкранная страница документа (Политика / Условия) с переключателем RU / EN.
// doc — "privacy" | "terms". standalone — отдельная публичная страница
// (/privacy, /terms): без кнопки «Назад», со ссылкой на второй документ.
// ДЕМО: язык документа по умолчанию — язык интерфейса
export default function LegalScreen({
  doc,
  onClose,
  initialLang,
  standalone = false,
}) {
  const [lang, setLang] = useState(() => initialLang || getLang());
  const content = LEGAL_DOCS[doc]?.[lang];
  const labels = LEGAL_LABELS[lang];

  // Отдельная страница: заголовок вкладки и язык документа
  useEffect(() => {
    if (!standalone || !content) return;
    document.title = `${content.title} — StarWise`;
    document.documentElement.lang = lang;
  }, [standalone, content, lang]);

  useEffect(() => {
    if (standalone) return undefined;
    // Блокируем скролл страницы под оверлеем; Esc — закрыть
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, standalone]);

  if (!content) return null;

  const otherDoc = doc === "privacy" ? "terms" : "privacy";

  const renderContact = (kind, key) => (
    <div className="legal-contact" key={key}>
      {kind === "full" && <strong>StarWise</strong>}
      <span>{labels.supportBot}</span>
      {SUPPORT_EMAIL && (
        <span>
          Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </span>
      )}
      {kind === "full" && WEBSITE_URL && (
        <span>
          {labels.website}:{" "}
          <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
            {WEBSITE_URL}
          </a>
        </span>
      )}
    </div>
  );

  const renderBlock = (block, i) => {
    if (typeof block === "string") return <p key={i}>{block}</p>;
    if (block.h) return <h3 key={i}>{block.h}</h3>;
    if (block.list) {
      return (
        <ul key={i}>
          {block.list.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    }
    if (block.contact) return renderContact(block.contact, i);
    return null;
  };

  return (
    <div
      className="legal-overlay"
      role={standalone ? "main" : "dialog"}
      aria-modal={standalone ? undefined : "true"}
      aria-labelledby="legal-title"
    >
      <div className="legal-bar">
        {standalone ? (
          <span className="legal-brand">StarWise</span>
        ) : (
          <button type="button" className="legal-back" onClick={onClose}>
            <span aria-hidden="true">←</span> {labels.back}
          </button>
        )}

        <div className="legal-lang" role="group" aria-label="Language">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? "is-active" : ""}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="legal-scroll">
        <article className="legal-doc" lang={lang}>
          <h1 id="legal-title">{content.title}</h1>
          <p className="legal-updated">{content.updated}</p>

          {content.intro.map((text, i) => (
            <p key={i}>{text}</p>
          ))}

          {content.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.blocks.map(renderBlock)}
            </section>
          ))}

          {standalone && (
            <p className="legal-other">
              <a
                href={`${PUBLIC_PATH[otherDoc]}${lang === "en" ? "?lang=en" : ""}`}
              >
                {LEGAL_DOCS[otherDoc][lang].title}
              </a>
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
