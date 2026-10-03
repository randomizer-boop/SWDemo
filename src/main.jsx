import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import DemoShell from "./demo/DemoShell";
import DemoBanner from "./demo/DemoBanner";
import { IS_EMBEDDED, DESKTOP_MIN_WIDTH } from "./demo/config";
import { initTelegram } from "./lib/telegram";
import { useLang } from "./i18n";
import "./global.css";

// Telegram WebApp init — must run once, before the app renders
initTelegram();

if (IS_EMBEDDED) {
  document.documentElement.classList.add("is-embedded");
}

const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;

// ДЕМО: на широком экране — страница с описанием и приложением в рамке
// телефона (iframe с ?embed=1); на телефоне — приложение с полоской "Демо".
function Root() {
  // Подписка на язык: при переключении RU/EN перерисовывается всё дерево
  useLang();

  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (IS_EMBEDDED) return <App />;
  if (isDesktop) return <DemoShell />;

  return (
    <div className="has-demo-banner">
      <DemoBanner />
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
