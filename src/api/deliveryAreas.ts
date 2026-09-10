import { apiRequest } from './http'

export interface DeliveryArea {
  id: string
  name: string
  slug: string
  deliveryFee: string | null
}

export function getDeliveryAreas(signal?: AbortSignal) {
  return apiRequest<{ deliveryAreas: DeliveryArea[] }>(
    '/api/delivery-areas',
    { signal },
    'We could not load delivery areas. Please try again.',
  )
}
