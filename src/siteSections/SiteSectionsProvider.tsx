import { useMemo, type ReactNode } from 'react'
import { getSiteSections, siteSectionsPath } from '@/api/siteSections'
import { usePublicResource } from '@/hooks/usePublicResource'
import { NAV_LINKS } from '@/utils/navigation'
import { SectionStateContext, SiteSectionsContext } from './siteSectionsContext'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const CORE_SECTION_KEYS = new Set(['cakes', 'shop', 'journal', 'about', 'contact'])

export function SiteSectionsProvider({ children }: { children: ReactNode }) {
  const { data, error, refresh } = usePublicResource({
    cacheKey: `${siteSectionsPath}:visibility-v2`,
    maxAgeMs: ONE_DAY_MS,
    fetcher: getSiteSections,
  })

  const visibleLinks = useMemo(() => {
    if (!data) {
      return NAV_LINKS.filter((link) => !link.sectionKey || CORE_SECTION_KEYS.has(link.sectionKey))
    }
    return NAV_LINKS.filter((link) => {
      if (!link.sectionKey) return true
      const section = data.sections.find((item) => item.key === link.sectionKey)
      return Boolean(section && section.isEnabled)
    })
  }, [data])

  return <SectionStateContext.Provider value={{ sections: data?.sections ?? null, error, refresh }}><SiteSectionsContext.Provider value={visibleLinks}>{children}</SiteSectionsContext.Provider></SectionStateContext.Provider>
}
