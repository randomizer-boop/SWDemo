// Векторные значки знаков зодиака (viewBox 0 0 24 24, currentColor).
// SVG вместо юникод-символов: на части телефонов они превращаются в цветные эмодзи.

const VIEWBOX = "0 0 24 24";

const ICONS = {
  Aries: (
    <>
      <path d="M12 20V9.6" />
      <path d="M12 9.6C12 6.2 10.3 4 8.1 4 6.2 4 4.7 5.5 4.7 7.5c0 1.5.8 2.7 2 3.2" />
      <path d="M12 9.6C12 6.2 13.7 4 15.9 4c1.9 0 3.4 1.5 3.4 3.5 0 1.5-.8 2.7-2 3.2" />
    </>
  ),
  Taurus: (
    <>
      <circle cx="12" cy="14.8" r="5.2" />
      <path d="M5 3.8c1.1 3.7 3.5 5.8 7 5.8s5.9-2.1 7-5.8" />
    </>
  ),
  Gemini: (
    <>
      <path d="M5.5 4.4c4 1.7 9 1.7 13 0" />
      <path d="M5.5 19.6c4-1.7 9-1.7 13 0" />
      <line x1="9" y1="5.5" x2="9" y2="18.5" />
      <line x1="15" y1="5.5" x2="15" y2="18.5" />
    </>
  ),
  Cancer: (
    <>
      <circle cx="7.6" cy="9.6" r="2.6" />
      <circle cx="16.4" cy="14.4" r="2.6" />
      <path d="M5 8.4C7.6 5 14.6 4.4 19.4 7.2" />
      <path d="M19 15.6C16.4 19 9.4 19.6 4.6 16.8" />
    </>
  ),
  Leo: (
    <>
      <circle cx="7.6" cy="14.4" r="2.7" />
      <path d="M10.3 14.4c0-3-2.9-4.5-2.9-7.4a4.4 4.4 0 0 1 8.8 0c0 3.4-2.6 6-2.6 9.2a2.8 2.8 0 0 0 5.2 1.4" />
    </>
  ),
  Virgo: (
    <>
      <path d="M4.2 5.6V18" />
      <path d="M4.2 8.2c0-2.4 3.6-2.4 3.6 0V18" />
      <path d="M7.8 8.2c0-2.4 3.6-2.4 3.6 0V18" />
      <path d="M11.4 8.2c0-2.4 3.6-2.4 3.6 0v6.6c0 2.8 1.4 4.6 3.8 5.2" />
      <path d="M15 12.4c1.8-2 4.6-1.4 4.6 1 0 2.6-2.6 4.8-5.8 6.4" />
    </>
  ),
  Libra: (
    <>
      <line x1="4" y1="19.6" x2="20" y2="19.6" />
      <path d="M4 15.6h5.2a4.7 4.7 0 1 1 5.6 0H20" />
    </>
  ),
  Scorpio: (
    <>
      <path d="M4 5.6V18" />
      <path d="M4 8.2c0-2.4 3.6-2.4 3.6 0V18" />
      <path d="M7.6 8.2c0-2.4 3.6-2.4 3.6 0V18" />
      <path d="M11.2 8.2c0-2.4 3.6-2.4 3.6 0v7.6c0 1.6 1 2.6 2.6 2.6h2.6" />
      <path d="M18 15.6l2.4 2.8-2.4 2.8" />
    </>
  ),
  Sagittarius: (
    <>
      <line x1="5" y1="19" x2="19" y2="5" />
      <path d="M11.4 5H19v7.6" />
      <line x1="7.4" y1="11.4" x2="12.6" y2="16.6" />
    </>
  ),
  Capricorn: (
    <>
      <path d="M4.4 5.6c1.8 0 3 1.4 3 3.6V17" />
      <path d="M7.4 9.2c0-2.2 1.2-3.6 3-3.6s3 1.4 3 3.6v7c0 2-1.2 3.4-3 3.8" />
      <circle cx="16.4" cy="15.8" r="3" />
    </>
  ),
  Aquarius: (
    <>
      <path d="M3.8 9.8l2.7-2.6 2.7 2.6 2.8-2.6 2.7 2.6 2.8-2.6 2.7 2.6" />
      <path d="M3.8 16.8l2.7-2.6 2.7 2.6 2.8-2.6 2.7 2.6 2.8-2.6 2.7 2.6" />
    </>
  ),
  Pisces: (
    <>
      <path d="M6 4c3.2 3 3.2 13 0 16" />
      <path d="M18 4c-3.2 3-3.2 13 0 16" />
      <line x1="5.4" y1="12" x2="18.6" y2="12" />
    </>
  ),
};

// Порядок знаков по кругу, от Овна
export const ZODIAC_KEYS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Содержимое значка (для вставки внутрь другого SVG, например колеса карты)
export function zodiacIconContent(sign) {
  return ICONS[sign] || null;
}

// sign — английский ключ знака (Aries … Pisces)
export default function ZodiacIcon({ sign, size = 20, strokeWidth = 1.7, className }) {
  const content = ICONS[sign];
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
