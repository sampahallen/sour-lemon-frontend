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
    <div className="min-h-screen bg-cream pb-24 pt-36">
      <header className="mx-auto max-w-6xl px-6 text-center lg:px-10">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-flame">Fresh from the kitchen</span>
        <h1 className="mt-4 font-display text-5xl font-bold text-cocoa sm:text-7xl">The Bakery</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cocoa/65 sm:text-lg">
          Whimsical cakes, mini cakes, and made-to-order sweetness from Sour Lemon.
        </p>
      </header>

      <main className="mx-auto mt-12 max-w-6xl px-6 lg:px-10">
        {categories.length ? (
          <div className="mb-10 flex flex-wrap justify-center gap-2" aria-label="Filter Bakery menu by category">
            <button
              className={cn(
                'rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors',
                !selectedCategory ? 'border-flame bg-flame text-cream' : 'border-cocoa/15 text-cocoa hover:border-flame',
              )}
              onClick={() => selectCategory('')}
            >
              Everything
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  'rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors',
                  selectedCategory === category.slug
                    ? 'border-flame bg-flame text-cream'
                    : 'border-cocoa/15 text-cocoa hover:border-flame',
                )}
                onClick={() => selectCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
            <Link
              to="/custom-cake"
              className="rounded-full border-2 border-olive px-4 py-2 text-sm font-bold text-olive transition-colors hover:bg-olive hover:text-cream"
            >
              Custom Cakes
            </Link>
          </div>
        ) : null}

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
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => <MenuProductCard key={product.id} product={product} />)}
          </div>
        )}
      </main>
    </div>
  )
}
