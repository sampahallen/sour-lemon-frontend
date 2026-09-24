import { useState } from 'react'
import { Link } from 'react-router'
import type { MenuProduct } from '@/api/catalog'
import { useCart } from '@/cart/cartContext'
import { cn } from '@/utils/cn'

export function MenuProductCard({
  product,
  compact = false,
  featured = false,
}: {
  product: MenuProduct
  compact?: boolean
  featured?: boolean
}) {
  const cover = product.images[0]
  const coverUrl = cover?.url ?? product.coverImageUrl
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddToCart = async () => {
    setIsAdding(true)
    setError(null)
    try {
      await addItem(product.id, 1)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not add that to your cart.')
    } finally {
      setIsAdding(false)
    }
  }

  if (compact) {
    return (
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[2rem] border border-cocoa/15 bg-cream shadow-[0_1px_0_rgba(74,44,29,0.08)] transition-transform duration-300 motion-safe:hover:-translate-y-1">
        <Link
          to={`/bakery/${product.slug}`}
          className="relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-flame"
        >
          <div className={cn('relative overflow-hidden bg-butter/45', featured ? 'aspect-[16/9]' : 'aspect-[4/3]')}>
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={cover?.altText ?? product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame/70">Sour Lemon</span>
                <span className="font-display text-3xl font-extrabold leading-tight text-cocoa/65">{product.name}</span>
              </div>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3.5 py-2 font-display text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cocoa shadow-sm backdrop-blur-sm">
              {product.category.name}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-cocoa/15 bg-cream/95 font-display text-xl text-cocoa transition-transform duration-300 group-hover:rotate-[-10deg]"
            >
              ↗
            </span>
          </div>
        </Link>

        <div className={cn('flex flex-1 flex-col p-5 sm:p-6', featured && 'sm:p-7')}>
          <Link
            to={`/bakery/${product.slug}`}
            className="w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
          >
            <h3 className={cn('font-display font-bold leading-[1.02] tracking-[-0.025em] text-cocoa', featured ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
              {product.name}
            </h3>
          </Link>
          {product.description ? (
            <p className={cn('mt-3 line-clamp-2 max-w-2xl leading-relaxed text-cocoa/65', featured ? 'text-base' : 'text-sm')}>
              {product.description}
            </p>
          ) : null}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
            <p className="font-display text-xl font-extrabold text-cocoa">
              {product.currency} {Number(product.price).toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={isAdding}
              className="shrink-0 rounded-full border-2 border-cocoa bg-flame px-5 py-2.5 font-display text-sm font-bold text-cream shadow-chunky-sm transition-[transform,box-shadow] motion-safe:hover:translate-x-0.5 motion-safe:hover:translate-y-0.5 motion-safe:hover:shadow-none disabled:cursor-wait disabled:opacity-60"
            >
              {isAdding ? 'Adding…' : '+ Add'}
            </button>
          </div>
          {error ? <p role="alert" className="mt-3 text-xs font-semibold text-flame">{error}</p> : null}
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link to={`/bakery/${product.slug}`} className="block overflow-hidden rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame">
        <div className="relative aspect-square overflow-hidden bg-butter/35">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={cover?.altText ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame/70">Sour Lemon</span>
              <span className="font-display text-3xl font-extrabold leading-tight text-cocoa/65">{product.name}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-5">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-flame">{product.category.name}</span>
        <Link to={`/bakery/${product.slug}`} className={cn('w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame', !product.description && 'mb-5')}>
          <h3 className="mt-2 font-display text-[1.65rem] font-bold leading-tight text-cocoa">{product.name}</h3>
        </Link>
        {product.description ? <p className="mb-5 mt-2 line-clamp-2 text-sm leading-relaxed text-cocoa/65">{product.description}</p> : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-cocoa/15 pt-4">
          <p className="font-display text-xl font-bold text-cocoa">
            {product.currency} {Number(product.price).toFixed(2)}
          </p>
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isAdding}
            className="shrink-0 rounded-full bg-flame px-4 py-2.5 font-display text-sm font-bold text-cream transition-transform motion-safe:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isAdding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
        {error ? <p role="alert" className="mt-2 text-xs font-semibold text-flame">{error}</p> : null}
      </div>
    </article>
  )
}
