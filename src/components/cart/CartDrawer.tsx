import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router'
import { useCart } from '@/cart/cartContext'
import { MenuIcon } from '@/assets/icons/MenuIcon'
import { CartIcon } from '@/assets/icons/CartIcon'
import { cn } from '@/utils/cn'

function money(amount: string, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}

export function CartDrawer() {
  const { cart, isLoading, error, isOpen, closeCart, updateItem, removeItem } = useCart()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, closeCart])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            className="fixed inset-0 z-40 bg-cocoa/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            key="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-md flex-col bg-cream text-cocoa shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b-2 border-cocoa/10 px-6 py-5">
              <h2 id="cart-drawer-title" className="flex items-center gap-2 font-display text-2xl font-bold">
                <CartIcon className="h-6 w-6" />
                Your cart
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close cart"
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-butter/60"
              >
                <MenuIcon open className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {error ? (
                <p role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold">
                  {error}
                </p>
              ) : null}

              {isLoading && cart.items.length === 0 ? (
                <p className="py-16 text-center font-semibold text-cocoa/55">Loading your cart…</p>
              ) : cart.items.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="font-display text-xl font-bold text-cocoa">Your cart is empty.</p>
                  <p className="mt-2 text-sm text-cocoa/60">Add something sweet from the Bakery.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {cart.items.map((item) => (
                    <li key={item.productId} className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-butter/40">
                        {item.coverImageUrl ? (
                          <img src={item.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center font-display text-xs font-bold text-flame/40">
                            {item.name}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-display text-base font-bold leading-tight text-cocoa">{item.name}</p>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => void removeItem(item.productId)}
                            className="shrink-0 text-sm font-bold text-cocoa/40 transition-colors hover:text-flame"
                          >
                            &times;
                          </button>
                        </div>

                        {!item.isActive ? (
                          <p className="mt-1 text-xs font-semibold text-flame">No longer available</p>
                        ) : null}

                        <p className="mt-1 text-sm text-cocoa/60">{money(item.unitPrice, item.currency)} each</p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center gap-1 rounded-full border-2 border-cocoa/15">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                void (item.quantity <= 1
                                  ? removeItem(item.productId)
                                  : updateItem(item.productId, item.quantity - 1))
                              }
                              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-cocoa transition-colors hover:text-flame"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-sm font-bold" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => void updateItem(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 99}
                              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-cocoa transition-colors hover:text-flame disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-display text-base font-bold text-cocoa">
                            {money(item.lineTotal, item.currency)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.items.length > 0 ? (
              <div className="border-t-2 border-cocoa/10 px-6 py-5">
                <div className="flex items-center justify-between font-display text-lg font-bold">
                  <span>Subtotal</span>
                  <span>{money(cart.subtotal, cart.currency)}</span>
                </div>
                <p className="mt-1 text-xs text-cocoa/55">Delivery fees are calculated at checkout.</p>
                <NavLink
                  to="/checkout"
                  onClick={closeCart}
                  className={cn(
                    'mt-4 flex w-full items-center justify-center rounded-full bg-flame px-6 py-3.5 font-display text-lg font-semibold text-cream shadow-[var(--shadow-chunky)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-chunky-sm)]',
                  )}
                >
                  Checkout
                </NavLink>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
