import { useEffect, useState } from 'react'
import { getSiteSections, type SiteSection } from '@/api/siteSections'
import { NAV_LINKS, type NavLink } from '@/utils/navigation'

/**
 * Filters NAV_LINKS by the live `site_sections` flags: a link tied to a disabled section with
 * "coming soon" off is hidden entirely, matching the admin Sections page's own description.
 * Renders no links until the real flags arrive — however long that takes — so a disabled
 * section's link never flashes on screen before disappearing. Only a definitive failure (not
 * just slowness) falls open to every link, so a broken backend doesn't hide navigation forever.
 */
export function useVisibleNavLinks(): NavLink[] {
  const [sections, setSections] = useState<SiteSection[] | null>(null)
  const [failedOpen, setFailedOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void getSiteSections(controller.signal)
      .then(({ sections }) => setSections(sections))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setFailedOpen(true)
      })
    return () => controller.abort()
  }, [])

  if (sections) {
    return NAV_LINKS.filter((link) => {
      if (!link.sectionKey) return true
      const section = sections.find((item) => item.key === link.sectionKey)
      if (!section) return true
      return section.isEnabled || section.showComingSoon
    })
  }

  return failedOpen ? NAV_LINKS : []
}
