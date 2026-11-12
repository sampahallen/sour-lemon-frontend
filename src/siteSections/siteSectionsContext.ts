import { createContext, useContext } from 'react'
import type { NavLink } from '@/utils/navigation'

export const SiteSectionsContext = createContext<NavLink[] | null>(null)

export function useSiteSectionLinks() {
  const links = useContext(SiteSectionsContext)
  if (!links) throw new Error('useSiteSectionLinks must be used inside SiteSectionsProvider.')
  return links
}

import type { SiteSection } from '@/api/siteSections'
export const SectionStateContext = createContext<{ sections: SiteSection[] | null; error: string | null; refresh: () => void }>({ sections: null, error: null, refresh: () => {} })
