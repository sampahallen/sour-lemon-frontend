import { publicJsonRequest } from './publicContent'

export interface SiteSection {
  id: string
  key: string
  name: string
  isEnabled: boolean
  showComingSoon: boolean
  sortOrder: number
}

export const siteSectionsPath = '/api/site-sections'

export async function getSiteSections(signal?: AbortSignal) {
  return publicJsonRequest<{ sections: SiteSection[] }>(siteSectionsPath, signal, 'We could not load site sections.')
}
