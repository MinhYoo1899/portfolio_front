// localStorage serialization helpers. Versioned key prefix isolates app data.
// Only this module and repository/auth implementations access localStorage directly.

const PREFIX = 'board-app:'

export function storageKey(key: string): string {
  return key.startsWith(PREFIX) ? key : PREFIX + key
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    // Quota exceeded or serialization failure: fail silently (MVP scope).
  }
}
