
import { useEffect, useState } from "react";
import { searchCities } from "../lib/api";
import LegalLinks from "../components/LegalLinks";
import "./BirthForm.css";
import Icon from "../components/Icon";
import { t } from "../i18n";

const MIN_YEAR = 1900;

function daysInMonth(month, year) {
  // День 0 следующего месяца = последний день нужного; год без значения — високосный,
  // чтобы 29.02 не отсекалось, пока год ещё не введён
  return new Date(year || 2000, month, 0).getDate();
}

// Проверка даты целиком: пустая строка — всё в порядке
function getDateError(day, month, year) {
  if (!day || !month || year.length !== 4) return "";
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const now = new Date();

  if (d < 1 || m < 1) return t("Проверь день и месяц");
  if (y < MIN_YEAR || y > now.getFullYear()) {
    return t("Год — от {min} до {max}", { min: MIN_YEAR, max: now.getFullYear() });
  }
  if (d > daysInMonth(m, y)) {
    return t("В этом месяце {n} дней — проверь день", { n: daysInMonth(m, y) });
  }
  if (new Date(y, m - 1, d) > now) return t("Дата ещё не наступила");
  return "";
}

// Поле для цифр (день, месяц, год, час, минуты).
// Раньше стоял maxLength: в заполненное поле браузер не пускал новую цифру
// (год 2001 нельзя было поменять), а в неполном цифра дописывалась к старой
// («4» + «15» → «415» → зажималось до 31). Теперь:
// — при нажатии на поле значение выделяется, и набор заменяет его целиком;
// — если цифр стало больше, чем помещается, или число вышло за предел,
//   поле начинается заново с только что набранных цифр.
function DigitField({ value, onChange, maxLength, max, className, placeholder, ariaLabel, readOnly = false }) {
  const selectAll = (e) => {
    const el = e.target;
    // Телефон ставит курсор после фокуса — выделяем на следующем кадре
    setTimeout(() => {
      if (document.activeElement === el) el.setSelectionRange(0, el.value.length);
    }, 0);
  };

  const handleChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    const typed = (e.nativeEvent?.data || "").replace(/\D/g, "");
    const tooLong = digits.length > maxLength;
    const tooBig = max != null && digits.length === maxLength && Number(digits) > max;

    if (tooLong || tooBig) {
      digits = (typed || digits.slice(-maxLength)).slice(0, maxLength);
    }
    if (max != null && digits && Number(digits) > max) {
      digits = String(max);
    }
    onChange(digits);
  };

  return (
    <input
      className={className}
      placeholder={placeholder}
      aria-label={ariaLabel}
      readOnly={readOnly}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={value}
      onFocus={selectAll}
      onChange={handleChange}
    />
  );
}

