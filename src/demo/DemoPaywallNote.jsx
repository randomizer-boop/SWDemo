import { BOT_URL } from "./config";
import { t } from "../i18n";

// Подпись под кнопкой оплаты в демо: платные разборы закрыты,
// полная версия — в Telegram-боте.
export default function DemoPaywallNote() {
  return (
    <div className="demo-paywall-note">
      <p>{t("В демо-версии платные разборы закрыты, оплата отключена.")}</p>
      {BOT_URL && (
        <a href={BOT_URL} target="_blank" rel="noopener noreferrer">
          {t("Открыть бота в Telegram ↗")}
        </a>
      )}
    </div>
  );
}
