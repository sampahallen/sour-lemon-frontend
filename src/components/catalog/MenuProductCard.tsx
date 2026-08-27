import { Link } from 'react-router'
import type { MenuProduct } from '@/api/catalog'

export function MenuProductCard({ product }: { product: MenuProduct }) {
  const cover = product.images[0]

  return (
    <Link
      to={`/bakery/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-cocoa/10 bg-white transition-transform hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-butter/25">
        {cover ? (
          <img
            src={cover.url}
            alt={cover.altText ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center font-display text-3xl font-bold text-flame/30">
            {product.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="font-display text-xs font-bold uppercase tracking-wide text-flame">{product.category.name}</span>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-cocoa">{product.name}</h2>
        {product.description ? <p className="mt-3 text-sm leading-relaxed text-cocoa/65">{product.description}</p> : null}
        <p className="mt-auto pt-5 font-display text-xl font-bold text-cocoa">
          {product.currency} {Number(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  )
}
