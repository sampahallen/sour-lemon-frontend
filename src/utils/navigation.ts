export type NavLink = {
  label: string
  to: string
  /** Matches a `site_sections.key` from the backend. Omit for links that are always shown. */
  sectionKey?: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Bakery', to: '/bakery', sectionKey: 'cakes' },
  { label: 'Shop', to: '/shop', sectionKey: 'shop' },
  { label: 'Collabs', to: '/collabs', sectionKey: 'collaborations' },
  { label: 'Games', to: '/games', sectionKey: 'games' },
  { label: 'Journal', to: '/journal', sectionKey: 'journal' },
  { label: 'About', to: '/about', sectionKey: 'about' },
  { label: 'Contact', to: '/contact', sectionKey: 'contact' },
]
