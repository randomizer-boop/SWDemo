// Вход для публичных страниц /privacy и /terms (privacy.html, terms.html).
// Показывает тот же LegalScreen, что и приложение, — текст один: lib/legal.js.
// Язык: русский по умолчанию, английский — по ссылке с ?lang=en.
import React from "react";
import ReactDOM from "react-dom/client";
import LegalScreen from "./components/LegalScreen";
import "./fonts.css";
import "./global.css";

const root = document.getElementById("root");
const doc = root.dataset.doc === "terms" ? "terms" : "privacy";
const lang =
  new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "ru";

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LegalScreen doc={doc} initialLang={lang} standalone />
  </React.StrictMode>
);
