import { motion } from 'framer-motion'
import { Wordmark } from '@/assets/logo/Wordmark'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { bouncyPulse } from '@/utils/motion'

export function HeroWordmark() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      className="pointer-events-none relative z-10 flex select-none items-center justify-center"
    >
      <span
        aria-hidden="true"
        data-navbar-avoid="true"
        className="absolute inset-x-0 bottom-[4%] top-[4%]"
      />
      <motion.div
        variants={prefersReducedMotion ? undefined : bouncyPulse(3, 0.01, 5.5, 0)}
        animate={prefersReducedMotion ? undefined : 'animate'}
        className="flex items-center justify-center"
      >
        <Wordmark className="text-[17vw] sm:text-[13vw] lg:text-[6.75rem] xl:text-[8.5rem] 2xl:text-[10rem]" />
      </motion.div>
    </div>
  )
}
