const apiBaseUrl = (import.meta.env.API_URL).replace(/\/$/, '')

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

interface ApiErrorBody {
  error?: string
}

async function catalogRequest<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not load the Bakery menu. Please try again.')
  }
  return (await response.json()) as T
}

export function getMenuCategories(signal?: AbortSignal) {
  return catalogRequest<{ categories: MenuCategory[] }>('/api/catalog/categories', signal)
}

export function getMenuProducts(
  params: { category?: string; limit?: number } = {},
  signal?: AbortSignal,
) {
  const query = new URLSearchParams()
  if (params.category) query.set('category', params.category)
  if (params.limit) query.set('limit', String(params.limit))
  const search = query.toString()
  return catalogRequest<{ products: MenuProduct[] }>(
    `/api/catalog/products${search ? `?${search}` : ''}`,
    signal,
  )
}

export function getMenuProduct(slug: string, signal?: AbortSignal) {
  return catalogRequest<{ product: MenuProduct }>(`/api/catalog/products/${encodeURIComponent(slug)}`, signal)
}
