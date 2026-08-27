const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

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
  token?: string,
): Promise<{ request: CustomCakeRequestDetail }> {
  const response = await fetch(`${apiBaseUrl}/api/custom-cake-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not submit your request. Please try again.')
  }

  return (await response.json()) as { request: CustomCakeRequestDetail }
}

export async function uploadCustomCakeRequestImage(
  requestId: string,
  file: File,
  token?: string,
): Promise<{ image: CustomCakeRequestImage }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${apiBaseUrl}/api/custom-cake-requests/${requestId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not upload your photo. Please try again.')
  }

  return (await response.json()) as { image: CustomCakeRequestImage }
}
