import { accessTokenForRequest } from '@/auth/sessionManager'
import { apiBaseUrl } from './baseUrl'
import type { PaymentProofSummary } from './orderTypes'

async function sendProof(path: string, reference: string, file: File | null, guestAccessToken?: string | null) {
  const data = new FormData()
  if (reference.trim()) data.append('reference', reference.trim())
  if (file) data.append('file', file)
  const token = await accessTokenForRequest()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST', credentials: 'include',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(guestAccessToken ? { 'X-Order-Access-Token': guestAccessToken } : {}) },
    body: data,
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? 'Could not submit payment proof')
  }
  return response.json() as Promise<{ proof: PaymentProofSummary }>
}

export const submitOrderPaymentProof = (orderId: string, reference: string, file: File | null, guestAccessToken?: string | null) =>
  sendProof(`/api/orders/${encodeURIComponent(orderId)}/payment-proofs`, reference, file, guestAccessToken)

export const getCakePayment = async (id: string, token: string) => {
  const response = await fetch(`${apiBaseUrl}/api/custom-cake-requests/${encodeURIComponent(id)}/payment/${encodeURIComponent(token)}`)
  if (!response.ok) throw new Error('This payment link is unavailable')
  return response.json() as Promise<{
    cake: { id: string; occasion: string; quotedAmount: string | null; currency: string; status: string; quoteExpiresAt: string | null }
    payable: boolean
    momo: { number: string; recipientName: string; network: string } | null
    proofs: PaymentProofSummary[]
  }>
}

export const submitCakePaymentProof = (id: string, token: string, reference: string, file: File | null) =>
  sendProof(`/api/custom-cake-requests/${encodeURIComponent(id)}/payment/${encodeURIComponent(token)}/proofs`, reference, file)
