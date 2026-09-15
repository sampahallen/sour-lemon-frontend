import { apiRequest } from './http'

export interface PublicSettings {
  businessWhatsappNumber: string | null
  pickupLocation: string | null
  deliveryFeeMode: string | null
}

export function getPublicSettings(signal?: AbortSignal) {
  return apiRequest<PublicSettings>(
    '/api/settings/public',
    { signal },
    'We could not load store settings. Please try again.',
  )
}
