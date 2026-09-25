import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  getMenuCategories,
  getMenuProducts,
  type MenuCategory,
  type MenuProduct,
} from '@/api/catalog'
import { Sparkle, Squiggle } from '@/assets/doodles/doodleIcons'
import { CakeIllustration } from '@/assets/illustrations/CakeIllustration'
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
      <header
        data-navbar-theme="dark"
        className="relative isolate -mt-20 overflow-hidden rounded-b-[2.5rem] bg-flame pt-20 text-cream lg:-mt-24 lg:rounded-b-[4rem] lg:pt-24"
      >
        <LemonPrintBackdrop className="opacity-10 mix-blend-screen" />
        <Sparkle className="absolute left-[7%] top-[32%] h-9 w-9 rotate-12 text-butter/70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:px-10 lg:py-20">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-3 font-display text-xs font-bold uppercase tracking-[0.22em] text-butter sm:text-sm">
              <span className="h-px w-8 bg-butter" aria-hidden="true" />
              Today&apos;s counter
            </span>
            <h1 className="mt-4 font-display text-[clamp(4rem,10vw,8.5rem)] font-extrabold leading-[0.78] tracking-[-0.065em]">
              The Bakery<span className="text-butter">.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg lg:text-xl">
              Whimsical cakes, mini cakes and made-to-order sweetness—baked in small batches and dressed for the occasion.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-display text-xs font-bold uppercase tracking-[0.15em] text-butter">
              <span>Small batch</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cream/50" aria-hidden="true" />
              <span>Made in Accra</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cream/50" aria-hidden="true" />
              <span>Big personality</span>
            </div>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-[20rem] lg:block">
            <div className="absolute inset-3 rotate-6 rounded-[42%_58%_47%_53%/52%_42%_58%_48%] bg-butter" />
            <CakeIllustration className="relative h-full w-full -rotate-3 drop-shadow-[8px_10px_0_rgba(74,44,29,0.18)]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <div className="rounded-[1.75rem] border border-cocoa/15 bg-cream px-4 py-4 shadow-[0_8px_30px_rgba(74,44,29,0.06)] sm:px-5 lg:flex lg:items-center lg:justify-between lg:gap-6">
          {categories.length ? (
            <div className="min-w-0 overflow-x-auto" role="group" aria-label="Filter Bakery menu by category">
              <div className="flex w-max gap-2">
                <button
                  type="button"
                  aria-pressed={!selectedCategory}
                  className={cn(
                    'shrink-0 rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold transition-colors',
                    !selectedCategory
                      ? 'border-cocoa bg-cocoa text-cream'
                      : 'border-transparent bg-butter/45 text-cocoa hover:border-cocoa/30',
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
                      'shrink-0 rounded-full border-2 px-5 py-2.5 font-display text-sm font-bold transition-colors',
                      selectedCategory === category.slug
                        ? 'border-cocoa bg-cocoa text-cream'
                        : 'border-transparent bg-butter/45 text-cocoa hover:border-cocoa/30',
                    )}
                    onClick={() => selectCategory(category.slug)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-cocoa/55">Made in small batches, just for you.</p>
          )}
          <Link
            to="/custom-cake"
            className="mt-4 inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-2 py-2 font-display text-sm font-bold text-olive underline decoration-olive/50 underline-offset-4 transition-colors hover:text-cocoa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame lg:mt-0"
          >
            Design a custom cake <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <section className="mt-8 rounded-[2.25rem] bg-butter/30 p-4 sm:p-6 lg:mt-10 lg:rounded-[3rem] lg:p-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 px-1 sm:mb-9">
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Browse the menu</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-cocoa sm:text-5xl">Pick your treat.</h2>
            </div>
            {!isLoading && !error ? (
              <p className="font-display text-sm font-bold text-cocoa/55">
                {products.length} {products.length === 1 ? 'treat' : 'treats'} on the counter
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="aspect-[4/3] animate-pulse rounded-[2rem] bg-cream/70" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border-2 border-flame/20 bg-cream p-10 text-center">
              <p className="font-semibold text-flame">{error}</p>
              <Button className="mt-5" onClick={() => window.location.reload()}>Try again</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[2rem] border-2 border-cocoa/10 bg-cream p-12 text-center">
              <h2 className="font-display text-3xl font-bold text-cocoa">Nothing is on this counter yet.</h2>
              <p className="mt-3 text-cocoa/60">Check back soon for the next Sour Lemon menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => {
                const featured = index === 0 && products.length > 1
                return (
                  <div key={product.id} className={cn(featured && 'sm:col-span-2 lg:col-span-2')}>
                    <MenuProductCard product={product} compact featured={featured} />
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-9 flex items-center justify-center gap-4 text-flame/70">
            <Squiggle className="h-5 w-20" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em]">Made by hand</span>
            <Squiggle className="h-5 w-20 -scale-x-100" />
          </div>
        </section>
      </main>
    </div>
  )
}
