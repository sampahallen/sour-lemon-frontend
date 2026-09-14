import { useState } from 'react'
import { Link } from 'react-router'
import type { MenuProduct } from '@/api/catalog'
import { useCart } from '@/cart/cartContext'
import { cn } from '@/utils/cn'

export function MenuProductCard({
  product,
  compact = false,
}: {
  product: MenuProduct
  compact?: boolean
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

  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link to={`/bakery/${product.slug}`} className="block overflow-hidden rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame">
        <div className={cn('relative overflow-hidden bg-butter/35', compact ? 'aspect-[4/5]' : 'aspect-square')}>
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
          <h3 className={cn('mt-2 font-display font-bold leading-tight text-cocoa', compact ? 'text-2xl' : 'text-[1.65rem]')}>{product.name}</h3>
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
