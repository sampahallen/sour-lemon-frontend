import { cachedPublicJsonRequest, PUBLIC_CACHE_TTL } from './publicContent'

export interface PublicSettings {
  businessWhatsappNumber: string | null
  deliveryFeeMode: string | null
}

export const publicSettingsPath = '/api/settings/public'

export function getPublicSettings(signal?: AbortSignal) {
  return cachedPublicJsonRequest<PublicSettings>(publicSettingsPath, PUBLIC_CACHE_TTL.standard, signal, 'We could not load store settings. Please try again.')
}
