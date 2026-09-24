import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { slideUpVariant, bouncyPulse } from '@/utils/motion'
import { asset } from '@/utils/asset'

type Product = {
  label: string
  src: string
  rotate: number
  height: string
  grow: string
  hideOnMobile?: boolean
  // Stagger delay before this piece slides up into place.
  delay: number
}

const shadow = 'drop-shadow-[0_14px_14px_rgba(74,44,29,0.22)]'

const products: Product[] = [
  {
    label: 'Mini Cake 01',
    src: '/images/hero-v2/mini-cake-cherry.png',
    rotate: -2,
    height: 'h-36 sm:h-48 lg:h-60',
    grow: 'grow-[1]',
    delay: 0.1,
  },
  {
    label: 'Signature Custom Cake',
    src: '/images/hero-v2/signature-celebration-cake.png',
    rotate: -1,
    height: 'h-48 sm:h-64 lg:h-72',
    grow: 'grow-[2]',
    delay: 0.02,
  },
  {
    label: 'Premium Jam Jar',
    src: '/images/hero-v2/artisan-jam-jar.png',
    rotate: 2,
    height: 'h-36 sm:h-48 lg:h-60',
    grow: 'grow-[1]',
    delay: 0.3,
  },
  {
    label: 'Creative Studio Composition',
    src: '/images/hero-v2/creative-studio.png',
    rotate: -1.5,
    height: 'h-40 sm:h-52 lg:h-72',
    grow: 'grow-[1]',
    hideOnMobile: true,
    delay: 0.16,
  },
  {
    label: 'Graphic T Shirt',
    src: '/images/hero-v2/ghanaian-memory-tshirt.png',
    rotate: 2,
    height: 'h-36 sm:h-48 lg:h-60',
    grow: 'grow-[1]',
    delay: 0.36,
  },
]

export function HeroProductShelf() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className="relative mt-auto flex w-full flex-col items-center gap-6 pb-8 pt-6 lg:gap-6 lg:pb-6">
      <div data-navbar-avoid="true" className="flex w-full items-end gap-1 px-2 sm:gap-2 lg:gap-3">
        {products.map((product, index) => (
          <div
            key={product.label}
            className={`${product.grow} ${product.height} min-w-0 shrink ${product.hideOnMobile ? 'hidden sm:block' : ''}`}
          >
            {/* Trigger wrapper stays at its natural, un-offset position so viewport
                detection isn't thrown off by the sliding child's large starting offset. */}
            <motion.div
              className="h-full w-full"
              initial={prefersReducedMotion ? undefined : 'hidden'}
              whileInView={prefersReducedMotion ? undefined : 'visible'}
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                className="h-full w-full"
                style={{ rotate: `${product.rotate}deg` }}
                variants={prefersReducedMotion ? undefined : slideUpVariant(420, product.delay)}
              >
                <motion.div
                  className="h-full w-full"
                  animate={prefersReducedMotion ? undefined : 'animate'}
                  variants={prefersReducedMotion ? undefined : bouncyPulse(7, 0.025, 4.2 + (index % 3) * 0.6, product.delay + 1.2)}
                >
                  <img
                    src={asset(product.src)}
                    alt={product.label}
                    draggable={false}
                    className={`h-full w-full select-none object-contain object-bottom ${shadow}`}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>

      <div data-navbar-avoid="true" className="flex items-center justify-center gap-4 px-4">
        <Button to="/bakery" size="lg">
          Shop the Bakery
        </Button>
        <Link
          to="/shop"
          className="rounded-sm font-display text-sm font-bold text-cocoa underline decoration-cocoa/40 underline-offset-4 transition-colors hover:text-flame focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame sm:text-base"
        >
          Explore the Shop
        </Link>
      </div>
    </div>
  )
}
