import { useEffect, useRef, useState } from "react";
import { BOT_URL, ADMIN_DEMO_URL, TIKTOK_URL } from "./config";
import { resetDemo } from "./reset";
import LangSwitch from "./LangSwitch";
import { t } from "../i18n";
import "./DemoShell.css";

// Экран телефона в логических пикселях (пропорция 9:19.5) и толщина рамки.
// Рамка целиком масштабируется под высоту окна, пропорция не меняется.
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 11;
const PAGE_MARGIN = 32; // отступ сверху + снизу
const MIN_SCALE = 0.55;

function computeScale() {
  const available = window.innerHeight - PAGE_MARGIN;
  return Math.max(MIN_SCALE, Math.min(1, available / (SCREEN_H + BEZEL * 2)));
}

// Быстрые переходы по экранам (сообщение в iframe, см. App.jsx)
const SCREENS = [
  { label: "Старт", step: "hero" },
  { label: "Форма", step: "form" },
  { label: "Главная", step: "home" },
  { label: "Полная карта", step: "chart" },
  { label: "Бесплатный разбор", step: "category", categoryId: "personality_teaser" },
  { label: "Платный разбор", step: "category", categoryId: "career" },
  { label: "Прогноз дня", step: "daily" },
  { label: "Профиль", step: "profile" },
];

const STACK = [
  "React + Vite",
  "Telegram Mini App",
  "FastAPI",
  "Swiss Ephemeris",
  "aiogram",
  "Telegram Stars",
  "PostgreSQL",
];

// Десктопная страница демо: описание слева, приложение в рамке телефона справа
export default function DemoShell() {
  const frameRef = useRef(null);
  const [frameKey, setFrameKey] = useState(0);
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const onResize = () => setScale(computeScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const jump = (screen) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "starwise-demo-jump", step: screen.step, categoryId: screen.categoryId },
      window.location.origin
    );
  };

  const restart = () => {
    resetDemo();
    setFrameKey((k) => k + 1);
  };

  return (
    <div className="demo-shell">
      <main className="demo-shell-inner">
        <section className="demo-info">
          <div className="demo-topline">
            <span className="demo-eyebrow">✦ {t("Демо-версия")}</span>
            <LangSwitch />
          </div>

          <h1 className="demo-title">StarWise</h1>
          <p className="demo-lead">
            {t(
              "Telegram Mini App с натальной картой. Пользователь вводит дату, время и город рождения — получает рассчитанную карту, бесплатный портрет и платные разборы по категориям."
            )}
          </p>

          <div className="demo-actions">
            {BOT_URL && (
              <a
                className="demo-btn demo-btn-primary"
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Открыть бота в Telegram ↗")}
              </a>
            )}
            <button type="button" className="demo-btn demo-btn-ghost" onClick={restart}>
              {t("Начать заново")}
            </button>
            {TIKTOK_URL && (
              <a
                className="demo-text-link"
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok ↗
              </a>
            )}
          </div>

          {/* Вторая сторона продукта: панель владельца */}
          <a
            className="demo-admin-card"
            href={ADMIN_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="demo-admin-body">
              <span className="demo-admin-label">{t("Админ-панель владельца")}</span>
              <span className="demo-admin-text">
                {t(
                  "Платежи, пользователи, поддержка и цены — на вымышленных данных, без пароля."
                )}
              </span>
            </span>
            <span className="demo-admin-cta">{t("Открыть демо ↗")}</span>
          </a>

          <div className="demo-block">
            <h2>{t("Что здесь показано")}</h2>
            <ul>
              <li>
                {t(
                  "Весь путь пользователя: онбординг → форма → расчёт → главная → карта → разборы."
                )}
              </li>
              <li>
                {t(
                  "Профиль вымышленный: Ташкент, 27.04.1997, 07:30. Свои данные вводятся в боте."
                )}
              </li>
              <li>
                {t(
                  "Карта рассчитана движком проекта (Swiss Ephemeris, дома Плацидус) и сохранена статически — бэкенда на этой странице нет."
                )}
              </li>
              <li>{t("Бесплатный разбор открыт, платные закрыты пейволлом.")}</li>
            </ul>
          </div>

          <div className="demo-block">
            <h2>{t("Перейти к экрану")}</h2>
            <div className="demo-chips">
              {SCREENS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className="demo-chip"
                  onClick={() => jump(s)}
                >
                  {t(s.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="demo-block">
            <h2>{t("Стек рабочей версии")}</h2>
            <div className="demo-stack">
              {STACK.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="demo-phone-wrap" aria-label={t("Приложение StarWise")}>
          <div
            className="demo-phone"
            style={{
              width: (SCREEN_W + BEZEL * 2) * scale,
              height: (SCREEN_H + BEZEL * 2) * scale,
              padding: BEZEL * scale,
              borderRadius: 58 * scale,
            }}
          >
            <div className="demo-phone-clip" style={{ borderRadius: 47 * scale }}>
              <iframe
                key={frameKey}
                ref={frameRef}
                className="demo-phone-screen"
                title={t("StarWise — демо приложения")}
                src={`${import.meta.env.BASE_URL}?embed=1`}
                style={{
                  width: SCREEN_W,
                  height: SCREEN_H,
                  transform: `scale(${scale})`,
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
