import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getMenuProducts, type MenuProduct } from '@/api/catalog'
import { MenuProductCard } from '@/components/catalog/MenuProductCard'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer } from '@/utils/motion'

export function BestSellers() {
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    void getMenuProducts({ limit: 3 }, controller.signal)
      .then(({ products }) => setProducts(products))
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <section id="food" className="relative bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <motion.div
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeInUp}
        >
          <div>
            <span className="font-display text-sm font-bold uppercase tracking-wide text-flame">From the Bakery</span>
            <h2 className="mt-2 text-3xl font-bold leading-tight text-cocoa sm:text-4xl">Fresh on the counter.</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-cocoa/60 sm:text-base">
              A few small-batch favorites, ready for birthdays, cravings and everything between.
            </p>
          </div>
          <Button to="/bakery" variant="outline" accent="cocoa">See today&apos;s menu</Button>
        </motion.div>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 rounded-[2.5rem] bg-butter/30 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3 lg:p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {isLoading ? (
            <p className="col-span-full py-16 text-center font-semibold text-cocoa/50">Loading the menu…</p>
          ) : products.length ? (
            products.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <MenuProductCard product={product} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border-2 border-cocoa/10 bg-white p-10 text-center">
              <p className="font-display text-2xl font-bold text-cocoa">The next menu is baking.</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
