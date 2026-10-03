import { getTelegramUser } from './telegram'

// Локальный кэш профиля (данные рождения + рассчитанная карта) в localStorage,
// отдельно для каждого Telegram-пользователя. Источник правды — сервер (/profile).
// Формат записи: { birthData, chart, serverUpdatedAt, synced }
const KEY_PREFIX = 'starwise_profile_v1:'

function storageKey() {
  return KEY_PREFIX + (getTelegramUser()?.id ?? 'guest')
}

export function loadCachedProfile() {
  try {
    const raw = window.localStorage.getItem(storageKey())
    if (!raw) return null
    const profile = JSON.parse(raw)
    if (!profile?.birthData || !profile?.chart) return null
    return profile
  } catch {
    return null
  }
}

export function clearCachedProfile() {
  try {
    window.localStorage.removeItem(storageKey())
  } catch {
    // Storage unavailable — not fatal
  }
}

// synced: false — запись ещё не подтверждена сервером (повторим отправку при следующем открытии)
export function saveCachedProfile({ birthData, chart, serverUpdatedAt = null, synced = false }) {
  try {
    window.localStorage.setItem(
      storageKey(),
      JSON.stringify({ birthData, chart, serverUpdatedAt, synced })
    )
  } catch {
    // Storage unavailable — not fatal
  }
}