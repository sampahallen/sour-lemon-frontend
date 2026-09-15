const apiBaseUrl = (import.meta.env.API_URL).replace(/\/$/, '')

export interface SiteSection {
  id: string
  key: string
  name: string
  isEnabled: boolean
  showComingSoon: boolean
  sortOrder: number
}

interface ApiErrorBody {
  error?: string
}

export async function getSiteSections(signal?: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}/api/site-sections`, { signal })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody
    throw new Error(body.error ?? 'We could not load site sections.')
  }
  return (await response.json()) as { sections: SiteSection[] }
}
