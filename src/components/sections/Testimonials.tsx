import { motion } from 'framer-motion'
import { Star } from '@/assets/doodles/doodleIcons'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
import { fadeInUp, staggerContainer } from '@/utils/motion'

type Testimonial = {
  quote: string
  name: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    quote: 'The lemon drop cake showed up looking like art and tasted even better. Gone in a day.',
    name: 'Priya N.',
    role: 'Repeat customer',
  },
  {
    quote: 'Ordered the jam trio as a gift and ended up buying myself a second set the same week.',
    name: 'Marcus D.',
    role: 'First-time buyer',
  },
  {
    quote: 'Every collab drop sells out before I finish my coffee. Set a reminder, seriously.',
    name: 'Yuki S.',
    role: 'Collab regular',
  },
]

export function Testimonials() {
  return (
    <section id="collabs" className="relative bg-sand py-16 lg:py-24">
      <LemonPrintBackdrop className="opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]" />
      <div className="relative mx-auto max-w-6xl px-6 text-center lg:px-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeInUp}>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-cocoa/60">
            Made Together
          </span>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-cocoa sm:text-4xl">Loved By The Regulars</h2>
        </motion.div>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              className="flex flex-col items-center rounded-[1.75rem] border-2 border-cocoa/10 bg-cream p-7 text-left shadow-[var(--shadow-chunky-sm)] sm:items-start"
            >
              <div className="flex gap-1 text-flame" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-4 text-base leading-relaxed text-cocoa/80">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-5 font-display text-sm font-bold text-cocoa">{testimonial.name}</p>
              <p className="text-xs uppercase tracking-wide text-cocoa/50">{testimonial.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
