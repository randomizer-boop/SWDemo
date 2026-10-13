import { useEffect, useRef, useState } from "react";
import "./ScrollIndicator.css";

// Свой тонкий индикатор скролла у правого края экрана.
// Слушает скролл окна — один компонент на всё приложение.
const HIDE_DELAY_MS = 900;
const MIN_THUMB_HEIGHT = 28; // px

export default function ScrollIndicator() {
  const [metrics, setMetrics] = useState(null); // { top, height } px | null = скроллить нечего
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    const recompute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = doc.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = scrollHeight - viewportHeight;

      if (scrollable <= 4) {
        // Контент помещается на экран — индикатор не нужен
        setMetrics(null);
        return;
      }

      const thumbHeight = Math.max(
        MIN_THUMB_HEIGHT,
        (viewportHeight / scrollHeight) * viewportHeight
      );
      const maxThumbTop = viewportHeight - thumbHeight;
      const thumbTop = (scrollTop / scrollable) * maxThumbTop;

      setMetrics({ top: thumbTop, height: thumbHeight });
    };

    const handleScroll = () => {
      recompute();
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    };

    recompute();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", recompute);

    // Пересчёт при изменении высоты страницы без скролла
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(recompute) : null;
    resizeObserver?.observe(document.body);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", recompute);
      resizeObserver?.disconnect();
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!metrics) return null;

  return (
    <div
      className={`scroll-indicator${visible ? " is-visible" : ""}`}
      style={{ top: metrics.top, height: metrics.height }}
      aria-hidden="true"
    />
  );
}
