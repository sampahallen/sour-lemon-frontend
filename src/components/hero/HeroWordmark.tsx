import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { bouncyPulse } from '@/utils/motion'

function LetteredWord({ text, tilts }: { text: string; tilts: number[] }) {
  return text.split('').map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className="inline-block origin-bottom"
      style={{ transform: `rotate(${tilts[index]}deg)` }}
    >
      {letter}
    </span>
  ))
}

export function HeroWordmark() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      role="img"
      aria-label="Sour Lemon"
      data-navbar-avoid="true"
      className="pointer-events-none relative z-10 select-none text-center"
    >
      <motion.span
        aria-hidden="true"
        variants={prefersReducedMotion ? undefined : bouncyPulse(3, 0.01, 5.5, 0)}
        animate={prefersReducedMotion ? undefined : 'animate'}
        className="block"
      >
        <span className="block -rotate-3 whitespace-nowrap font-display text-[26vw] font-extrabold leading-[0.8] tracking-[-0.055em] text-flame sm:text-[20vw] lg:text-[10rem] xl:text-[12.5rem] 2xl:text-[14.5rem]">
          <LetteredWord text="SOUR" tilts={[-3, 2, -2, 3]} />
        </span>
      </motion.span>
      <motion.span
        aria-hidden="true"
        variants={prefersReducedMotion ? undefined : bouncyPulse(3, 0.01, 5.5, 0.3)}
        animate={prefersReducedMotion ? undefined : 'animate'}
        className="-mt-3 block lg:-mt-6"
      >
        <span className="block rotate-2 whitespace-nowrap font-display text-[19vw] font-extrabold leading-[0.8] tracking-[-0.055em] text-flame sm:text-[15vw] lg:text-[7.75rem] xl:text-[9.75rem] 2xl:text-[11rem]">
          <LetteredWord text="LEMON" tilts={[2, -3, 2, -2, 3]} />
        </span>
      </motion.span>
    </div>
  )
}
