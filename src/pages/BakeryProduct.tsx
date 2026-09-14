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
    return <p className="min-h-screen bg-cream px-6 pb-24 pt-24 text-center font-semibold text-cocoa/55 lg:pt-28">Loading this treat…</p>
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream px-6 pb-24 pt-24 text-center lg:pt-28">
        <h1 className="font-display text-4xl font-bold text-cocoa">This treat could not be found.</h1>
        <p className="mt-4 text-cocoa/60">{error}</p>
        <Button to="/bakery" className="mt-7">Back to the Bakery</Button>
      </div>
    )
  }

  const activeImage = product.images[activeImageIndex] ?? product.images[0]
  const activeImageUrl = activeImage?.url ?? product.coverImageUrl
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
    <article className="min-h-screen bg-cream pb-24 pt-20 lg:pt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Link
          to="/bakery"
          className="inline-flex items-center gap-2 font-display text-sm font-bold text-cocoa/65 transition-colors hover:text-flame focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame"
        >
          <span aria-hidden="true">←</span> Back to the Bakery
        </Link>

        <div className="mt-4 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-16">
          <figure className="min-w-0">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-butter/35 sm:aspect-[5/4] lg:aspect-[4/5]">
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={activeImage?.altText ?? product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-flame/70">Sour Lemon</span>
                  <span className="font-display text-4xl font-extrabold leading-tight text-cocoa/65 sm:text-5xl">{product.name}</span>
                </div>
              )}
            </div>

            {product.images.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Product photos">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show photo ${index + 1} of ${product.name}`}
                    aria-pressed={index === activeImageIndex}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-xl border-2 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame',
                      index === activeImageIndex ? 'border-flame' : 'border-transparent opacity-65 hover:opacity-100',
                    )}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </figure>

          <div className="min-w-0 lg:sticky lg:top-32">
            <Link
              to={`/bakery?category=${product.category.slug}`}
              className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame hover:text-cocoa focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame"
            >
              {product.category.name}
            </Link>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] text-cocoa sm:text-6xl">{product.name}</h1>
            <p className="mt-6 font-display text-3xl font-bold text-cocoa">
              {product.currency} {Number(product.price).toFixed(2)}
            </p>
            {note ? <p className="mt-3 w-fit rounded-full bg-butter/70 px-4 py-2 text-sm font-semibold text-cocoa/75">{note}</p> : null}

            {!isUnavailable ? (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex h-12 items-center gap-1 rounded-full border border-cocoa/20" role="group" aria-label="Quantity">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-cocoa transition-colors hover:text-flame disabled:opacity-35"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-base font-bold" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((previous) => Math.min(99, previous + 1))}
                    disabled={quantity >= 99}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-cocoa transition-colors hover:text-flame disabled:opacity-35"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={isAdding}
                  className="rounded-full bg-flame px-8 py-3 font-display text-base font-bold text-cream shadow-[var(--shadow-chunky)] transition-transform motion-safe:hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isAdding ? 'Adding…' : 'Add to cart'}
                </button>
              </div>
            ) : null}
            {addError ? <p role="alert" className="mt-4 text-sm font-semibold text-flame">{addError}</p> : null}

            {product.description ? (
              <div className="mt-10 border-t border-cocoa/15 pt-7">
                <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">The details</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-cocoa/75">{product.description}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
