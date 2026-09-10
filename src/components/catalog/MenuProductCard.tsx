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
    <div className={cn(
      'group flex h-full flex-col overflow-hidden border-2 border-cocoa/10 bg-white transition-transform hover:-translate-y-1',
      compact ? 'w-full rounded-3xl' : 'rounded-[2rem]',
    )}>
      <Link to={`/bakery/${product.slug}`} className="block">
        <div className={cn('overflow-hidden bg-butter/25', compact ? 'aspect-[4/3]' : 'aspect-square')}>
          {cover ? (
            <img
              src={cover.url}
              alt={cover.altText ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={cn(
              'flex h-full items-center justify-center px-6 text-center font-display font-bold text-flame/30',
              compact ? 'text-2xl' : 'text-3xl',
            )}>
              {product.name}
            </div>
          )}
        </div>
      </Link>
      <div className={cn('flex flex-1 flex-col', compact ? 'p-4' : 'p-6')}>
        <span className="font-display text-xs font-bold uppercase tracking-wide text-flame">{product.category.name}</span>
        <Link to={`/bakery/${product.slug}`}>
          <h2 className={cn('mt-2 font-display font-bold leading-tight text-cocoa', compact ? 'text-xl' : 'text-2xl')}>{product.name}</h2>
        </Link>
        {product.description ? <p className={cn('mt-3 text-sm leading-relaxed text-cocoa/65', compact && 'line-clamp-2')}>{product.description}</p> : null}
        <div className={cn('mt-auto flex items-center justify-between gap-3', compact ? 'pt-4' : 'pt-5')}>
          <p className={cn('font-display font-bold text-cocoa', compact ? 'text-lg' : 'text-xl')}>
            {product.currency} {Number(product.price).toFixed(2)}
          </p>
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isAdding}
            className={cn(
              'shrink-0 rounded-full bg-flame py-2 text-sm font-bold text-cream transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0',
              compact ? 'px-3' : 'px-4',
            )}
          >
            {isAdding ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
        {error ? <p role="alert" className="mt-2 text-xs font-semibold text-flame">{error}</p> : null}
      </div>
    </div>
  )
}
