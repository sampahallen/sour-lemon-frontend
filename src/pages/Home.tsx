import { Hero } from '@/components/hero/Hero'
import { AboutIntro } from '@/components/sections/AboutIntro'
import { BestSellers } from '@/components/sections/BestSellers'
import { ValueProp } from '@/components/sections/ValueProp'
import { Testimonials } from '@/components/sections/Testimonials'
import { LatestStories } from '@/components/sections/LatestStories'
import { SectionDivider } from '@/components/ui/SectionDivider'

export function Home() {
  return (
    <>
      <Hero />
      <SectionDivider color="butter" className="bg-cream" />

      <AboutIntro />
      <SectionDivider color="cream" className="bg-butter" />

      <BestSellers />

      <SectionDivider color="cocoa" className="bg-cream" />

      <ValueProp />

      <SectionDivider color="sand" className="bg-cocoa" />

      <Testimonials />

      <SectionDivider color="cream" className="bg-sand" />

      <LatestStories />
    </>
  )
}
