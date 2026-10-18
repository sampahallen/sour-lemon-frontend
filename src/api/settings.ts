import { publicJsonRequest } from './publicContent'
import type { FulfillmentType, PaymentMethod } from './orderTypes'

export interface PublicSettings {
  checkout: { fulfillmentTypes: FulfillmentType[]; paymentMethods: Array<Extract<PaymentMethod, 'momo' | 'cash'>> }
  momoPaymentNumber: string | null
  momoRecipientName: string | null
  momoNetwork: string | null
  businessWhatsappNumber: string | null
  deliveryFeeMode: string | null
}

export const publicSettingsPath = '/api/settings/public'

export function getPublicSettings(signal?: AbortSignal) {
  return publicJsonRequest<PublicSettings>(publicSettingsPath, signal, 'We could not load store settings. Please try again.')
}
