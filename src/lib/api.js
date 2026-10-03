// ДЕМО-ВЕРСИЯ: бэкенда нет, сетевых запросов нет.
// Экспорты и форматы ответов те же, что у боевого api.js (FastAPI-бэкенд):
//   POST /calculate, GET /cities/search, POST /create-invoice,
//   GET /purchases, GET|PUT /profile
// — поэтому экраны приложения работают без изменений.

import { DEMO_CHART, DEMO_CITY } from '../demo/demoData'
import { DEMO_CALC_DELAY_MS } from '../demo/config'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// В проде: POST /calculate -> body.data. Здесь — готовая карта демо-профиля.
export async function calculateNatalChart() {
  await wait(DEMO_CALC_DELAY_MS)
  return DEMO_CHART
}

// В проде: GET /cities/search (GeoNames). Здесь — один город демо-профиля.
export async function searchCities(query) {
  if (!query || query.length < 2) return []
  await wait(300)
  return [DEMO_CITY]
}

// В проде: POST /create-invoice -> ссылка на счёт Telegram Stars.
// В демо оплата отключена.
export async function createStarsInvoice() {
  const err = new Error('В демо-версии оплата отключена.')
  err.status = 400
  throw err
}

// В проде: GET /purchases. В демо покупок нет — платные разборы закрыты.
export async function getPurchases() {
  return { unlocked_categories: [], subscription: null }
}

// В проде: GET /profile. В демо профиль живёт только в localStorage.
export async function getProfile() {
  return { profile: null }
}

// В проде: PUT /profile.
export async function saveProfile() {
  return { updated_at: Math.floor(Date.now() / 1000) }
}
