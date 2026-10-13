// Векторные SVG-значки планет и расчётных точек (viewBox 0 0 24 24, currentColor)

const VIEWBOX = "0 0 24 24";

const ICONS = {
  "Солнце": (
    <>
      <circle cx="12" cy="12" r="6.4" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  "Луна": (
    <path
      d="M14.2 4.4c-3.9.9-6.6 4.6-6 8.7.6 4 4.1 6.9 8.1 6.9-2.6 1.4-5.8 1.5-8.6.1-4-2-6-6.7-4.5-11 1.3-3.9 5-6.2 9-5.6.4.1.7.2 1 .3z"
      fill="currentColor"
      stroke="none"
    />
  ),
  "Меркурий": (
    <>
      <path d="M9 4.6a3 3 0 0 1 6 0" />
      <circle cx="12" cy="9.6" r="4" />
      <line x1="12" y1="13.6" x2="12" y2="20" />
      <line x1="8.7" y1="17" x2="15.3" y2="17" />
    </>
  ),
  "Венера": (
    <>
      <circle cx="12" cy="8.2" r="5" />
      <line x1="12" y1="13.2" x2="12" y2="21" />
      <line x1="8.3" y1="17.4" x2="15.7" y2="17.4" />
    </>
  ),
  "Марс": (
    <>
      <circle cx="9.6" cy="14.4" r="5" />
      <line x1="13.3" y1="10.7" x2="19.2" y2="4.8" />
      <path d="M14.4 4.8h4.8v4.8" />
    </>
  ),
  "Юпитер": (
    <>
      <path d="M4.8 6.4h5.6" />
      <path d="M9.4 6.4v13.2" />
      <path d="M9.4 12.6c4 .4 6.8-1.5 6.8-5a3.6 3.6 0 0 0-6.6-2" />
    </>
  ),
  "Сатурн": (
    <>
      <path d="M7.4 4.4h5.4" />
      <path d="M9.6 4.4v10.4c0 3 1.8 4.8 4.4 4.8" />
      <circle cx="14" cy="15.6" r="2.6" />
    </>
  ),
  "Уран": (
    <>
      <line x1="7.2" y1="5.4" x2="7.2" y2="14" />
      <line x1="16.8" y1="5.4" x2="16.8" y2="14" />
      <line x1="7.2" y1="10" x2="16.8" y2="10" />
      <line x1="12" y1="10" x2="12" y2="18.4" />
      <circle cx="12" cy="20.4" r="1.5" />
    </>
  ),
  "Нептун": (
    <>
      <path d="M6.8 5.6v5.2a5.2 5.2 0 0 0 10.4 0V5.6" />
      <line x1="12" y1="4.4" x2="12" y2="18.6" />
      <line x1="8.2" y1="20.2" x2="15.8" y2="20.2" />
    </>
  ),
  "Плутон": (
    <>
      <path d="M8.2 4.4a3.8 3.8 0 0 0 7.6 0" />
      <circle cx="12" cy="10.4" r="3.2" />
      <line x1="12" y1="13.6" x2="12" y2="20.2" />
      <line x1="8.8" y1="17.4" x2="15.2" y2="17.4" />
    </>
  ),
  "Хирон": (
    <>
      <path d="M9 4.6a3 3 0 0 1 6 0l-3 3.4-3-3.4z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.6" r="4.4" />
      <line x1="12" y1="11.2" x2="12" y2="7.6" />
    </>
  ),
  "Раху": (
    <>
      <path d="M5.6 15.4a6.4 6.4 0 0 1 12.8 0" />
      <line x1="5.6" y1="15.4" x2="5.6" y2="18.6" />
      <line x1="18.4" y1="15.4" x2="18.4" y2="18.6" />
    </>
  ),
  "Кету": (
    <>
      <path d="M5.6 8.6a6.4 6.4 0 0 0 12.8 0" />
      <line x1="5.6" y1="8.6" x2="5.6" y2="5.4" />
      <line x1="18.4" y1="8.6" x2="18.4" y2="5.4" />
      <line x1="12" y1="8.6" x2="12" y2="19.4" />
    </>
  ),
  "Лилит": (
    <>
      <circle cx="12" cy="15.2" r="5" />
      <line x1="12" y1="4.4" x2="12" y2="10.2" />
      <line x1="8.8" y1="7.2" x2="15.2" y2="7.2" />
    </>
  ),
  "Селена": (
    <path
      d="M13.6 4.8c-3.3.8-5.6 3.9-5 7.4.5 3.4 3.5 5.9 6.9 5.9-2.2 1.2-4.9 1.3-7.3.1-3.4-1.7-5-5.7-3.8-9.3C5.5 5.6 8.6 3.7 12 4.2c.6.1 1.1.3 1.6.6z"
      fill="none"
    />
  ),
  "Вертекс": (
    <>
      <path d="M5.6 5.4l5 13.2 5.6-13.2" />
      <line x1="18.4" y1="9" x2="18.4" y2="18.6" />
    </>
  ),
  "Парс Фортуны": (
    <>
      <circle cx="12" cy="12" r="7.6" />
      <line x1="12" y1="4.4" x2="12" y2="19.6" />
      <line x1="4.4" y1="12" x2="19.6" y2="12" />
    </>
  ),
};

export default function PointIcon({ name, size = 16, strokeWidth = 1.6, className }) {
  const content = ICONS[name];
  if (!content) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={VIEWBOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}

export function pointIconContent(name) {
  return ICONS[name] || null;
}
