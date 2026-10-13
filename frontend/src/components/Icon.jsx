// Значки интерфейса — свои SVG вместо эмодзи и символов-пиктограмм: эмодзи
// на каждом устройстве рисуются по-своему, а SVG везде одинаковый.
// Размер по умолчанию — 1em: значок подстраивается под font-size родителя,
// цвет — под color (кроме звезды Telegram Stars, она всегда золотая).

const VIEWBOX = "0 0 24 24";
const STAR_GOLD = "#f2b134";

// Четырёхконечная звезда — «искра» StarWise (бывший символ ✦)
const SPARK_PATH =
  "M12 2c.9 5.6 4.4 9.1 10 10-5.6.9-9.1 4.4-10 10-.9-5.6-4.4-9.1-10-10 5.6-.9 9.1-4.4 10-10z";

const ICONS = {
  spark: <path d={SPARK_PATH} fill="currentColor" stroke="none" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.4" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
    </>
  ),
  // Telegram Stars
  star: (
    <path
      d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z"
      fill={STAR_GOLD}
      stroke={STAR_GOLD}
      strokeWidth="1.8"
    />
  ),
  // Нет сети
  offline: (
    <>
      <path d="M3.6 9.6a12.4 12.4 0 0 1 16.8 0" />
      <path d="M6.8 13.1a7.8 7.8 0 0 1 10.4 0" />
      <circle cx="12" cy="17.2" r="1.2" fill="currentColor" stroke="none" />
      <line x1="4.5" y1="3.5" x2="19.5" y2="20.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.2l8.8 15.2H3.2z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="10.6" cy="10.6" r="6.1" />
      <line x1="15.2" y1="15.2" x2="20" y2="20" />
    </>
  ),
  // Карта Таро
  tarot: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.4" />
      <path
        d="M12 8.2c.35 2.1 1.7 3.45 3.8 3.8-2.1.35-3.45 1.7-3.8 3.8-.35-2.1-1.7-3.45-3.8-3.8 2.1-.35 3.45-1.7 3.8-3.8z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  pencil: <path d="M4.5 19.5l.9-4L16.6 4.3a2.2 2.2 0 0 1 3.1 3.1L8.5 18.6z" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  arrowUpRight: (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <path d="M9.4 7H17v7.6" />
    </>
  ),
  // Открыть на весь экран
  expand: (
    <>
      <path d="M9 4H4v5" />
      <path d="M15 4h5v5" />
      <path d="M9 20H4v-5" />
      <path d="M15 20h5v-5" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  // Только для dev-переключателя экранов
  tools: (
    <>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="9" cy="7" r="2" fill="#ffffff" />
      <circle cx="15" cy="12" r="2" fill="#ffffff" />
      <circle cx="8" cy="17" r="2" fill="#ffffff" />
    </>
  ),
};

export default function Icon({ name, size = "1em", strokeWidth = 1.8, className }) {
  const content = ICONS[name];
  if (!content) return null;
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
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
