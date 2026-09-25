import { cachedPublicJsonRequest, PUBLIC_CACHE_TTL } from './publicContent'

export interface JournalCategory {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface JournalAuthor {
  id: string
  name: string
}

export interface JournalPostImage {
  id: string
  role: 'cover' | 'body'
  url: string
  altText: string
  caption: string | null
  sortOrder: number
}

export type JournalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; style: 'ordered' | 'unordered'; items: string[] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'image'; imageId: string; caption?: string }

export interface JournalPostSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishedAt: string
  category: Pick<JournalCategory, 'id' | 'name' | 'slug'>
  author: JournalAuthor | null
  images: JournalPostImage[]
}

export interface JournalPost extends JournalPostSummary {
  body: {
    version: 1
    blocks: JournalBlock[]
  }
}

export interface JournalPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const journalPaths = {
  categories: '/api/journal/categories',
  posts: (params: { page?: number; limit?: number; category?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.category) query.set('category', params.category)
    return `/api/journal/posts${query.size ? `?${query.toString()}` : ''}`
  },
  post: (slug: string) => `/api/journal/posts/${encodeURIComponent(slug)}`,
}

export function getJournalCategories(signal?: AbortSignal) {
  return cachedPublicJsonRequest<{ categories: JournalCategory[] }>(journalPaths.categories, PUBLIC_CACHE_TTL.journal, signal, 'We could not load the Journal. Please try again.')
}

export function getJournalPosts(
  params: { page?: number; limit?: number; category?: string } = {},
  signal?: AbortSignal,
) {
  return cachedPublicJsonRequest<{ posts: JournalPostSummary[]; pagination: JournalPagination }>(journalPaths.posts(params), PUBLIC_CACHE_TTL.journal, signal, 'We could not load the Journal. Please try again.')
}

export function getJournalPost(slug: string, signal?: AbortSignal) {
  return cachedPublicJsonRequest<{ post: JournalPost }>(journalPaths.post(slug), PUBLIC_CACHE_TTL.journal, signal, 'We could not load this story. Please try again.')
}
