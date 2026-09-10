import type { AuthUser } from '@/auth/authApi'
import { apiRequest } from './http'

export interface DefaultAddress {
  id: string
  deliveryAreaId: string | null
  recipientName: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string | null
  city: string
  landmark: string | null
}

export function getCurrentProfile(token: string, signal?: AbortSignal) {
  return apiRequest<{ user: AuthUser; defaultAddress: DefaultAddress | null }>(
    '/api/users/me',
    { token, signal },
    'We could not load your saved checkout details.',
  )
}
