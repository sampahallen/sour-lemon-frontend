import { accessTokenForRequest, hasRecentUserInteraction, isAuthenticationFailure, refreshSession } from '@/auth/sessionManager'
import { apiBaseUrl } from './baseUrl'

export { apiBaseUrl } from './baseUrl'

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
  const accessToken = await accessTokenForRequest()
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  if (options.guestOrderAccessToken) headers['X-Order-Access-Token'] = options.guestOrderAccessToken

  const send = (requestHeaders: Record<string, string>) => fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: requestHeaders,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })
  let response = await send(headers)
  if (accessToken && hasRecentUserInteraction() && await isAuthenticationFailure(response)) {
    const refreshed = await refreshSession(true)
    response = await send({ ...headers, Authorization: `Bearer ${refreshed.token}` })
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? fallbackErrorMessage)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
