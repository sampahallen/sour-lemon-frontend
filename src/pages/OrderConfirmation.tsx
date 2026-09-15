import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import PaystackPop from '@paystack/inline-js'
import { useAuth } from '@/auth/authContext'
import { getOrderReceipt, resumeOrRetryOrderPayment } from '@/api/orders'
import { verifyPayment } from '@/api/payments'
import type { OrderReceipt } from '@/api/orderTypes'
import { getGuestOrderAccessToken } from '@/utils/guestOrderAccess'
import { Button } from '@/components/ui/Button'

function money(amount: string, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}

type DisplayState = 'cash' | 'confirmed' | 'paid-awaiting-review' | 'pending' | 'failed'

function resolveState(order: OrderReceipt): DisplayState {
  const payment = order.payment

  if (payment?.method === 'cash') return 'cash'
  if (payment?.status === 'failed') return 'failed'
  if (payment?.status === 'pending' || !payment) return 'pending'
  if (payment.displayStatus === 'needs_review') return 'paid-awaiting-review'
  if (order.status === 'cancelled') return 'failed'
  return 'confirmed'
}

export function OrderConfirmation() {
  const { orderId = '' } = useParams()
  const { session } = useAuth()
  const guestAccessToken = getGuestOrderAccessToken(orderId)
  const access = { token: session?.token, guestAccessToken }

  const [order, setOrder] = useState<OrderReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const hasAutoResumed = useRef(false)

  const loadOrder = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const { order: nextOrder } = await getOrderReceipt(orderId, access, signal)
        setOrder(nextOrder)
        setLoadError(null)
      } catch (caught) {
        if (!signal?.aborted) {
          setLoadError(caught instanceof Error ? caught.message : 'We could not find this order.')
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderId, session?.token, guestAccessToken],
  )

  useEffect(() => {
    const controller = new AbortController()
    void getOrderReceipt(orderId, access, controller.signal)
      .then(({ order: nextOrder }) => {
        setOrder(nextOrder)
        setLoadError(null)
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(caught instanceof Error ? caught.message : 'We could not find this order.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, session?.token, guestAccessToken])

  const openPaystackPopup = useCallback(
    (accessCode: string, paymentId: string) => {
      setActionError(null)
      setIsProcessingPayment(true)
      const reconcilePayment = (fallbackError?: string) => {
        void verifyPayment(paymentId, access)
          .then(({ order: verifiedOrder }) => {
            setOrder(verifiedOrder)
            if (fallbackError && verifiedOrder.payment?.status !== 'paid') {
              setActionError(fallbackError)
            }
          })
          .catch((caught: unknown) => {
            setActionError(caught instanceof Error ? caught.message : fallbackError ?? 'We could not check your payment status.')
          })
          .finally(() => setIsProcessingPayment(false))
      }
      const popup = new PaystackPop()
      popup.resumeTransaction(accessCode, {
        onSuccess: () => {
          reconcilePayment('We could not verify your payment.')
        },
        onCancel: () => {
          reconcilePayment()
        },
        onError: (paystackError) => {
          reconcilePayment(paystackError.message || 'Payment failed. Please try again.')
        },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.token, guestAccessToken],
  )

  const handleResume = () => {
    if (!order?.payment?.accessCode) return
    openPaystackPopup(order.payment.accessCode, order.payment.id)
  }

  const handleRetry = async () => {
    setActionError(null)
    setIsProcessingPayment(true)
    try {
      const { payment } = await resumeOrRetryOrderPayment(orderId, access)
      if (payment.accessCode) {
        openPaystackPopup(payment.accessCode, payment.id)
      } else {
        setIsProcessingPayment(false)
        await loadOrder()
      }
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'We could not restart your payment.')
      setIsProcessingPayment(false)
    }
  }

  const state = order ? resolveState(order) : null

  useEffect(() => {
    if (!hasAutoResumed.current && state === 'pending' && order?.payment?.accessCode) {
      hasAutoResumed.current = true
      const timeout = window.setTimeout(() => {
        openPaystackPopup(order.payment!.accessCode!, order.payment!.id)
      }, 0)
      return () => window.clearTimeout(timeout)
    }
  }, [state, order, openPaystackPopup])

  if (isLoading) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <p className="font-semibold text-cocoa/55">Loading your order…</p>
      </section>
    )
  }

  if (loadError || !order) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border-2 border-cocoa bg-butter p-8 text-center shadow-chunky">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-flame">Order not found</p>
          <h1 className="mt-2 text-3xl font-bold">{loadError ?? 'We could not find this order.'}</h1>
          <Button to="/bakery" className="mt-6">Back to the Bakery</Button>
        </div>
      </section>
    )
  }

  const stateCopy: Record<DisplayState, { eyebrow: string; title: string; body: string }> = {
    cash: {
      eyebrow: 'Cash on pickup',
      title: 'Order placed — pay when you collect it.',
      body: 'Have the total ready in cash when you pick up your order.',
    },
    confirmed: {
      eyebrow: 'Order confirmed',
      title: 'You\'re all set!',
      body: 'We\'ve got your order and payment. We\'ll be in touch with updates.',
    },
    'paid-awaiting-review': {
      eyebrow: 'Payment received',
      title: 'Your payment is being confirmed.',
      body: 'This usually takes a moment. Refresh to check for the latest status.',
    },
    pending: {
      eyebrow: 'Payment pending',
      title: 'Almost there — finish your payment.',
      body: 'Your order is saved. Resume the payment popup to complete it.',
    },
    failed: {
      eyebrow: 'Payment failed',
      title: 'Your payment did not go through.',
      body: 'No charge was made. You can retry the payment below.',
    },
  }

  const copy = state ? stateCopy[state] : stateCopy.pending

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />
      <div className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />

      <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream p-8 shadow-chunky sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 text-cocoa/80">{copy.body}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-butter px-4 py-2 text-sm font-bold text-cocoa">
            Order #{order.orderNumber}
          </span>
          <span className="rounded-full bg-butter px-4 py-2 text-sm font-bold text-cocoa">
            {money(order.total, order.currency)}
          </span>
        </div>

        {actionError && (
          <p role="alert" className="mt-5 rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa">
            {actionError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {state === 'pending' && order.payment?.accessCode ? (
            <Button onClick={handleResume} disabled={isProcessingPayment} accent="flame">
              {isProcessingPayment ? 'Opening payment…' : 'Resume payment'}
            </Button>
          ) : null}

          {state === 'failed' ? (
            <Button onClick={() => void handleRetry()} disabled={isProcessingPayment} accent="flame">
              {isProcessingPayment ? 'Opening payment…' : 'Retry payment'}
            </Button>
          ) : null}

          {state === 'paid-awaiting-review' ? (
            <Button onClick={() => void loadOrder()} variant="outline" accent="cocoa">
              Refresh status
            </Button>
          ) : null}

          {order.whatsappLink ? (
            <Button href={order.whatsappLink} variant="outline" accent="olive">
              Chat with us on WhatsApp
            </Button>
          ) : null}
        </div>

        <div className="mt-10 border-t-2 border-cocoa/10 pt-8">
          <h2 className="font-display text-xl font-bold text-cocoa">Order details</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-cocoa">
                  {item.productName} <span className="text-cocoa/50">× {item.quantity}</span>
                </span>
                <span className="font-bold text-cocoa">{money(item.lineTotal, order.currency)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t-2 border-dashed border-cocoa/15 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-cocoa/70">Subtotal</span>
              <span className="font-semibold text-cocoa">{money(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cocoa/70">Delivery fee</span>
              <span className="font-semibold text-cocoa">{money(order.deliveryFee, order.currency)}</span>
            </div>
            <div className="flex items-center justify-between font-display text-lg font-bold text-cocoa">
              <span>Total</span>
              <span>{money(order.total, order.currency)}</span>
            </div>
          </div>

          {order.deliveryAddress ? (
            <div className="mt-6 rounded-2xl bg-butter/50 p-4 text-sm text-cocoa">
              <p className="font-bold">{order.deliveryAddress.recipientName}</p>
              <p>{order.deliveryAddress.phoneNumber}</p>
              <p>
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
              </p>
              <p>{order.deliveryAddress.city}</p>
              {order.deliveryAddress.landmark ? <p>Near {order.deliveryAddress.landmark}</p> : null}
            </div>
          ) : null}
        </div>

        <Link to="/" className="mt-8 inline-flex text-sm font-bold text-cocoa hover:text-flame">
          ← Back to home
        </Link>
      </div>
    </section>
  )
}