export default function BirthForm({
  onSubmit,
  onBack,
  initialData = null,
  onOpenLegal,
  // ДЕМО: поля заполнены заранее и недоступны для правки
  locked = false,
}) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState("");
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    setDay(String(initialData.date?.day || ""));
    setMonth(String(initialData.date?.month || ""));
    setYear(String(initialData.date?.year || ""));
    setHour(String(initialData.time?.hour ?? "12"));
    setMinute(String(initialData.time?.minute ?? "00").padStart(2, "0"));
    setUnknownTime(Boolean(initialData.timeIsApproximate) || !initialData.time);
    setGender(initialData.gender || "");
    setCity(initialData.city || "");

    if (initialData.city && initialData.location) {
      setSelectedCity({
        label: initialData.city,
        city: initialData.city,
        latitude: initialData.location.latitude,
        longitude: initialData.location.longitude,
        timezone_name: initialData.timezoneName || null,
      });
    }
  }, [initialData]);

  const dateError = getDateError(day, month, year);

  const isValid =
    Number(day) >= 1 &&
    Number(month) >= 1 &&
    year.length === 4 &&
    !dateError &&
    city.trim().length > 1 &&
    Boolean(selectedCity) &&
    Boolean(gender) &&
    (unknownTime || (hour.length > 0 && minute.length > 0));

  useEffect(() => {
    const query = city.trim();

    // Поиск города — от 3 букв
    if (query.length < 3 || selectedCity) {
      setCitySuggestions([]);
      setIsSearchingCities(false);
      return undefined;
    }

    let cancelled = false;
    // Отмена предыдущего запроса при новом вводе
    const controller = new AbortController();

    // Debounce — ждём паузу в наборе
    const timer = setTimeout(async () => {
      try {
        setIsSearchingCities(true);

        const results = await searchCities(query, { signal: controller.signal });

        if (!cancelled) {
          setCitySuggestions(results);
          setShowSuggestions(true);
        }
      } catch (error) {
        // AbortError — нормальная отмена запроса, не ошибка
        if (!cancelled && error.name !== "AbortError") {
          setCitySuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingCities(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [city, selectedCity]);

  const handleCityChange = (event) => {
    setCity(event.target.value);
    setSelectedCity(null);
    setShowSuggestions(true);
  };

  const handleCitySelect = (suggestion) => {
    setCity(suggestion.label);
    setSelectedCity(suggestion);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  // «04» → «4», как и раньше уходило на сервер
  const asNumber = (value, fallback) => (value ? String(Number(value)) : fallback);

  const buildBirthData = () => ({
    date: {
      day: asNumber(day),
      month: asNumber(month),
      year,
    },
    time: {
      hour: asNumber(hour, "12"),
      minute: asNumber(minute, "00"),
    },
    timeIsApproximate: unknownTime,
    city: city.trim(),
    gender,
    location: {
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
    },
    timezoneName: selectedCity.timezone_name || null,
  });

  const handleSubmit = () => {
    if (!isValid) return;
    setShowPrivacyModal(true);
  };

  const handlePrivacyConfirm = () => {
    setShowPrivacyModal(false);
    onSubmit(buildBirthData());
  };

  return (
    <div className={`screen screen-form step-enter${locked ? " bf-locked" : ""}`}>
      <div className="screen-body">
        <div className="bf-intro">
          <span className="spark bf-spark"><Icon name="spark" /></span>

          <h2 className="bf-title">
            {t("Данные рождения")}
          </h2>

          {locked && (
            <p className="bf-demo-note">
              {t("Демо: данные вымышленного профиля уже заполнены. В боте здесь вводятся свои дата, время и город.")}
            </p>
          )}
        </div>

        <div className="bf-card">
          {/* =================================================
              ДАТА РОЖДЕНИЯ
          ================================================= */}

          <div className="bf-field-group">
            <label className="bf-label">
              {t("Дата рождения")}
            </label>

            <div className="bf-row">
              <DigitField
                className="bf-input bf-input-sm"
                placeholder={t("ДД")}
                ariaLabel={t("День")}
                readOnly={locked}
                maxLength={2}
                max={31}
                value={day}
                onChange={setDay}
              />

              <DigitField
                className="bf-input bf-input-sm"
                placeholder={t("ММ")}
                ariaLabel={t("Месяц")}
                readOnly={locked}
                maxLength={2}
                max={12}
                value={month}
                onChange={setMonth}
              />

              <DigitField
                className="bf-input bf-input-md"
                placeholder={t("ГГГГ")}
                ariaLabel={t("Год")}
                readOnly={locked}
                maxLength={4}
                value={year}
                onChange={setYear}
              />
            </div>

            {dateError && (
              <span className="bf-city-hint bf-date-error" role="alert">
                {dateError}
              </span>
            )}
          </div>

          <div className="bf-divider" />

          {/* =================================================
              ВРЕМЯ + ПОЛ
          ================================================= */}

          <div className="bf-time-gender-row">
            <div className="bf-field-group bf-time-group">
              <label className="bf-label">
                {t("Время рождения")}
              </label>

              <div className="bf-row">
                <DigitField
                  className="bf-input bf-input-sm"
                  placeholder={t("ЧЧ")}
                  ariaLabel={t("Час")}
                  readOnly={locked}
                  maxLength={2}
                  max={23}
                  value={hour}
                  onChange={setHour}
                />

                <span className="bf-colon">
                  :
                </span>

                <DigitField
                  className="bf-input bf-input-sm"
                  placeholder={t("ММ")}
                  ariaLabel={t("Минуты")}
                  readOnly={locked}
                  maxLength={2}
                  max={59}
                  value={minute}
                  onChange={setMinute}
                />
              </div>

              <label className="bf-checkbox">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  disabled={locked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUnknownTime(checked);

                    if (checked) {
                      setHour((current) => current || "12");
                      setMinute((current) => current || "00");
                      setShowTimeWarning(true);
                    }
                  }}
                />

                <span>
                  {t("Не знаю точное время")}
                </span>
              </label>
            </div>

            <div className="bf-field-group bf-gender-group">
              <label className="bf-label">
                {t("Пол")}
              </label>

              <div
                className="bf-gender"
                role="group"
                aria-label={t("Пол")}
              >
                <button
                  type="button"
                  className={`bf-gender-option ${
                    gender === "female" ? "active" : ""
                  }`}
                  onClick={() =>
                    !locked && setGender("female")
                  }
                  aria-pressed={
                    gender === "female"
                  }
                >
                  {t("Ж")}
                </button>

                <button
                  type="button"
                  className={`bf-gender-option ${
                    gender === "male" ? "active" : ""
                  }`}
                  onClick={() =>
                    !locked && setGender("male")
                  }
                  aria-pressed={
                    gender === "male"
                  }
                >
                  {t("М")}
                </button>
              </div>
            </div>
          </div>

          <div className="bf-divider" />

          {/* =================================================
              ГОРОД
          ================================================= */}

          <div className="bf-field-group">
            <label className="bf-label">
              {t("Город рождения")}
            </label>

            <div className="bf-city-wrap">
              <input
                className="bf-input bf-input-full"
                readOnly={locked}
                placeholder={t("Например, Алматы")}
                // ДЕМО: название города показывается на языке интерфейса
                value={locked ? t(city) : city}
                autoComplete="off"
                onChange={handleCityChange}
                onFocus={() => {
                  if (
                    city.trim().length >= 2 &&
                    !selectedCity
                  ) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(
                    () => setShowSuggestions(false),
                    150
                  );
                }}
              />

              {showSuggestions &&
                (isSearchingCities ||
                  citySuggestions.length > 0) && (
                  <div className="bf-city-suggestions">
                    {isSearchingCities && (
                      <div className="bf-city-status">
                        {t("Ищем города…")}
                      </div>
                    )}

                    {!isSearchingCities &&
                      citySuggestions.map(
                        (suggestion) => (
                          <button
                            key={`${suggestion.label}-${suggestion.latitude}-${suggestion.longitude}`}
                            type="button"
                            className="bf-city-option"
                            onMouseDown={(e) =>
                              e.preventDefault()
                            }
                            onClick={() =>
                              handleCitySelect(
                                suggestion
                              )
                            }
                          >
                            <span className="bf-city-name">
                              {suggestion.city}
                            </span>

                            <span className="bf-city-meta">
                              {[
                                suggestion.region,
                                suggestion.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </button>
                        )
                      )}
                  </div>
                )}
            </div>

            {city.trim().length > 1 &&
              !selectedCity &&
              !isSearchingCities &&
              citySuggestions.length === 0 && (
                <span className="bf-city-hint">
                  {t("Выбери город из списка")}
                </span>
              )}
          </div>
        </div>

        {showTimeWarning && (
          <div
            className="bf-time-warning-backdrop"
            role="presentation"
            onMouseDown={() => setShowTimeWarning(false)}
          >
            <div
              className="bf-time-warning"
              role="dialog"
              aria-modal="true"
              aria-labelledby="bf-time-warning-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3 id="bf-time-warning-title">
                {t("Время влияет на точность карты")}
              </h3>

              <p>
                {t("Мы поставили 12:00. Без точного времени дома и Асцендент могут немного сместиться. Если помнишь хотя бы примерный час — лучше укажи его.")}
              </p>

              <button
                type="button"
                className="btn-primary bf-time-warning-button"
                onClick={() => setShowTimeWarning(false)}
              >
                {t("Понятно")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
      ================================================= */}
      {showPrivacyModal && (
        <div
          className="bf-privacy-backdrop"
          role="presentation"
          onMouseDown={() => setShowPrivacyModal(false)}
        >
          <div
            className="bf-privacy-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bf-privacy-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="bf-privacy-kicker">{t("ПЕРЕД РАСЧЁТОМ")}</span>

            <h3 id="bf-privacy-title">{t("Политика конфиденциальности")}</h3>

            <div className="bf-privacy-body">
              <p>
                {t("Для расчёта карты нам нужны дата, время и место рождения, а также базовые данные Telegram-профиля — чтобы привязать покупки к твоему аккаунту.")}
              </p>

              <p>
                {t("Оплата проходит через Telegram Stars: данные карты мы не получаем. Твои данные не продаём и не публикуем.")}
              </p>

              <div className="bf-privacy-links">
                <span>{t("Полные тексты:")}</span>
                <LegalLinks onOpen={onOpenLegal} />
              </div>
            </div>

            <div className="bf-privacy-actions">
              <button
                type="button"
                className="bf-privacy-cancel"
                onClick={() => setShowPrivacyModal(false)}
              >
                {t("Вернуться")}
              </button>

              <button
                type="button"
                className="btn-primary bf-privacy-confirm"
                onClick={handlePrivacyConfirm}
              >
                {t("Продолжить")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="footer-cta">
        <button
          className="btn-primary"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          {t("Построить карту")}
        </button>

        <button
          className="btn-ghost"
          onClick={onBack}
        >
          {t("Назад")}
        </button>
      </div>
    </div>
  );
}