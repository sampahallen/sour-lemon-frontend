import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ShopperToteIllustration } from '@/assets/illustrations/ShopperToteIllustration'
import { fadeInUp } from '@/utils/motion'

export function ValueProp() {
  return (
    <section id="shop" data-navbar-theme="dark" className="relative bg-cocoa py-24 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10">
        <motion.div
          className="text-center lg:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeInUp}
        >
          <span className="font-display text-sm font-bold uppercase tracking-wide text-flame">
            Why Shop With Us
          </span>
          <p className="mt-3 font-display text-4xl font-extrabold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
            Handmade in Small Batches.
            <br />
            Never Mass-Produced.
          </p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/70 lg:mx-0">
            Every cake, jam, and merch is hand-made by us in limited drops — no factories, no
            shortcuts. Once a drop sells out, it&apos;s gone for good, so shop it while it&apos;s here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Sour Lemon values">
            {['Small batch', 'Made in Accra', 'Limited drops'].map((value) => (
              <span
                key={value}
                className="rounded-full border border-cream/25 bg-cream/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-butter"
              >
                {value}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Button to="/shop" variant="outline" accent="cream">
              Explore the Shop
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="overflow-hidden rounded-[2.5rem] border-4 border-cream/20 bg-cream/10 p-10">
            <ShopperToteIllustration className="h-full w-full" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
