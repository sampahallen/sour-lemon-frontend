import { apiRequest } from './http'
import type { DeliveryAddressInput, FulfillmentType, OrderReceipt, PaymentMethod } from './orderTypes'

export interface CheckoutQuoteInput {
  fulfillmentType: FulfillmentType
  deliveryAreaId?: string | null
}

export interface CheckoutQuote {
  quote: {
    subtotal: string
    deliveryFee: string
    total: string
    currency: string
  }
  pickupLocation: string | null
  deliveryFeeMode: string
}

export interface CheckoutInput {
  customerName: string
  customerEmail?: string | null
  phoneNumber: string
  whatsappNumber?: string | null
  fulfillmentType: FulfillmentType
  deliveryAreaId?: string | null
  deliveryAddress?: DeliveryAddressInput | null
  paymentMethod: PaymentMethod
  paymentName?: string
  customerNotes?: string | null
}

export interface CheckoutResult {
  order: OrderReceipt
  payment: {
    id: string
    status: string
    accessCode: string | null
  }
  guestAccessToken?: string
}

export function quoteCheckout(
  input: CheckoutQuoteInput,
  token?: string | null,
  signal?: AbortSignal,
) {
  return apiRequest<CheckoutQuote>(
    '/api/checkout/quote',
    { method: 'POST', body: input, token, signal },
    'We could not calculate your total. Please try again.',
  )
}

export function createCheckout(input: CheckoutInput, token?: string | null) {
  return apiRequest<CheckoutResult>(
    '/api/checkout',
    { method: 'POST', body: input, token },
    'We could not place your order. Please try again.',
  )
}
