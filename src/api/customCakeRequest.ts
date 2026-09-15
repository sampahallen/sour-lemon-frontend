import { accessTokenForRequest, hasRecentUserInteraction, isAuthenticationFailure, refreshSession } from '@/auth/sessionManager'

const apiBaseUrl = (import.meta.env.API_URL).replace(/\/$/, '')

export interface CustomCakeRequestImage {
  id: string
  url: string
  storageKey: string
  createdAt: string
}

export interface CustomCakeRequestDetail {
  id: string
  customerName: string
  phoneNumber: string
  whatsappNumber: string | null
  occasion: string
  requestedSize: string
  notes: string | null
  status: string
  quotedAmount: string | null
  currency: string
  quotedAt: string | null
  quoteExpiresAt: string | null
  createdAt: string
  images: CustomCakeRequestImage[]
  orderId: string | null
}

export interface CustomCakeRequestInput {
  customerName: string
  phoneNumber: string
  whatsappNumber?: string
  occasion: string
  requestedSize: string
  notes?: string
}

interface ApiErrorBody {
  error?: string
}

export async function submitCustomCakeRequest(
  input: CustomCakeRequestInput,
  _token?: string,
): Promise<{ request: CustomCakeRequestDetail }> {
  void _token
  const accessToken = await accessTokenForRequest()
  const send = (currentToken: string | null) => fetch(`${apiBaseUrl}/api/custom-cake-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    },
    body: JSON.stringify(input),
  })
  let response = await send(accessToken)
  if (accessToken && hasRecentUserInteraction() && await isAuthenticationFailure(response)) response = await send((await refreshSession(true)).token)

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not submit your request. Please try again.')
  }

  return (await response.json()) as { request: CustomCakeRequestDetail }
}

export async function uploadCustomCakeRequestImage(
  requestId: string,
  file: File,
  _token?: string,
): Promise<{ image: CustomCakeRequestImage }> {
  void _token
  const formData = new FormData()
  formData.append('file', file)

  const accessToken = await accessTokenForRequest()
  const send = (currentToken: string | null) => fetch(`${apiBaseUrl}/api/custom-cake-requests/${requestId}/images`, {
    method: 'POST',
    headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined,
    body: formData,
  })
  let response = await send(accessToken)
  if (accessToken && hasRecentUserInteraction() && await isAuthenticationFailure(response)) response = await send((await refreshSession(true)).token)

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not upload your photo. Please try again.')
  }

  return (await response.json()) as { image: CustomCakeRequestImage }
}
