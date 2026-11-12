import { useContext, type ReactNode } from 'react'
import { SectionStateContext } from './siteSectionsContext'
import { StubPage } from '@/pages/StubPage'
import { NotFound } from '@/pages/NotFound'
export function SectionGate({ sectionKey, children }: { sectionKey: string; children: ReactNode }) {
  const { sections, error, refresh } = useContext(SectionStateContext)
  if (!sections) return error ? <div role="alert">{error}<button type="button" onClick={refresh}>Try again</button></div> : <p role="status">Loading…</p>
  const section = sections.find((item) => item.key === sectionKey)
  if (!section?.isEnabled) return <NotFound />
  if (section.showComingSoon) return <StubPage title={section.name} description="We're preparing something special. Check back soon." />
  return children
}
