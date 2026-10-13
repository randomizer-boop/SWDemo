// Согласие перед покупкой — строка над кнопкой оплаты (требование Telegram:
// пользователь подтверждает условия до оплаты). Названия документов открывают
// их полный текст: onOpenLegal("terms" | "privacy").
import { t } from "../i18n";

export default function PurchaseConsent({ onOpenLegal }) {
  return (
    <p className="legal-note purchase-consent">
      {t("Оплачивая, ты подтверждаешь, что принимаешь")}{" "}
      <button type="button" onClick={() => onOpenLegal?.("terms")}>
        {t("Условия использования")}
      </button>{" "}
      {t("и")}{" "}
      <button type="button" onClick={() => onOpenLegal?.("privacy")}>
        {t("Политику конфиденциальности")}
      </button>
      .
    </p>
  );
}
