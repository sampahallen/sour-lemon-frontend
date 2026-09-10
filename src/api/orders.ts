import { apiRequest } from './http'
import type { CustomerOrderSummary, OrderReceipt, Pagination } from './orderTypes'

interface OrderAccess {
  token?: string | null
  guestAccessToken?: string | null
}

export function getCustomerOrders(token: string, page = 1, signal?: AbortSignal) {
  const query = new URLSearchParams({ page: String(page), limit: '12' })
  return apiRequest<{ orders: CustomerOrderSummary[]; pagination: Pagination }>(
    `/api/orders/mine?${query.toString()}`,
    { token, signal },
    'We could not load your orders.',
  )
}

export function getOrderReceipt(orderId: string, access: OrderAccess = {}, signal?: AbortSignal) {
  return apiRequest<{ order: OrderReceipt }>(
    `/api/orders/${encodeURIComponent(orderId)}/receipt`,
    { token: access.token, guestOrderAccessToken: access.guestAccessToken, signal },
    'We could not find this order.',
  )
}

export function resumeOrRetryOrderPayment(orderId: string, access: OrderAccess = {}) {
  return apiRequest<{ payment: { id: string; status: string; accessCode: string | null } }>(
    `/api/orders/${encodeURIComponent(orderId)}/payments`,
    { method: 'POST', token: access.token, guestOrderAccessToken: access.guestAccessToken },
    'We could not restart your payment. Please try again.',
  )
}
