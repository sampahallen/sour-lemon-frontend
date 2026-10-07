import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { useCart } from '@/cart/cartContext'
import { getDeliveryAreas, type DeliveryArea } from '@/api/deliveryAreas'
import { getCurrentProfile } from '@/api/profile'
import { quoteCheckout, createCheckout, type CheckoutQuote } from '@/api/checkout'
import type { FulfillmentType, PaymentMethod } from '@/api/orderTypes'
import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { storeGuestOrderAccessToken } from '@/utils/guestOrderAccess'
import { cn } from '@/utils/cn'

const fieldBaseClassName =
  'w-full rounded-xl border border-cocoa/25 bg-white px-4 py-3 text-base text-cocoa outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/15'

const fulfillmentOptions: { value: FulfillmentType; label: string; description: string }[] = [
  { value: 'sour_lemon_delivery', label: 'Delivery', description: 'We bring your order to your address. Your area determines any delivery fee.' },
  { value: 'pickup', label: 'Pickup', description: 'Collect your order from Sour Lemon. We will let you know when it is ready.' },
  { value: 'customer_rider', label: 'My rider', description: 'Send your own rider to collect the order. You arrange and pay the rider directly.' },
]

function money(amount: string, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}

function CheckoutActionBand({
  quote,
  isQuoting,
  submitting,
}: {
  quote: CheckoutQuote | null
  isQuoting: boolean
  submitting: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-cocoa/60">Total</p>
        <p className="font-display text-lg font-bold text-cocoa sm:text-xl">
          {isQuoting ? 'Calculating…' : quote ? money(quote.quote.total, quote.quote.currency) : '—'}
        </p>
      </div>
      <button
        type="submit"
        form="checkout-form"
        disabled={submitting || isQuoting || !quote}
        className="flex min-w-36 items-center justify-center rounded-full bg-olive px-6 py-3 font-display text-base font-semibold text-cream transition hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? 'Placing…' : 'Place order'}
      </button>
    </div>
  )
}

