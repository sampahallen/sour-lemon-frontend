const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

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

interface ApiErrorBody {
  error?: string
}

async function journalRequest<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not load the Journal. Please try again.')
  }

  return (await response.json()) as T
}

export function getJournalCategories(signal?: AbortSignal) {
  return journalRequest<{ categories: JournalCategory[] }>('/api/journal/categories', signal)
}

export function getJournalPosts(
  params: { page?: number; limit?: number; category?: string } = {},
  signal?: AbortSignal,
) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.category) query.set('category', params.category)

  return journalRequest<{ posts: JournalPostSummary[]; pagination: JournalPagination }>(
    `/api/journal/posts${query.size ? `?${query.toString()}` : ''}`,
    signal,
  )
}

export function getJournalPost(slug: string, signal?: AbortSignal) {
  return journalRequest<{ post: JournalPost }>(`/api/journal/posts/${encodeURIComponent(slug)}`, signal)
}
