// Thin wrapper around window.Telegram.WebApp (safe to use outside Telegram too)

function tg() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : null
}

export function initTelegram() {
  const app = tg()
  if (!app) return
  app.ready()
  app.expand()

  // Match Telegram's header/background to the app palette
  app.setHeaderColor('#f4f8fa')
  app.setBackgroundColor('#f4f8fa')
}

export function getTelegramUser() {
  return tg()?.initDataUnsafe?.user ?? null
}

// Raw initData — sent to the backend, which verifies its signature
export function getInitData() {
  return tg()?.initData ?? ''
}

export function showMainButton(text, onClick) {
  const app = tg()
  if (!app) return () => {}
  app.MainButton.setText(text)
  app.MainButton.show()
  app.MainButton.onClick(onClick)
  return () => {
    app.MainButton.offClick(onClick)
    app.MainButton.hide()
  }
}

export function hapticSuccess() {
  tg()?.HapticFeedback?.notificationOccurred('success')
}

export function hapticSelection() {
  tg()?.HapticFeedback?.selectionChanged()
}

// Opens a t.me link inside Telegram (new tab when outside Telegram)
export function openTelegramLink(url) {
  const app = tg()
  if (app?.openTelegramLink) {
    app.openTelegramLink(url)
    return
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

// Opens a Telegram Stars invoice created by the backend
export function openStarsInvoice(invoiceUrl) {
  return new Promise((resolve) => {
    const app = tg()
    if (!app) {
      window.open(invoiceUrl, '_blank')
      resolve('unknown')
      return
    }
    app.openInvoice(invoiceUrl, (status) => resolve(status)) // 'paid' | 'cancelled' | 'failed'
  })
}

// Unlocked paid categories — client-side cache (CloudStorage, localStorage
// fallback). The server (GET /purchases) is the source of truth.
const UNLOCKED_STORAGE_KEY = 'unlocked_categories'

export function loadUnlockedCategories() {
  return new Promise((resolve) => {
    const app = tg()
    if (app?.CloudStorage) {
      app.CloudStorage.getItem(UNLOCKED_STORAGE_KEY, (err, value) => {
        if (err || !value) {
          resolve([])
          return
        }
        try {
          resolve(JSON.parse(value))
        } catch {
          resolve([])
        }
      })
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(UNLOCKED_STORAGE_KEY)
        resolve(raw ? JSON.parse(raw) : [])
      } catch {
        resolve([])
      }
      return
    }

    resolve([])
  })
}

export function saveUnlockedCategories(categoryIds) {
  const payload = JSON.stringify(categoryIds)
  const app = tg()

  if (app?.CloudStorage) {
    app.CloudStorage.setItem(UNLOCKED_STORAGE_KEY, payload)
    return
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(UNLOCKED_STORAGE_KEY, payload)
    } catch {
      // Storage unavailable — not fatal
    }
  }
}

// Подписка "Ежедневный прогноз + Таро" — клиентский кэш с датой истечения
const DAILY_SUBSCRIPTION_STORAGE_KEY = 'daily_subscription'

export function loadDailySubscription() {
  return new Promise((resolve) => {
    const app = tg()
    if (app?.CloudStorage) {
      app.CloudStorage.getItem(DAILY_SUBSCRIPTION_STORAGE_KEY, (err, value) => {
        if (err || !value) {
          resolve(null)
          return
        }
        try {
          resolve(JSON.parse(value))
        } catch {
          resolve(null)
        }
      })
      return
    }

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(DAILY_SUBSCRIPTION_STORAGE_KEY)
        resolve(raw ? JSON.parse(raw) : null)
      } catch {
        resolve(null)
      }
      return
    }

    resolve(null)
  })
}

export function saveDailySubscription(subscription) {
  const payload = JSON.stringify(subscription)
  const app = tg()

  if (app?.CloudStorage) {
    app.CloudStorage.setItem(DAILY_SUBSCRIPTION_STORAGE_KEY, payload)
    return
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(DAILY_SUBSCRIPTION_STORAGE_KEY, payload)
    } catch {
      // Storage unavailable — not fatal
    }
  }
}

// Активна ли подписка; subscription — { active, expiresAt } | null
export function isSubscriptionActive(subscription) {
  if (!subscription?.active || !subscription?.expiresAt) return false
  return new Date(subscription.expiresAt).getTime() > Date.now()
}