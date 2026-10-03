import { lazy, Suspense, useEffect, useState } from "react";
import "./global.css";
import Hero from "./pages/Hero";
import WhatYouLearn from "./pages/WhatYouLearn";
import HowItWorks from "./pages/HowItWorks";
import BirthForm from "./pages/BirthForm";
import ResultScreen from "./pages/ResultScreen";
import Home from "./pages/Home";
import BottomNav from "./components/BottomNav";
import ScrollIndicator from "./components/ScrollIndicator";
import { LoadingScreen, classifyFetchError } from "./components/StatusScreen";
import { DEMO_BIRTH_DATA, DEMO_CHART } from "./demo/demoData";
import { DEMO_USER_NAME } from "./demo/config";
import {
  getTelegramUser,
  getInitData,
  loadUnlockedCategories,
  saveUnlockedCategories,
  loadDailySubscription,
  saveDailySubscription,
  isSubscriptionActive,
  openStarsInvoice,
} from "./lib/telegram";
import {
  createStarsInvoice,
  getPurchases,
  getProfile,
  saveProfile,
} from "./lib/api";
import {
  loadCachedProfile,
  saveCachedProfile,
  clearCachedProfile,
} from "./lib/profileStore";
import { t } from "./i18n";

// Экраны, которые видит не каждый пользователь, грузятся лениво (отдельные чанки)
const ChartScreen = lazy(() => import("./pages/ChartScreen"));
const CategoryScreen = lazy(() => import("./pages/CategoryScreen"));
const ProfileScreen = lazy(() => import("./pages/ProfileScreen"));
const ForecastScreen = lazy(() => import("./pages/ForecastScreen"));
const LegalScreen = lazy(() => import("./components/LegalScreen"));

const ONBOARDING_STEPS = 2;

// Сколько ждём профиль с сервера при старте, прежде чем показать онбординг
const PROFILE_LOAD_TIMEOUT_MS = 6000;

