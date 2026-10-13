import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChartWheel from "./ChartWheel";
import Icon from "./Icon";
import { t } from "../i18n";
import "./ChartViewer.css";

// Натальная карта на весь экран: увеличение пальцами (или кнопками − / +),
// при увеличении карту можно двигать пальцем.
const MIN_SCALE = 1;
const MAX_SCALE = 3;
const STEP = 0.5;
// Внутренний размер колеса (пропорции линий и подписей); на экране колесо
// растягивается под размер контейнера — это SVG, при увеличении оно остаётся чётким
const WHEEL_GEOMETRY = 360;

const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

// Колесо во всю ширину экрана, но так, чтобы целиком помещалось по высоте
function fitSize() {
  const byWidth = Math.min(window.innerWidth, 640) - 16;
  const byHeight = window.innerHeight - 260;
  return Math.max(240, Math.min(byWidth, byHeight));
}

export default function ChartViewer({ chart, onClose }) {
  const [base, setBase] = useState(fitSize);
  const [scale, setScale] = useState(MIN_SCALE);
  const scaleRef = useRef(MIN_SCALE);
  const stageRef = useRef(null);
  const pendingScroll = useRef(null);

  // Меняет масштаб так, чтобы точка под пальцами (или центр) осталась на месте
  const zoomTo = (target, anchor) => {
    const stage = stageRef.current;
    const prev = scaleRef.current;
    const next = clampScale(target);
    if (!stage || next === prev) return;
    const x = anchor ? anchor.x : stage.clientWidth / 2;
    const y = anchor ? anchor.y : stage.clientHeight / 2;
    const ratio = next / prev;
    pendingScroll.current = {
      left: (stage.scrollLeft + x) * ratio - x,
      top: (stage.scrollTop + y) * ratio - y,
    };
    scaleRef.current = next;
    setScale(next);
  };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !pendingScroll.current) return;
    stage.scrollLeft = pendingScroll.current.left;
    stage.scrollTop = pendingScroll.current.top;
    pendingScroll.current = null;
  }, [scale]);

  // Щипок двумя пальцами. Одним пальцем — обычная прокрутка (сдвиг карты)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    let pinch = null;
    const distance = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const middle = (t) => {
      const rect = stage.getBoundingClientRect();
      return {
        x: (t[0].clientX + t[1].clientX) / 2 - rect.left,
        y: (t[0].clientY + t[1].clientY) / 2 - rect.top,
      };
    };
    const onStart = (e) => {
      if (e.touches.length === 2) {
        pinch = { distance: distance(e.touches), scale: scaleRef.current };
      }
    };
    const onMove = (e) => {
      if (e.touches.length !== 2 || !pinch) return;
      e.preventDefault();
      zoomTo((pinch.scale * distance(e.touches)) / pinch.distance, middle(e.touches));
    };
    const onEnd = (e) => {
      if (e.touches.length < 2) pinch = null;
    };
    stage.addEventListener("touchstart", onStart, { passive: true });
    stage.addEventListener("touchmove", onMove, { passive: false });
    stage.addEventListener("touchend", onEnd);
    stage.addEventListener("touchcancel", onEnd);
    return () => {
      stage.removeEventListener("touchstart", onStart);
      stage.removeEventListener("touchmove", onMove);
      stage.removeEventListener("touchend", onEnd);
      stage.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  // Страница под картой не прокручивается; Esc — закрыть; поворот экрана — пересчёт размера
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onResize = () => setBase(fitSize());
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  // Колесо не перерисовывается при каждом движении пальцев — меняется только размер рамки
  const wheel = useMemo(
    () => <ChartWheel chart={chart} size={WHEEL_GEOMETRY} />,
    [chart]
  );
  const side = Math.round(base * scale);

  const bigThree = [
    { label: "ASC", value: chart?.angles?.ascendant?.sign },
    { label: "Солнце", value: chart?.planets?.Солнце?.sign },
    { label: "Луна", value: chart?.planets?.Луна?.sign },
  ].filter((item) => item.value);

  return createPortal(
    <div
      className="cv-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-title"
    >
      <div className="cv-bar">
        <button
          type="button"
          className="cv-round"
          onClick={onClose}
          aria-label={t("Закрыть")}
        >
          <Icon name="close" strokeWidth={2} />
        </button>
        <h2 id="cv-title" className="cv-title">
          {t("Натальная карта")}
        </h2>
        <span className="cv-bar-spacer" aria-hidden="true" />
      </div>

      <div className="cv-stage" ref={stageRef}>
        <div className="cv-wheel" style={{ width: side, height: side }}>
          {wheel}
        </div>
      </div>

      <div className="cv-bottom">
        <div className="cv-zoom">
          <button
            type="button"
            className="cv-round"
            onClick={() => zoomTo(scale - STEP)}
            disabled={scale <= MIN_SCALE}
            aria-label={t("Уменьшить")}
          >
            <Icon name="minus" strokeWidth={2} />
          </button>
          <span className="cv-hint">{t("Раздвинь пальцы, чтобы приблизить")}</span>
          <button
            type="button"
            className="cv-round"
            onClick={() => zoomTo(scale + STEP)}
            disabled={scale >= MAX_SCALE}
            aria-label={t("Увеличить")}
          >
            <Icon name="plus" strokeWidth={2} />
          </button>
        </div>

        {bigThree.length > 0 && (
          <div className="cv-big-three">
            {bigThree.map((item) => (
              <span className="cv-chip" key={item.label}>
                <span className="cv-chip-label">{t(item.label)}</span>
                <span className="cv-chip-value">{t(item.value)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
