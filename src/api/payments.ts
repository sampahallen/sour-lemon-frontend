import { apiRequest } from './http'
import type { OrderReceipt } from './orderTypes'

export function verifyPayment(
  paymentId: string,
  access: { token?: string | null; guestAccessToken?: string | null } = {},
) {
  return apiRequest<{ order: OrderReceipt }>(
    `/api/payments/${encodeURIComponent(paymentId)}/verify`,
    { method: 'POST', token: access.token, guestOrderAccessToken: access.guestAccessToken },
    'We could not verify your payment. Please try again.',
  )
}
