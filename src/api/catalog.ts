import { cachedPublicJsonRequest, PUBLIC_CACHE_TTL } from './publicContent'

export interface MenuCategory {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export interface MenuProductImage {
  id: string
  productId: string
  url: string
  altText: string | null
  sortOrder: number
}

export interface MenuProduct {
  id: string
  categoryId: string
  category: Pick<MenuCategory, 'id' | 'name' | 'slug'>
  name: string
  slug: string
  description: string | null
  price: string
  currency: string
  availableFrom: string | null
  availableUntil: string | null
  coverImageUrl: string | null
  images: MenuProductImage[]
}

export const catalogPaths = {
  categories: '/api/catalog/categories',
  products: (params: { category?: string; limit?: number } = {}) => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', params.category)
    if (params.limit) query.set('limit', String(params.limit))
    const search = query.toString()
    return `/api/catalog/products${search ? `?${search}` : ''}`
  },
  product: (slug: string) => `/api/catalog/products/${encodeURIComponent(slug)}`,
}

export function getMenuCategories(signal?: AbortSignal) {
  return cachedPublicJsonRequest<{ categories: MenuCategory[] }>(catalogPaths.categories, PUBLIC_CACHE_TTL.standard, signal, 'We could not load the Bakery menu. Please try again.')
}

export function getMenuProducts(
  params: { category?: string; limit?: number } = {},
  signal?: AbortSignal,
) {
  return cachedPublicJsonRequest<{ products: MenuProduct[] }>(catalogPaths.products(params), PUBLIC_CACHE_TTL.standard, signal, 'We could not load the Bakery menu. Please try again.')
}

export function getMenuProduct(slug: string, signal?: AbortSignal) {
  return cachedPublicJsonRequest<{ product: MenuProduct }>(catalogPaths.product(slug), PUBLIC_CACHE_TTL.standard, signal, 'We could not load this product. Please try again.')
}
