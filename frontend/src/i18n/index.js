// Простая локализация RU / EN.
// Русская строка служит ключом: t("Назад") вернёт "Назад" в RU и "Back" в EN.
// Значения из карты (планеты, знаки, аспекты) переводятся так же: t("Телец").
// Язык хранится в localStorage и синхронизируется между страницей демо
// и приложением в рамке телефона (событие storage).

import { useSyncExternalStore } from "react";
import en from "./en";

export const LANGS = ["ru", "en"];
const STORAGE_KEY = "starwise_lang";
// Языки браузера, для которых по умолчанию включается русский
const RU_LOCALES = ["ru", "kk", "uk", "be", "uz", "ky"];

function detectLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    // Хранилище недоступно — определяем по языку браузера
  }
  const browser = (
    typeof navigator !== "undefined" ? navigator.language || "" : ""
  )
    .slice(0, 2)
    .toLowerCase();
  return RU_LOCALES.includes(browser) ? "ru" : "en";
}

let current = typeof window !== "undefined" ? detectLang() : "ru";
const listeners = new Set();

function apply(lang) {
  if (!LANGS.includes(lang) || lang === current) return;
  current = lang;
  document.documentElement.lang = lang;
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  document.documentElement.lang = current;
  // Язык переключили в другом окне того же сайта (страница демо <-> iframe)
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) apply(event.newValue);
  });
}

export function getLang() {
  return current;
}

export function setLang(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Хранилище недоступно — язык сменится только до перезагрузки
  }
  apply(lang);
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Подписка на смену языка: достаточно вызвать в корневом компоненте —
// всё дерево перерисуется и t() вернёт строки на новом языке.
export function useLang() {
  return useSyncExternalStore(subscribe, getLang);
}

function fill(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) =>
    params[name] === undefined ? "" : String(params[name])
  );
}

// t("Открыть за {price} ⭐", { price: 149 })
export function t(key, params) {
  if (key === null || key === undefined) return key;
  const text = current === "en" ? en[key] ?? key : key;
  return fill(text, params);
}

// Перевод с контекстом — когда одно русское слово переводится по-разному:
// tx("tarot", "Луна") -> "The Moon", а t("Луна") -> "Moon"
export function tx(context, key, params) {
  if (current !== "en") return fill(key, params);
  return fill(en[`${context}|${key}`] ?? en[key] ?? key, params);
}
