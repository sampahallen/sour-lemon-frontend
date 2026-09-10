import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { getMenuProduct, type MenuProduct } from '@/api/catalog'
import { useCart } from '@/cart/cartContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

function availabilityNote(product: MenuProduct): string | null {
  const now = new Date()
  if (product.availableUntil && new Date(product.availableUntil) <= now) return 'No longer available'
  if (product.availableFrom && new Date(product.availableFrom) > now) {
    const date = new Date(product.availableFrom)
    return `Available from ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}`
  }
  return null
}

export function BakeryProduct() {
  const { slug = '' } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<MenuProduct | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getMenuProduct(slug, controller.signal)
      .then(({ product }) => {
        setProduct(product)
        setActiveImageIndex(0)
        setQuantity(1)
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Could not load this treat.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [slug])

  if (isLoading) {
    return <p className="min-h-screen bg-cream px-6 pb-24 pt-40 text-center font-semibold text-cocoa/55">Loading this treat…</p>
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream px-6 pb-24 pt-40 text-center">
        <h1 className="font-display text-4xl font-bold text-cocoa">This treat could not be found.</h1>
        <p className="mt-4 text-cocoa/60">{error}</p>
        <Button to="/bakery" className="mt-7">Back to the Bakery</Button>
      </div>
    )
  }

  const activeImage = product.images[activeImageIndex] ?? product.images[0]
  const note = availabilityNote(product)
  const isUnavailable = note !== null

  const handleAddToCart = async () => {
    setIsAdding(true)
    setAddError(null)
    try {
      await addItem(product.id, quantity)
    } catch (caught) {
      setAddError(caught instanceof Error ? caught.message : 'We could not add that to your cart.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="min-h-screen bg-cream pb-24 pt-32">
      <header className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Link
          to={`/bakery?category=${product.category.slug}`}
          className="font-display text-sm font-bold uppercase tracking-[0.16em] text-flame"
        >
          {product.category.name}
        </Link>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-cocoa sm:text-6xl">{product.name}</h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 text-lg font-semibold">
          <span className="font-display text-2xl font-bold text-cocoa">
            {product.currency} {Number(product.price).toFixed(2)}
          </span>
          {note ? (
            <>
              <span aria-hidden="true" className="text-cocoa/40">·</span>
              <span className="text-sm font-semibold text-cocoa/50">{note}</span>
            </>
          ) : null}
        </div>

        {isUnavailable ? null : (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1 rounded-full border-2 border-cocoa/15">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="flex h-10 w-10 items-center justify-center text-lg font-bold text-cocoa transition-colors hover:text-flame"
              >
                −
              </button>
              <span className="min-w-8 text-center text-base font-bold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                disabled={quantity >= 99}
                className="flex h-10 w-10 items-center justify-center text-lg font-bold text-cocoa transition-colors hover:text-flame disabled:cursor-not-allowed disabled:opacity-35"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={isAdding}
              className="rounded-full bg-flame px-7 py-3 font-display text-base font-semibold text-cream shadow-[var(--shadow-chunky)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-chunky-sm)] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isAdding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        )}

        {addError ? (
          <p role="alert" className="mt-3 text-center text-sm font-semibold text-flame">
            {addError}
          </p>
        ) : null}
      </header>

      <figure className="mx-auto mt-12 max-w-6xl px-6 lg:px-10">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-butter/25 sm:aspect-[16/9]">
          {activeImage ? (
            <img src={activeImage.url} alt={activeImage.altText ?? product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center font-display text-4xl font-bold text-flame/30">
              {product.name}
            </div>
          )}
        </div>

        {product.images.length > 1 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-3" aria-label="Product photos">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Show photo ${index + 1} of ${product.name}`}
                aria-current={index === activeImageIndex}
                className={cn(
                  'h-16 w-16 overflow-hidden rounded-2xl border-2 transition-colors',
                  index === activeImageIndex ? 'border-flame' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </figure>

      <div className="mx-auto mt-12 max-w-3xl px-6 lg:px-10">
        {product.description ? (
          <p className="whitespace-pre-line text-lg leading-8 text-cocoa/80">{product.description}</p>
        ) : null}

        <div className="mt-16 border-t-2 border-cocoa/10 pt-8">
          <Button to="/bakery" variant="outline" accent="cocoa">Back to the Bakery</Button>
        </div>
      </div>
    </article>
  )
}