export default function App() {
  // Профиль с прошлого визита (локальный кэш) — читается один раз при старте
  const [cachedProfile] = useState(loadCachedProfile);

  // boot | hero | learn | how | form | result | home | chart | daily | profile | category
  // Вернувшийся пользователь попадает сразу на home; boot — ждём профиль с сервера
  const [step, setStep] = useState(() =>
    cachedProfile ? "home" : getInitData() ? "boot" : "hero"
  );
  const [birthData, setBirthData] = useState(cachedProfile?.birthData ?? null);
  const [chart, setChart] = useState(cachedProfile?.chart ?? null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [editingBirthData, setEditingBirthData] = useState(false);
  // Откуда открыли редактирование данных ("home" | "profile") — для кнопки "Назад"
  const [editOrigin, setEditOrigin] = useState("home");

  // Открытый юридический документ: "privacy" | "terms" | null
  const [legalDoc, setLegalDoc] = useState(null);

  // Купленные платные категории
  const [unlockedCategoryIds, setUnlockedCategoryIds] = useState([]);
  const [unlockingCategoryId, setUnlockingCategoryId] = useState(null);
  const [unlockError, setUnlockError] = useState(null);
  // "Обновить статус покупок" в профиле — см. handleRestorePurchases.
  const [isRestoringPurchases, setIsRestoringPurchases] = useState(false);

  // Подписка "Ежедневный прогноз + Таро": { active, expiresAt } | null
  const [dailySubscription, setDailySubscription] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState(null);

  const telegramUser = getTelegramUser();
  // В демо (вне Telegram) — имя демо-профиля
  const userName = telegramUser?.first_name || t(DEMO_USER_NAME);

  // Подтягивает покупки/подписку с сервера (GET /purchases).
  // Возвращает true, если серверные данные получены и применены.
  const syncPurchasesFromServer = async () => {
    const initData = getInitData();
    if (!initData) return false;

    try {
      const { unlocked_categories, subscription } = await getPurchases({
        initData,
      });

      setUnlockedCategoryIds(unlocked_categories);
      saveUnlockedCategories(unlocked_categories);

      // expires_at (unix-секунды) -> { active, expiresAt: ISO-строка }
      const normalizedSubscription = subscription
        ? {
            active: subscription.active,
            expiresAt: new Date(subscription.expires_at * 1000).toISOString(),
          }
        : null;
      setDailySubscription(normalizedSubscription);
      saveDailySubscription(normalizedSubscription);

      return true;
    } catch {
      // Сервер недоступен — остаёмся на локальном кэше
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    loadUnlockedCategories().then((ids) => {
      if (active) setUnlockedCategoryIds(ids);
    });
    loadDailySubscription().then((sub) => {
      if (active) setDailySubscription(sub);
    });
    // Сервер главнее локального кэша
    syncPurchasesFromServer();
    return () => {
      active = false;
    };
  }, []);

  // Сохраняет профиль: сразу в локальный кэш, затем на сервер (PUT /profile)
  const persistProfile = async (nextBirthData, nextChart) => {
    saveCachedProfile({ birthData: nextBirthData, chart: nextChart });

    const initData = getInitData();
    if (!initData) return;
    try {
      const { updated_at } = await saveProfile({
        initData,
        birthData: nextBirthData,
        chart: nextChart,
      });
      saveCachedProfile({
        birthData: nextBirthData,
        chart: nextChart,
        serverUpdatedAt: updated_at,
        synced: true,
      });
    } catch {
      // Сервер недоступен — запись остаётся в кэше, отправим при следующем открытии
    }
  };

  // Синхронизация профиля с сервером при старте
  useEffect(() => {
    const initData = getInitData();
    if (!initData) return undefined;

    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROFILE_LOAD_TIMEOUT_MS);
    const leaveBoot = (next) => setStep((s) => (s === "boot" ? next : s));

    (async () => {
      try {
        // Прошлое сохранение не дошло до сервера — отправляем ещё раз
        if (cachedProfile && !cachedProfile.synced) {
          await persistProfile(cachedProfile.birthData, cachedProfile.chart);
          return;
        }

        const { profile } = await getProfile({
          initData,
          signal: controller.signal,
        });
        if (!active) return;

        const serverIsNewer =
          profile &&
          (!cachedProfile ||
            profile.updated_at > (cachedProfile.serverUpdatedAt ?? 0));

        if (serverIsNewer) {
          setBirthData(profile.birth_data);
          setChart(profile.chart);
          saveCachedProfile({
            birthData: profile.birth_data,
            chart: profile.chart,
            serverUpdatedAt: profile.updated_at,
            synced: true,
          });
          leaveBoot("home");
        } else if (!profile && cachedProfile) {
          // Профиль удалён на сервере (источник правды) — убираем и локальную копию
          clearCachedProfile();
          setBirthData(null);
          setChart(null);
          setStep("hero");
        } else {
          leaveBoot("hero");
        }
      } catch {
        // Сервер не ответил — новому пользователю показываем онбординг
        if (active) leaveBoot("hero");
      } finally {
        clearTimeout(timer);
      }
    })();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  // Превращает ошибку создания счёта в понятный пользователю текст
  const describePaymentError = (err) => {
    if (err?.status && err.status < 500) {
      return err.message || t("Не удалось открыть оплату.");
    }
    if (classifyFetchError() === "offline") {
      return t("Нет подключения к интернету. Проверь связь и попробуй ещё раз.");
    }
    return t("Сервер сейчас недоступен. Мы уже знаем о проблеме — попробуй через минуту.");
  };

  const handleUnlock = async (category) => {
    setUnlockError(null);
    setUnlockingCategoryId(category.id);

    try {
      const { invoice_url } = await createStarsInvoice({
        category: category.id,
        initData: getInitData(),
      });

      const status = await openStarsInvoice(invoice_url);

      if (status === "paid") {
        setUnlockedCategoryIds((prev) => {
          if (prev.includes(category.id)) return prev;
          const next = [...prev, category.id];
          saveUnlockedCategories(next);
          return next;
        });
      } else if (status === "failed") {
        setUnlockError(t("Оплата не прошла. Попробуй ещё раз."));
      }
      // "cancelled" / "pending" — ничего не делаем
    } catch (err) {
      setUnlockError(describePaymentError(err));
    } finally {
      setUnlockingCategoryId(null);
    }
  };

  // Оплата подписки на ежедневный прогноз (категория "daily_subscription")
  const handleSubscribe = async () => {
    setSubscribeError(null);
    setIsSubscribing(true);

    try {
      const { invoice_url } = await createStarsInvoice({
        category: "daily_subscription",
        initData: getInitData(),
      });

      const status = await openStarsInvoice(invoice_url);

      if (status === "paid") {
        const expiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        const next = { active: true, expiresAt };
        setDailySubscription(next);
        saveDailySubscription(next);
      } else if (status === "failed") {
        setSubscribeError(t("Оплата не прошла. Попробуй ещё раз."));
      }
    } catch (err) {
      setSubscribeError(describePaymentError(err));
    } finally {
      setIsSubscribing(false);
    }
  };

  // "Обновить статус покупок" в профиле: сначала сервер, при сбое — локальный кэш
  const handleRestorePurchases = async () => {
    setIsRestoringPurchases(true);
    try {
      const synced = await syncPurchasesFromServer();
      if (!synced) {
        const ids = await loadUnlockedCategories();
        setUnlockedCategoryIds(ids);
      }
    } finally {
      setIsRestoringPurchases(false);
    }
  };

  // Переход на любой экран с десктопной страницы демо
  // (если данных ещё нет — подставляется демо-профиль)
  const jumpToScreen = (targetStep, categoryId) => {
    const needsData = [
      "result",
      "home",
      "chart",
      "profile",
      "category",
      "daily",
    ].includes(targetStep);
    if (needsData) {
      setBirthData((prev) => prev || DEMO_BIRTH_DATA);
      setChart((prev) => prev || DEMO_CHART);
    }
    if (categoryId) {
      setActiveCategoryId(categoryId);
    }
    setStep(targetStep);
  };

  // ДЕМО: быстрые переходы по экранам с десктопной страницы (DemoShell)
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "starwise-demo-jump") return;
      setLegalDoc(null);
      jumpToScreen(event.data.step, event.data.categoryId);
      window.scrollTo(0, 0);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Обработчик нижней навигации
  const handleNavigate = (target) => {
    if (target === "home") {
      setStep("home");
      return;
    }
    if (target === "chart") {
      setStep("chart");
      return;
    }
    if (target === "daily") {
      setStep("daily");
      return;
    }
    if (target === "profile") {
      setStep("profile");
      return;
    }
  };

  // Рендер текущего экрана по step
  function renderScreen() {
    switch (step) {
    case "boot":
      return <LoadingScreen title={t("Загружаем твою карту…")} />;

    case "hero":
      return (
        <Hero onNext={() => setStep("learn")} onOpenLegal={setLegalDoc} />
      );

    case "learn":
      return (
        <WhatYouLearn
          step={0}
          total={ONBOARDING_STEPS}
          onNext={() => setStep("how")}
          onBack={() => setStep("hero")}
        />
      );

    case "how":
      return (
        <HowItWorks
          step={1}
          total={ONBOARDING_STEPS}
          onNext={() => setStep("form")}
          onBack={() => setStep("learn")}
        />
      );

    case "form":
      return (
        <BirthForm
          // ДЕМО: форма заполнена данными демо-профиля и закрыта от правок
          initialData={DEMO_BIRTH_DATA}
          locked
          onOpenLegal={setLegalDoc}
          onSubmit={(data) => {
            setBirthData(data);
            setEditingBirthData(false);
            setStep("result");
          }}
          onBack={() => {
            if (editingBirthData) {
              setEditingBirthData(false);
              setStep(editOrigin);
            } else {
              setStep("how");
            }
          }}
        />
      );

    case "result":
      // Загрузка/ошибка расчёта карты; при успехе — переход на Home
      return (
        <ResultScreen
          birthData={birthData}
          onRestart={() => {
            setBirthData(null);
            setStep("form");
          }}
          onReady={(chartData) => {
            setChart(chartData);
            persistProfile(birthData, chartData);
            setStep(editOrigin === "profile" ? "profile" : "home");
          }}
        />
      );

    case "home":
      return (
        <Home
          chart={chart}
          birthData={birthData}
          userName={userName}
          unlockedCategoryIds={unlockedCategoryIds}
          onOpenCategory={(categoryId) => {
            setActiveCategoryId(categoryId);
            setStep("category");
          }}
          onEditBirthData={() => {
            setEditOrigin("home");
            setEditingBirthData(true);
            setStep("form");
          }}
          onNavigate={handleNavigate}
        />
      );

    case "chart":
      return <ChartScreen chart={chart} birthData={birthData} />;

    case "profile":
      return (
        <ProfileScreen
          birthData={birthData}
          userName={userName}
          unlockedCategoryIds={unlockedCategoryIds}
          onOpenCategory={(categoryId) => {
            setActiveCategoryId(categoryId);
            setStep("category");
          }}
          onEditBirthData={() => {
            setEditOrigin("profile");
            setEditingBirthData(true);
            setStep("form");
          }}
          onRestorePurchases={handleRestorePurchases}
          isRestoringPurchases={isRestoringPurchases}
          onOpenLegal={setLegalDoc}
        />
      );

    case "daily":
      return (
        <ForecastScreen
          chart={chart}
          isSubscribed={isSubscriptionActive(dailySubscription)}
          isSubscribing={isSubscribing}
          subscribeError={subscribeError}
          onSubscribe={handleSubscribe}
        />
      );

    case "category":
      return (
        <CategoryScreen
          chart={chart}
          categoryId={activeCategoryId}
          unlockedCategoryIds={unlockedCategoryIds}
          isUnlocking={unlockingCategoryId === activeCategoryId}
          unlockError={unlockError}
          onBack={() => setStep("home")}
          onUnlock={handleUnlock}
          onOpenCategory={setActiveCategoryId}
        />
      );

    default:
      return null;
    }
  }

  // Шаги, на которых показывается нижняя навигация (рендерится один раз здесь)
  const BOTTOM_NAV_STEPS = ["home", "chart", "daily", "profile"];
  const showBottomNav = BOTTOM_NAV_STEPS.includes(step);

  return (
    <>
      {/* Suspense — LoadingScreen, пока грузится чанк ленивого экрана */}
      <Suspense fallback={<LoadingScreen />}>{renderScreen()}</Suspense>
      {showBottomNav && <BottomNav active={step} onNavigate={handleNavigate} />}
      <ScrollIndicator />
      {/* Политика конфиденциальности / Условия использования — поверх любого экрана */}
      {legalDoc && (
        <Suspense fallback={null}>
          <LegalScreen doc={legalDoc} onClose={() => setLegalDoc(null)} />
        </Suspense>
      )}
    </>
  );
}
