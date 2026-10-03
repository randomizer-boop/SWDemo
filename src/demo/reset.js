// Сброс демо: удаляет сохранённый профиль и покупки из localStorage,
// чтобы путь пользователя начался с первого экрана.
const KEYS = ["unlocked_categories", "daily_subscription"];
const PROFILE_PREFIX = "starwise_profile_v1:";

export function resetDemo() {
  try {
    const storage = window.localStorage;
    KEYS.forEach((key) => storage.removeItem(key));
    Object.keys(storage)
      .filter((key) => key.startsWith(PROFILE_PREFIX))
      .forEach((key) => storage.removeItem(key));
  } catch {
    // Хранилище недоступно — сбрасывать нечего
  }
}
