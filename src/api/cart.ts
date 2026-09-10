import { apiRequest } from './http'

export interface CartItem {
  productId: string
  name: string
  slug: string
  coverImageUrl: string | null
  unitPrice: string
  currency: string
  quantity: number
  lineTotal: string
  isActive: boolean
}

export interface Cart {
  id: string | null
  items: CartItem[]
  subtotal: string
  currency: string
}

const CART_ERROR = 'We could not load your cart. Please try again.'

export function getCart(token?: string | null, signal?: AbortSignal) {
  return apiRequest<{ cart: Cart }>('/api/cart', { token, signal }, CART_ERROR)
}

export function addCartItem(productId: string, quantity: number, token?: string | null) {
  return apiRequest<{ cart: Cart }>(
    '/api/cart/items',
    { method: 'POST', body: { productId, quantity }, token },
    'We could not add that to your cart. Please try again.',
  )
}

export function updateCartItem(productId: string, quantity: number, token?: string | null) {
  return apiRequest<{ cart: Cart }>(
    `/api/cart/items/${encodeURIComponent(productId)}`,
    { method: 'PATCH', body: { quantity }, token },
    'We could not update your cart. Please try again.',
  )
}

export function removeCartItem(productId: string, token?: string | null) {
  return apiRequest<{ cart: Cart }>(
    `/api/cart/items/${encodeURIComponent(productId)}`,
    { method: 'DELETE', token },
    'We could not remove that item. Please try again.',
  )
}
