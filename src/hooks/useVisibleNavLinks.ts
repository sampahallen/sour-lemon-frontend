import { useSiteSectionLinks } from '@/siteSections/siteSectionsContext'
import type { NavLink } from '@/utils/navigation'

/** Reads the shared last-known-good CMS section configuration. */
export function useVisibleNavLinks(): NavLink[] {
  return useSiteSectionLinks()
}
