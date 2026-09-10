export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

interface ApiErrorBody {
  error?: string
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
  guestOrderAccessToken?: string | null
  signal?: AbortSignal
}

/**
 * Shared fetch wrapper for the cart/checkout/order/payment API surface: always sends
 * credentials (so the guest cart's httpOnly cookie round-trips) and layers an optional
 * Bearer token and/or X-Order-Access-Token header on top for authenticated or guest-order access.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  fallbackErrorMessage = 'Something went wrong. Please try again.',
): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.token) headers.Authorization = `Bearer ${options.token}`
  if (options.guestOrderAccessToken) headers['X-Order-Access-Token'] = options.guestOrderAccessToken

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? fallbackErrorMessage)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
