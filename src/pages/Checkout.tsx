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
  'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 px-4 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'

const fulfillmentOptions: { value: FulfillmentType; label: string; description: string }[] = [
  { value: 'sour_lemon_delivery', label: 'Sour Lemon delivery', description: 'We deliver it to you.' },
  { value: 'pickup', label: 'Pickup', description: 'Collect your order from us.' },
  { value: 'customer_rider', label: 'Your own rider', description: 'Send your own rider to pick it up.' },
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
    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-cocoa/60">Total</p>
        <p className="font-display text-lg font-bold text-cocoa sm:text-xl">
          {isQuoting ? 'Calculating…' : quote ? money(quote.quote.total, quote.quote.currency) : '—'}
        </p>
      </div>
      <button
        type="submit"
        form="checkout-form"
        disabled={submitting || isQuoting || !quote}
        className="flex items-center justify-center rounded-full bg-olive px-6 py-3 font-display text-base font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 sm:min-w-40"
      >
        {submitting ? 'Placing…' : 'Place order'}
      </button>
    </div>
  )
}

export function Checkout() {
  const navigate = useNavigate()
  const { session, updateProfile } = useAuth()
  const { cart, isLoading: isCartLoading, refresh: refreshCart } = useCart()

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [paymentName, setPaymentName] = useState(session?.user.name ?? '')
  const [customerNotes, setCustomerNotes] = useState('')

  const [quote, setQuote] = useState<CheckoutQuote | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showFixedPayBand, setShowFixedPayBand] = useState(true)
  const payBandDockRef = useRef<HTMLDivElement>(null)

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
      })
      .catch(() => {})
    return () => controller.abort()
  }, [session])

  useEffect(() => {
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
  }, [fulfillmentType, deliveryAreaId, session?.token])

  useEffect(() => {
    const dock = payBandDockRef.current
    if (!dock) return
    const observer = new IntersectionObserver(([entry]) => {
      const viewportBottom = entry.rootBounds?.bottom ?? window.innerHeight
      setShowFixedPayBand(!entry.isIntersecting && entry.boundingClientRect.top >= viewportBottom)
    }, { threshold: 0.05 })
    observer.observe(dock)
    return () => observer.disconnect()
  }, [isCartLoading, cart.items.length])

  const needsAddress = fulfillmentType === 'sour_lemon_delivery'

  const selectFulfillment = (next: FulfillmentType) => {
    setFulfillmentType(next)
    if (next !== 'pickup' && paymentMethod === 'cash') setPaymentMethod('card')
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
          ...(paymentMethod !== 'cash' ? { paymentName: paymentName.trim() } : {}),
          ...(trimmedEmail ? { customerEmail: trimmedEmail } : {}),
          ...(trimmedWhatsapp ? { whatsappNumber } : {}),
          ...(trimmedNotes ? { customerNotes: trimmedNotes } : {}),
          ...(needsAddress
            ? {
                deliveryAreaId,
                deliveryAddress: {
                  recipientName: recipientName.trim(),
                  phoneNumber: deliveryPhoneNumber || phoneNumber,
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

  if (!isCartLoading && cart.items.length === 0) {
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
    <section className="relative isolate overflow-hidden px-6 pb-20 pt-12 sm:pt-16 lg:px-10 lg:pt-20">
      <div className="absolute -left-24 bottom-10 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />
      <div className="absolute -right-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />

      <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="order-2 overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream p-6 shadow-chunky sm:p-8 lg:order-1 lg:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Checkout</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Let's get this order moving.</h1>

          <form id="checkout-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-cocoa">Your details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="checkout-name" className="mb-2 block text-sm font-bold">Full name</label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className={fieldBaseClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="checkout-phone" className="mb-2 block text-sm font-bold">Phone number</label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="020 123 4567"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                      className={fieldBaseClassName}
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-whatsapp" className="mb-2 block text-sm font-bold">
                      WhatsApp <span className="font-normal">(optional)</span>
                    </label>
                    <input
                      id="checkout-whatsapp"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="020 123 4567"
                      value={whatsappNumber}
                      onChange={(event) => setWhatsappNumber(event.target.value)}
                      onBlur={() => {
                        if (whatsappNumber.trim()) setWhatsappNumber(normalizePhoneNumber(whatsappNumber))
                      }}
                      className={fieldBaseClassName}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-email" className="mb-2 block text-sm font-bold">
                    Email {paymentMethod === 'cash' ? <span className="font-normal">(optional for cash pickup)</span> : null}
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    required={paymentMethod !== 'cash'}
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    className={fieldBaseClassName}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-cocoa">How would you like it?</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fulfillmentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'cursor-pointer rounded-2xl border-2 p-4 transition-colors',
                      fulfillmentType === option.value ? 'border-flame bg-flame/5' : 'border-cocoa/15',
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfillmentType"
                      value={option.value}
                      checked={fulfillmentType === option.value}
                      onChange={() => selectFulfillment(option.value)}
                      className="sr-only"
                    />
                    <p className="font-display text-sm font-bold text-cocoa">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-cocoa/60">{option.description}</p>
                  </label>
                ))}
              </div>

              {needsAddress ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="checkout-area" className="mb-2 block text-sm font-bold">Delivery area</label>
                    <select
                      id="checkout-area"
                      required
                      value={deliveryAreaId}
                      onChange={(event) => {
                        setDeliveryAreaId(event.target.value)
                        setQuote(null)
                        setQuoteError(null)
                        setIsQuoting(Boolean(event.target.value))
                      }}
                      className={fieldBaseClassName}
                    >
                      <option value="">Select an area</option>
                      {deliveryAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-recipient" className="mb-2 block text-sm font-bold">Recipient name</label>
                      <input
                        id="checkout-recipient"
                        type="text"
                        required
                        maxLength={120}
                        value={recipientName}
                        onChange={(event) => setRecipientName(event.target.value)}
                        className={fieldBaseClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-recipient-phone" className="mb-2 block text-sm font-bold">Recipient phone</label>
                      <input
                        id="checkout-recipient-phone"
                        type="tel"
                        inputMode="tel"
                        required
                        placeholder="020 123 4567"
                        value={deliveryPhoneNumber}
                        onChange={(event) => setDeliveryPhoneNumber(event.target.value)}
                        onBlur={() => setDeliveryPhoneNumber(normalizePhoneNumber(deliveryPhoneNumber))}
                        className={fieldBaseClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="checkout-address1" className="mb-2 block text-sm font-bold">Address</label>
                    <input
                      id="checkout-address1"
                      type="text"
                      required
                      maxLength={255}
                      value={addressLine1}
                      onChange={(event) => setAddressLine1(event.target.value)}
                      className={fieldBaseClassName}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="checkout-address2" className="mb-2 block text-sm font-bold">
                        Address line 2 <span className="font-normal">(optional)</span>
                      </label>
                      <input
                        id="checkout-address2"
                        type="text"
                        maxLength={255}
                        value={addressLine2}
                        onChange={(event) => setAddressLine2(event.target.value)}
                        className={fieldBaseClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor="checkout-city" className="mb-2 block text-sm font-bold">City or town</label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        maxLength={120}
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className={fieldBaseClassName}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="checkout-landmark" className="mb-2 block text-sm font-bold">
                      Nearby landmark <span className="font-normal">(optional)</span>
                    </label>
                    <input
                      id="checkout-landmark"
                      type="text"
                      maxLength={255}
                      value={landmark}
                      onChange={(event) => setLandmark(event.target.value)}
                      className={fieldBaseClassName}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-cocoa">Payment method</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(['card', 'momo', 'cash'] as PaymentMethod[])
                  .filter((method) => method !== 'cash' || fulfillmentType === 'pickup')
                  .map((method) => (
                    <label
                      key={method}
                      className={cn(
                        'cursor-pointer rounded-2xl border-2 p-4 text-center transition-colors',
                        paymentMethod === method ? 'border-flame bg-flame/5' : 'border-cocoa/15',
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="sr-only"
                      />
                      <p className="font-display text-sm font-bold capitalize text-cocoa">
                        {method === 'momo' ? 'Mobile Money' : method === 'cash' ? 'Cash on pickup' : 'Card'}
                      </p>
                    </label>
                  ))}
              </div>
              {paymentMethod !== 'cash' ? (
                <div className="mt-4">
                  <label htmlFor="checkout-payment-name" className="mb-2 block text-sm font-bold">
                    Name used for payment
                  </label>
                  <input
                    id="checkout-payment-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={paymentName}
                    onChange={(event) => setPaymentName(event.target.value)}
                    className={fieldBaseClassName}
                  />
                  <p className="mt-1.5 text-xs text-cocoa/55">
                    Enter the name the payment receipt will show.
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <label htmlFor="checkout-notes" className="mb-2 block text-sm font-bold">
                Order notes <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="checkout-notes"
                rows={3}
                maxLength={2000}
                value={customerNotes}
                onChange={(event) => setCustomerNotes(event.target.value)}
                className={cn(fieldBaseClassName, 'resize-none')}
              />
            </div>

            {submitError && (
              <p role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa">
                {submitError}
              </p>
            )}

          </form>
        </div>

        <aside className="order-1 h-fit rounded-[2rem] border-2 border-cocoa bg-butter p-6 shadow-chunky sm:p-8 lg:sticky lg:top-28 lg:order-2">
          <h2 className="font-display text-xl font-bold text-cocoa">Order summary</h2>
          <ul className="mt-5 space-y-3">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-cocoa">
                  {item.name} <span className="text-cocoa/50">× {item.quantity}</span>
                </span>
                <span className="font-bold text-cocoa">{money(item.lineTotal, item.currency)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t-2 border-cocoa/15 pt-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-cocoa/70">Subtotal</span>
              <span className="font-semibold text-cocoa">{money(cart.subtotal, cart.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cocoa/70">Delivery fee</span>
              <span className="font-semibold text-cocoa">
                {isQuoting ? 'Calculating…' : quote ? money(quote.quote.deliveryFee, quote.quote.currency) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t-2 border-dashed border-cocoa/20 pt-3 font-display text-lg font-bold text-cocoa">
              <span>Total</span>
              <span>{isQuoting ? 'Calculating…' : quote ? money(quote.quote.total, quote.quote.currency) : '—'}</span>
            </div>
          </div>

          {fulfillmentType === 'sour_lemon_delivery' && quote?.deliveryFeeMode === 'rider' ? (
            <p className="mt-4 text-xs leading-relaxed text-cocoa/65">
              The delivery rider&apos;s fee is handled separately and is not included in this total.
            </p>
          ) : null}

          {quoteError && (
            <p role="alert" className="mt-4 rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa">
              {quoteError}
            </p>
          )}
        </aside>
      </div>

      <div
        ref={payBandDockRef}
        className="mx-auto mt-8 min-h-[5.25rem] max-w-5xl rounded-2xl border-2 border-cocoa bg-cream px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-chunky sm:px-6"
      >
        {!showFixedPayBand ? <CheckoutActionBand quote={quote} isQuoting={isQuoting} submitting={submitting} /> : null}
      </div>

      {showFixedPayBand ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-cocoa bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(72,48,35,0.08)] backdrop-blur-sm sm:px-6 lg:px-10">
          <CheckoutActionBand quote={quote} isQuoting={isQuoting} submitting={submitting} />
        </div>
      ) : null}
    </section>
  )
}
