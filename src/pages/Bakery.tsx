import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  getMenuCategories,
  getMenuProducts,
  type MenuCategory,
  type MenuProduct,
} from '@/api/catalog'
import { MenuProductCard } from '@/components/catalog/MenuProductCard'
import { Button } from '@/components/ui/Button'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
import { cn } from '@/utils/cn'

export function Bakery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? ''
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [products, setProducts] = useState<MenuProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getMenuCategories(controller.signal)
      .then(({ categories }) => setCategories(categories))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load menu categories.')
        }
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void getMenuProducts({ category: selectedCategory || undefined }, controller.signal)
      .then(({ products }) => setProducts(products))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load the Bakery menu.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [selectedCategory])

  const selectCategory = (slug: string) => {
    setIsLoading(true)
    setError(null)
    const next = new URLSearchParams()
    if (slug) next.set('category', slug)
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header className="relative isolate overflow-hidden pt-20 lg:pt-15">
        <LemonPrintBackdrop className="-right-1/3 -top-1/4 left-auto h-[150%] w-[95%] opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-6 px-6 pb-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.55fr)] lg:gap-10 lg:px-10 lg:pb-12">
          <div>
            <span className="inline-flex items-center gap-3 font-display text-xs font-bold uppercase tracking-[0.22em] text-flame sm:text-sm">
              <span className="h-px w-8 bg-flame" aria-hidden="true" />
              Fresh from the kitchen
            </span>
            <h1 className="mt-2 font-display text-[clamp(3.75rem,12vw,8.5rem)] font-extrabold leading-[0.8] tracking-[-0.065em] text-cocoa">
              <span className="block text-[0.48em] leading-none text-flame">The</span>
              Bakery<span className="text-flame">.</span>
            </h1>
          </div>
          <p className="max-w-sm border-l-2 border-flame/55 pl-5 text-base leading-relaxed text-cocoa/75 sm:text-lg">
            Whimsical cakes, mini cakes, and made-to-order sweetness from Sour Lemon.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-5 border-y border-cocoa/15 py-6 lg:flex-row lg:items-center lg:justify-between">
          {categories.length ? (
            <div className="-mx-6 w-full min-w-0 overflow-x-auto px-6 lg:mx-0 lg:flex-1 lg:px-0" role="group" aria-label="Filter Bakery menu by category">
              <div className="flex w-max min-w-full gap-2">
                <button
                  type="button"
                  aria-pressed={!selectedCategory}
                  className={cn(
                    'shrink-0 rounded-full border px-5 py-2.5 font-display text-sm font-bold transition-colors',
                    !selectedCategory ? 'border-cocoa bg-cocoa text-cream' : 'border-cocoa/20 text-cocoa hover:border-cocoa',
                  )}
                  onClick={() => selectCategory('')}
                >
                  Everything
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={selectedCategory === category.slug}
                    className={cn(
                      'shrink-0 rounded-full border px-5 py-2.5 font-display text-sm font-bold transition-colors',
                      selectedCategory === category.slug
                        ? 'border-cocoa bg-cocoa text-cream'
                        : 'border-cocoa/20 text-cocoa hover:border-cocoa',
                    )}
                    onClick={() => selectCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : <p className="text-sm font-medium text-cocoa/55">Made in small batches, just for you.</p>}
          <Link
            to="/custom-cake"
            className="w-fit shrink-0 font-display text-sm font-bold text-olive underline decoration-olive/50 underline-offset-4 transition-colors hover:text-cocoa focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame"
          >
            Looking for a custom cake? <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="mb-9 mt-12">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Browse the menu</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-cocoa sm:text-4xl">Pick your treat.</h2>
          </div>
        </div>

        {isLoading ? (
          <p className="py-20 text-center font-semibold text-cocoa/55">Loading the Bakery menu…</p>
        ) : error ? (
          <div className="rounded-[2rem] border-2 border-flame/20 bg-white p-10 text-center">
            <p className="font-semibold text-flame">{error}</p>
            <Button className="mt-5" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-cocoa/10 bg-white p-12 text-center">
            <h2 className="font-display text-3xl font-bold text-cocoa">Nothing is on this counter yet.</h2>
            <p className="mt-3 text-cocoa/60">Check back soon for the next Sour Lemon menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => <MenuProductCard key={product.id} product={product} compact />)}
          </div>
        )}
      </main>
    </div>
  )
}
