import { apiBaseUrl } from './baseUrl'

const CACHE_PREFIX = 'sour-lemon-public-content:v1:'

type CacheEntry<T> = {
  version: 1
  savedAt: number
  expiresAt: number
  data: T
}

interface ApiErrorBody {
  error?: string
}

export class PublicApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'PublicApiError'
    this.status = status
  }
}

export const PUBLIC_CACHE_TTL = {
  standard: 24 * 60 * 60 * 1000,
  journal: 30 * 24 * 60 * 60 * 1000,
} as const

export async function publicJsonRequest<T>(
  path: string,
  signal?: AbortSignal,
  fallbackMessage = 'We could not load this content. Please try again.',
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new PublicApiError(body.error ?? fallbackMessage, response.status)
  }
  return (await response.json()) as T
}

export async function cachedPublicJsonRequest<T>(
  path: string,
  maxAgeMs: number,
  signal?: AbortSignal,
  fallbackMessage?: string,
): Promise<T> {
  try {
    const data = await publicJsonRequest<T>(path, signal, fallbackMessage)
    writePublicCache(path, data, maxAgeMs)
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    const isClientError = error instanceof PublicApiError &&
      error.status >= 400 && error.status < 500 && error.status !== 429
    if (isClientError) {
      removePublicCache(path)
      throw error
    }
    const cached = readPublicCache<T>(path)
    if (cached !== null) return cached
    throw error
  }
}

function storageKey(key: string) {
  return `${CACHE_PREFIX}${key}`
}

function parseEntry<T>(value: string | null): CacheEntry<T> | null {
  if (!value) return null
  try {
    const entry = JSON.parse(value) as Partial<CacheEntry<T>>
    if (entry.version !== 1 || typeof entry.savedAt !== 'number' ||
      typeof entry.expiresAt !== 'number' || !('data' in entry)) return null
    return entry as CacheEntry<T>
  } catch {
    return null
  }
}

export function readPublicCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const entry = parseEntry<T>(window.localStorage.getItem(storageKey(key)))
    if (!entry || entry.expiresAt < Date.now()) {
      window.localStorage.removeItem(storageKey(key))
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function removePublicCache(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

function prunePublicCache() {
  const entries: Array<{ key: string; savedAt: number }> = []
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(CACHE_PREFIX)) continue
    const entry = parseEntry<unknown>(window.localStorage.getItem(key))
    if (!entry || entry.expiresAt < Date.now()) window.localStorage.removeItem(key)
    else entries.push({ key, savedAt: entry.savedAt })
  }
  entries.sort((left, right) => left.savedAt - right.savedAt)
  entries.slice(0, Math.ceil(entries.length / 3)).forEach(({ key }) => window.localStorage.removeItem(key))
}

export function writePublicCache<T>(key: string, data: T, maxAgeMs: number) {
  if (typeof window === 'undefined') return
  const savedAt = Date.now()
  const value = JSON.stringify({ version: 1, savedAt, expiresAt: savedAt + maxAgeMs, data })
  try {
    window.localStorage.setItem(storageKey(key), value)
  } catch {
    try {
      prunePublicCache()
      window.localStorage.setItem(storageKey(key), value)
    } catch {
      // A full or unavailable cache must never prevent the website from rendering.
    }
  }
}
