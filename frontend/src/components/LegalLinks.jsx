import { t } from "../i18n";
// Две ссылки на юридические документы: Политика конфиденциальности | Условия использования.
// onOpen("privacy" | "terms") открывает LegalScreen (см. App.jsx).
export default function LegalLinks({ onOpen }) {
  return (
    <div className="legal-links">
      <button type="button" onClick={() => onOpen("privacy")}>
        {t("Политика конфиденциальности")}
      </button>
      <span aria-hidden="true">|</span>
      <button type="button" onClick={() => onOpen("terms")}>
        {t("Условия использования")}
      </button>
    </div>
  );
}
