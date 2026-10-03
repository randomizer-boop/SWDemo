import { useEffect, useState } from "react";
import ChartWheel from "../components/ChartWheel";
import { calculateNatalChart } from "../lib/api";
import StatusScreen, { classifyFetchError } from "../components/StatusScreen";
import "./ResultScreen.css";
import { t } from "../i18n";

// Ошибки данных (исправляются в форме) — отдельно от сетевых/серверных сбоев
const DATA_ERRORS = new Set(["invalid_birth_data", "unknown_birth_time"]);

async function fetchChart(birthData) {
  if (!birthData?.date || !birthData?.city) {
    throw new Error("invalid_birth_data");
  }

  // Текущий backend требует точное время.
  if (!birthData.time) {
    throw new Error("unknown_birth_time");
  }

  // Ошибку бэкенда пробрасываем как есть (нужны err.status и текст)
  return calculateNatalChart({
    cityName: birthData.city,
    year: Number(birthData.date.year),
    month: Number(birthData.date.month),
    day: Number(birthData.date.day),
    hour: Number(birthData.time.hour),
    minute: Number(birthData.time.minute),
    // Координаты города, если он выбран из подсказки
    latitude: birthData.location?.latitude,
    longitude: birthData.location?.longitude,
    timezoneName: birthData.timezoneName,
  });
}

export default function ResultScreen({ birthData, onRestart, onReady }) {
  const [chart, setChart] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    setChart(null);
    setError(null);

    fetchChart(birthData)
      .then((data) => {
        if (active) {
          setChart(data);
          onReady?.(data);
        }
      })
      .catch((err) => {
        // Храним весь объект ошибки — нужен err.status
        if (active) {
          setError(err);
        }
      });

    return () => {
      active = false;
    };
  }, [birthData, retryCount]);

  // =========================
  // ОШИБКА В ДАННЫХ (до запроса) — вернуться и исправить в форме
  // =========================
  if (error && DATA_ERRORS.has(error.message)) {
    const message =
      error.message === "unknown_birth_time"
        ? t("Для текущей версии расчёта нужно указать точное время рождения.")
        : t("Проверь данные рождения и попробуй ещё раз.");

    return (
      <div className="screen step-enter screen-result-error">
        <div className="screen-body result-center">
          <span className="spark" style={{ fontSize: 32 }}>
            ✦
          </span>

          <p>{message}</p>

          <button className="btn-primary" onClick={onRestart}>
            {t("Начать заново")}
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // ОШИБКА В ДАННЫХ ОТ БЭКЕНДА (HTTP 400) — показываем текст ошибки
  // =========================
  if (error && error.status === 400) {
    return (
      <div className="screen step-enter screen-result-error">
        <div className="screen-body result-center">
          <span className="spark" style={{ fontSize: 32 }}>
            ✦
          </span>

          <p>{error.message || t("Проверь данные рождения и попробуй ещё раз.")}</p>

          <button className="btn-primary" onClick={onRestart}>
            {t("Начать заново")}
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // СЕТЬ / СЕРВЕР — кнопка "Повторить"
  // =========================
  if (error) {
    return (
      <StatusScreen
        variant={classifyFetchError()}
        onAction={() => setRetryCount((n) => n + 1)}
        onSecondary={onRestart}
        secondaryLabel={t("Изменить данные")}
      />
    );
  }

  // =========================
  // ЗАГРУЗКА
  // =========================
  if (!chart) {
    return (
      <div className="screen step-enter screen-result-loading">
        <div className="screen-body result-center">
          <span
            className="spark"
            style={{
              fontSize: 38,
              marginBottom: 6,
            }}
          >
            ✦
          </span>

          <h2 className="rs-loading-title">
            {t("Считаем твою карту")}
          </h2>

          <p className="rs-loading-text">
            {t("Рассчитываем положения планет, домов и аспектов…")}
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // РЕЗУЛЬТАТ
  // =========================
  return (
    <div className="screen step-enter">
      <div className="screen-body">
        <h2 className="rs-title">{t("Твоя карта")}</h2>

        <div className="rs-wheel">
          <ChartWheel chart={chart} />
        </div>

        <div className="rs-summary">
          <span>
            {t("Солнце")} · {t(chart.planets?.Солнце?.sign)}
          </span>

          <span>
            {t("Луна")} · {t(chart.planets?.Луна?.sign)}
          </span>

          <span>
            ASC · {t(chart.angles?.ascendant?.sign)}
          </span>
        </div>
      </div>

      <div className="footer-cta">
        <button className="btn-primary" onClick={onRestart}>
          {t("Рассчитать другую карту")}
        </button>
      </div>
    </div>
  );
}