function OrderBreakdown({
  cart,
  quote,
  isQuoting,
  riderFeeSeparate,
  quoteError,
}: {
  cart: ReturnType<typeof useCart>['cart']
  quote: CheckoutQuote | null
  isQuoting: boolean
  riderFeeSeparate: boolean
  quoteError: string | null
}) {
  return (
    <>
      <ul className="space-y-3 text-sm">
        {cart.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4">
            <span className="text-cocoa/75">{item.name} <span className="text-cocoa/50">× {item.quantity}</span></span>
            <span className="font-semibold text-cocoa">{money(item.lineTotal, item.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-cocoa/15 pt-4 text-sm">
        <div className="flex justify-between"><span className="text-cocoa/65">Subtotal</span><span>{money(cart.subtotal, cart.currency)}</span></div>
        <div className="flex justify-between"><span className="text-cocoa/65">Delivery fee</span><span>{isQuoting ? 'Calculating…' : quote ? money(quote.quote.deliveryFee, quote.quote.currency) : '—'}</span></div>
        <div className="flex justify-between border-t border-cocoa/15 pt-3 font-display text-lg font-bold"><span>Total</span><span>{isQuoting ? 'Calculating…' : quote ? money(quote.quote.total, quote.quote.currency) : '—'}</span></div>
      </div>
      {riderFeeSeparate ? <p className="mt-4 text-xs leading-relaxed text-cocoa/65">The rider fee is paid separately and is not included in this total.</p> : null}
      {quoteError ? <p role="alert" className="mt-4 text-sm text-flame">{quoteError}</p> : null}
    </>
  )
}

export function Checkout() {
  const navigate = useNavigate()
  const { session, updateProfile } = useAuth()
  const { cart, isLoading: isCartLoading, error: cartError, refresh: refreshCart } = useCart()

  const [customerName, setCustomerName] = useState(session?.user.name ?? '')
  const [customerEmail, setCustomerEmail] = useState(session?.user.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(session?.user.phoneNumber ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(session?.user.whatsappNumber ?? '')
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup')
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([])
  const [deliveryAreaId, setDeliveryAreaId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [deliveryPhoneNumber, setDeliveryPhoneNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [landmark, setLandmark] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo')
  const [paymentName, setPaymentName] = useState(session?.user.name ?? '')
  const [customerNotes, setCustomerNotes] = useState('')
  const [showRecipientFields, setShowRecipientFields] = useState(false)
  const [showPaymentNameField, setShowPaymentNameField] = useState(false)

  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const additionalDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getDeliveryAreas(controller.signal)
      .then(({ deliveryAreas }) => setDeliveryAreas(deliveryAreas))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    void getCurrentProfile(session.token, controller.signal)
      .then(({ defaultAddress }) => {
        if (!defaultAddress) return
        setDeliveryAreaId(defaultAddress.deliveryAreaId ?? '')
        setRecipientName(defaultAddress.recipientName)
        setDeliveryPhoneNumber(defaultAddress.phoneNumber)
        setAddressLine1(defaultAddress.addressLine1)
        setAddressLine2(defaultAddress.addressLine2 ?? '')
        setCity(defaultAddress.city)
        setLandmark(defaultAddress.landmark ?? '')
        setShowRecipientFields(
          defaultAddress.recipientName !== session.user.name ||
          normalizePhoneNumber(defaultAddress.phoneNumber) !== normalizePhoneNumber(session.user.phoneNumber ?? ''),
        )
      })
      .catch(() => {})
    return () => controller.abort()
  }, [session])

  useEffect(() => {
    if (isCartLoading || cart.items.length === 0) return
    if (fulfillmentType === 'sour_lemon_delivery' && !deliveryAreaId) {
      return
    }

    const controller = new AbortController()
    void quoteCheckout(
      {
        fulfillmentType,
        deliveryAreaId: fulfillmentType === 'sour_lemon_delivery' ? deliveryAreaId : null,
      },
      session?.token,
      controller.signal,
    )
      .then((result) => setQuote(result))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setQuoteError(caught instanceof Error ? caught.message : 'We could not calculate your total.')
          setQuote(null)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsQuoting(false)
      })
    return () => controller.abort()
  }, [fulfillmentType, deliveryAreaId, session?.token, isCartLoading, cart.items.length])

  const needsAddress = fulfillmentType === 'sour_lemon_delivery'

  const selectFulfillment = (next: FulfillmentType) => {
    setFulfillmentType(next)
    if (next !== 'pickup' && paymentMethod === 'cash') setPaymentMethod('momo')
    if (next === 'sour_lemon_delivery' && !deliveryAreaId) {
      setQuote(null)
      setIsQuoting(false)
    } else {
      setIsQuoting(true)
    }
    setQuoteError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    if (!quote) {
      setSubmitError('Please wait for your total to be calculated.')
      return
    }

    setSubmitting(true)

    try {
      const trimmedEmail = customerEmail.trim()
      const trimmedWhatsapp = whatsappNumber.trim()
      const trimmedNotes = customerNotes.trim()

      if (session && trimmedEmail && trimmedEmail !== session.user.email) {
        await updateProfile({ email: trimmedEmail })
      }

      const result = await createCheckout(
        {
          customerName: customerName.trim(),
          phoneNumber,
          fulfillmentType,
          paymentMethod,
          ...(paymentMethod !== 'cash' ? { paymentName: (showPaymentNameField ? paymentName : customerName).trim() } : {}),
          ...(trimmedEmail ? { customerEmail: trimmedEmail } : {}),
          ...(trimmedWhatsapp ? { whatsappNumber } : {}),
          ...(trimmedNotes ? { customerNotes: trimmedNotes } : {}),
          ...(needsAddress
            ? {
                deliveryAreaId,
                deliveryAddress: {
                  recipientName: (showRecipientFields ? recipientName : customerName).trim(),
                  phoneNumber: showRecipientFields ? deliveryPhoneNumber : phoneNumber,
                  addressLine1: addressLine1.trim(),
                  city: city.trim(),
                  ...(addressLine2.trim() ? { addressLine2: addressLine2.trim() } : {}),
                  ...(landmark.trim() ? { landmark: landmark.trim() } : {}),
                },
              }
            : {}),
        },
        session?.token,
      )

      if (result.guestAccessToken) {
        storeGuestOrderAccessToken(result.order.id, result.guestAccessToken)
      }

      await refreshCart()
      await navigate(`/order-confirmation/${result.order.id}`, { replace: true })
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : 'We could not place your order.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0 && isCartLoading) {
    return <section className="mx-auto max-w-5xl px-6 py-16 text-center text-cocoa/65">Loading your cart…</section>
  }

  if (cart.items.length === 0 && cartError) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">We could not load your cart</h1>
        <p role="alert" className="mt-2 text-sm text-cocoa/65">{cartError}</p>
        <button type="button" onClick={() => void refreshCart()} className="mt-6 rounded-full bg-olive px-6 py-3 font-semibold text-cream">Try again</button>
      </section>
    )
  }

  if (cart.items.length === 0) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border-2 border-cocoa bg-butter p-8 text-center shadow-chunky">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Your cart is empty</p>
          <h1 className="mt-2 text-3xl font-bold">Add something sweet first.</h1>
          <Link
            to="/bakery"
            className="mt-6 inline-flex rounded-full bg-cocoa px-6 py-3 font-bold text-cream transition-transform hover:-translate-y-0.5"
          >
            Browse the Bakery
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-32 pt-8 text-cocoa sm:px-6 sm:pt-12 lg:px-10 lg:pb-16">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-olive">Checkout</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Complete your order</h1>
      </header>

      <details className="mb-6 rounded-2xl border border-cocoa/15 bg-butter/50 p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
          <span>Order summary <span className="font-normal text-cocoa/55">· {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</span></span>
          <span className="text-sm font-medium text-olive">View details</span>
        </summary>
        <div className="mt-5 border-t border-cocoa/15 pt-5">
          <OrderBreakdown cart={cart} quote={quote} isQuoting={isQuoting} riderFeeSeparate={fulfillmentType === 'sour_lemon_delivery' && quote?.deliveryFeeMode === 'rider'} quoteError={null} />
        </div>
      </details>
      {quoteError ? <p role="alert" className="mb-6 text-sm font-medium text-flame lg:hidden">{quoteError}</p> : null}

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form id="checkout-form" onSubmit={handleSubmit} className="min-w-0 space-y-8">
          <section aria-labelledby="checkout-contact-heading">
            <h2 id="checkout-contact-heading" className="font-display text-xl font-bold">Contact</h2>
            <p className="mt-1 text-sm text-cocoa/60">How we can reach you about your order.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-name" className="mb-2 block text-sm font-semibold">Full name</label>
                <input id="checkout-name" type="text" autoComplete="name" required minLength={2} maxLength={120} value={customerName} onChange={(event) => setCustomerName(event.target.value)} className={fieldBaseClassName} />
              </div>
              <div>
                <label htmlFor="checkout-phone" className="mb-2 block text-sm font-semibold">Phone number</label>
                <input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="020 123 4567" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))} className={fieldBaseClassName} />
              </div>
            </div>
          </section>

          <section aria-labelledby="checkout-fulfillment-heading" className="border-t border-cocoa/15 pt-8">
            <h2 id="checkout-fulfillment-heading" className="font-display text-xl font-bold">How would you like it?</h2>
            <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Fulfillment method">
              {fulfillmentOptions.map((option) => (
                <label key={option.value} className={cn('flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 py-3 text-center text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-olive/30', fulfillmentType === option.value ? 'border-olive bg-olive/10 text-olive' : 'border-cocoa/20 bg-white hover:border-cocoa/40')}>
                  <input type="radio" name="fulfillmentType" value={option.value} checked={fulfillmentType === option.value} onChange={() => selectFulfillment(option.value)} className="sr-only" />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="mt-3 rounded-xl border border-olive/15 bg-olive/5 px-4 py-3 text-sm leading-relaxed text-cocoa/75">
              {fulfillmentOptions.find((option) => option.value === fulfillmentType)?.description}
            </p>
            {needsAddress ? (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="checkout-area" className="mb-2 block text-sm font-semibold">Delivery area</label>
                  <select id="checkout-area" required value={deliveryAreaId} onChange={(event) => { setDeliveryAreaId(event.target.value); setQuote(null); setQuoteError(null); setIsQuoting(Boolean(event.target.value)) }} className={fieldBaseClassName}>
                    <option value="">Select an area</option>
                    {deliveryAreas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="checkout-address1" className="mb-2 block text-sm font-semibold">Delivery address</label>
                  <input id="checkout-address1" type="text" required maxLength={255} autoComplete="street-address" value={addressLine1} onChange={(event) => setAddressLine1(event.target.value)} className={fieldBaseClassName} />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="mb-2 block text-sm font-semibold">City or town</label>
                  <input id="checkout-city" type="text" required maxLength={120} autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} className={fieldBaseClassName} />
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold text-olive">Add address details</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-address2" className="mb-2 block font-semibold">Address line 2</label>
                      <input id="checkout-address2" type="text" maxLength={255} value={addressLine2} onChange={(event) => setAddressLine2(event.target.value)} className={fieldBaseClassName} />
                    </div>
                    <div>
                      <label htmlFor="checkout-landmark" className="mb-2 block font-semibold">Nearby landmark</label>
                      <input id="checkout-landmark" type="text" maxLength={255} value={landmark} onChange={(event) => setLandmark(event.target.value)} className={fieldBaseClassName} />
                    </div>
                  </div>
                </details>
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <input type="checkbox" checked={showRecipientFields} onChange={(event) => { setShowRecipientFields(event.target.checked); if (event.target.checked) { if (!recipientName) setRecipientName(customerName); if (!deliveryPhoneNumber) setDeliveryPhoneNumber(phoneNumber) } }} className="size-4 accent-olive" />
                  Someone else is receiving this order
                </label>
                {showRecipientFields ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-recipient" className="mb-2 block text-sm font-semibold">Recipient name</label>
                      <input id="checkout-recipient" type="text" required maxLength={120} value={recipientName} onChange={(event) => setRecipientName(event.target.value)} className={fieldBaseClassName} />
                    </div>
                    <div>
                      <label htmlFor="checkout-recipient-phone" className="mb-2 block text-sm font-semibold">Recipient phone</label>
                      <input id="checkout-recipient-phone" type="tel" inputMode="tel" required placeholder="020 123 4567" value={deliveryPhoneNumber} onChange={(event) => setDeliveryPhoneNumber(event.target.value)} onBlur={() => setDeliveryPhoneNumber(normalizePhoneNumber(deliveryPhoneNumber))} className={fieldBaseClassName} />
                    </div>
                  </div>
                ) : null}
                {quote?.deliveryFeeMode === 'rider' ? <p className="text-sm text-cocoa/65">The rider fee is paid separately.</p> : null}
              </div>
            ) : null}
          </section>

          <section aria-labelledby="checkout-payment-heading" className="border-t border-cocoa/15 pt-8">
            <h2 id="checkout-payment-heading" className="font-display text-xl font-bold">Payment</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2" role="group" aria-label="Payment method">
              {(['momo', 'cash'] as PaymentMethod[]).filter((method) => method !== 'cash' || fulfillmentType === 'pickup').map((method) => (
                <label key={method} className={cn('flex min-h-12 cursor-pointer items-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-olive/30', paymentMethod === method ? 'border-olive bg-olive/10 text-olive' : 'border-cocoa/20 bg-white hover:border-cocoa/40')}>
                  <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="sr-only" />
                  {method === 'momo' ? 'Mobile Money transfer' : 'Cash on pickup'}
                </label>
              ))}
            </div>
            {paymentMethod === 'momo' ? (
              <div className="mt-4 text-sm">
                <p className="text-cocoa/65">Transfer instructions appear after you place the order.</p>
                {showPaymentNameField ? (
                  <div className="mt-4">
                    <label htmlFor="checkout-payment-name" className="mb-2 block font-semibold">Name on the payment receipt</label>
                    <input id="checkout-payment-name" type="text" required maxLength={120} autoComplete="name" value={paymentName} onChange={(event) => setPaymentName(event.target.value)} className={fieldBaseClassName} />
                  </div>
                ) : (
                  <button type="button" onClick={() => { setPaymentName(customerName); setShowPaymentNameField(true) }} className="mt-3 font-semibold text-olive underline underline-offset-4">Paying from a different name?</button>
                )}
              </div>
            ) : null}
          </section>

          <details ref={additionalDetailsRef} className="border-t border-cocoa/15 pt-8">
            <summary className="cursor-pointer font-display text-lg font-bold">Additional details <span className="font-sans text-sm font-normal text-cocoa/55">(optional)</span></summary>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="checkout-whatsapp" className="mb-2 block text-sm font-semibold">WhatsApp number</label>
                <input id="checkout-whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="020 123 4567" value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} onBlur={() => { if (whatsappNumber.trim()) setWhatsappNumber(normalizePhoneNumber(whatsappNumber)) }} className={fieldBaseClassName} />
              </div>
              <div>
                <label htmlFor="checkout-email" className="mb-2 block text-sm font-semibold">Email</label>
                <input id="checkout-email" type="email" autoComplete="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} onInvalid={() => { if (additionalDetailsRef.current) additionalDetailsRef.current.open = true }} className={fieldBaseClassName} />
              </div>
              <div>
                <label htmlFor="checkout-notes" className="mb-2 block text-sm font-semibold">Order notes</label>
                <textarea id="checkout-notes" rows={3} maxLength={2000} value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} className={cn(fieldBaseClassName, 'resize-y')} />
              </div>
            </div>
          </details>

          {submitError ? <p role="alert" className="rounded-xl bg-flame/10 px-4 py-3 text-sm font-semibold text-flame">{submitError}</p> : null}
          <div className="hidden border-t border-cocoa/15 pt-6 lg:block">
            <CheckoutActionBand quote={quote} isQuoting={isQuoting} submitting={submitting} />
          </div>
        </form>

        <aside className="hidden rounded-2xl border border-cocoa/15 bg-butter/50 p-6 lg:sticky lg:top-28 lg:block">
          <h2 className="mb-5 font-display text-xl font-bold">Order summary</h2>
          <OrderBreakdown cart={cart} quote={quote} isQuoting={isQuoting} riderFeeSeparate={fulfillmentType === 'sour_lemon_delivery' && quote?.deliveryFeeMode === 'rider'} quoteError={quoteError} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cocoa/15 bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(72,48,35,0.08)] backdrop-blur-sm sm:px-6 lg:hidden">
        <CheckoutActionBand quote={quote} isQuoting={isQuoting} submitting={submitting} />
      </div>
    </section>
  )
}
