import { Identity } from "@semaphore-protocol/core"

const STORAGE_KEY = "zk-voting-identity"

/**
 * Створити нову ZK-ідентичність
 * Секретний ключ зберігається ТІЛЬКИ в localStorage браузера
 */
export function createIdentity() {
  const identity = new Identity()

  // Зберігаємо приватний ключ локально
  localStorage.setItem(STORAGE_KEY, identity.export())

  return {
    identity,
    commitment: identity.commitment.toString()
  }
}

/**
 * Завантажити існуючу ідентичність з localStorage
 */
export function loadIdentity() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const identity = Identity.import(saved)
    return {
      identity,
      commitment: identity.commitment.toString()
    }
  } catch (e) {
    console.error("Failed to load identity:", e)
    return null
  }
}

/**
 * Перевірити чи існує ідентичність
 */
export function hasIdentity() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

/**
 * Видалити ідентичність (для тестування)
 */
export function clearIdentity() {
  localStorage.removeItem(STORAGE_KEY)
}
