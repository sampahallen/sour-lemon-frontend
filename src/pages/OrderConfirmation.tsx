import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import PaystackPop from '@paystack/inline-js'
import { useAuth } from '@/auth/authContext'
import { getOrderReceipt, resumeOrRetryOrderPayment } from '@/api/orders'
import { verifyPayment } from '@/api/payments'
import { submitOrderPaymentProof } from '@/api/manualPayments'
import type { OrderReceipt } from '@/api/orderTypes'
import { getGuestOrderAccessToken } from '@/utils/guestOrderAccess'
import { Button } from '@/components/ui/Button'
import { ManualMomoPayment } from '@/components/payment/ManualMomoPayment'

function money(amount: string, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}

type DisplayState = 'cash' | 'confirmed' | 'paid-awaiting-review' | 'pending' | 'failed' | 'cancelled' | 'manual-pending' | 'manual-review' | 'manual-rejected'

function resolveState(order: OrderReceipt): DisplayState {
  const payment = order.payment

  if (order.status === 'cancelled') return 'cancelled'

  if (payment?.method === 'cash') return 'cash'
  if (payment?.provider === 'manual_momo') {
    if (payment.status === 'paid') return 'confirmed'
    const proof = order.paymentProofs[0]
    return proof?.status === 'submitted' ? 'manual-review' : proof?.status === 'rejected' ? 'manual-rejected' : 'manual-pending'
  }
  if (payment?.status === 'failed') return 'failed'
  if (payment?.status === 'pending' || !payment) return 'pending'
  if (payment.displayStatus === 'needs_review') return 'paid-awaiting-review'
  return 'confirmed'
}

function OrderDetails({ order }: { order: OrderReceipt }) {
  return (
    <>
      <ul className="space-y-3 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="min-w-0 text-cocoa/75">{item.productName} <span className="text-cocoa/50">× {item.quantity}</span></span>
            <span className="shrink-0 font-semibold">{money(item.lineTotal, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 border-t border-cocoa/15 pt-4 text-sm">
        <div className="flex justify-between gap-4"><span className="text-cocoa/65">Subtotal</span><span>{money(order.subtotal, order.currency)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-cocoa/65">Delivery fee</span><span>{money(order.deliveryFee, order.currency)}</span></div>
        <div className="flex justify-between gap-4 border-t border-cocoa/15 pt-3 font-display text-lg font-bold"><span>Total</span><span>{money(order.total, order.currency)}</span></div>
      </div>
      {order.deliveryAddress ? (
        <div className="mt-5 border-t border-cocoa/15 pt-4 text-sm text-cocoa/75">
          <p className="font-semibold text-cocoa">Delivery to {order.deliveryAddress.recipientName}</p>
          <p>{order.deliveryAddress.addressLine1}{order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}</p>
          <p>{order.deliveryAddress.city}</p>
          {order.deliveryAddress.landmark ? <p>Near {order.deliveryAddress.landmark}</p> : null}
          <p>{order.deliveryAddress.phoneNumber}</p>
        </div>
      ) : null}
    </>
  )
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
      const { order: nextOrder } = await getOrderReceipt(orderId, access, signal)
      setOrder(nextOrder)
      setActionError(null)
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
    cancelled: { eyebrow: 'Order cancelled', title: 'This order has been cancelled.', body: 'Contact us on WhatsApp if you need help with this order or its payment.' },
    'manual-pending': { eyebrow: 'Mobile Money payment', title: 'Complete your payment', body: '' },
    'manual-review': { eyebrow: 'Mobile Money payment', title: 'Payment awaiting review', body: '' },
    'manual-rejected': { eyebrow: 'Mobile Money payment', title: 'Proof needs another look', body: '' },
  }

  const copy = state ? stateCopy[state] : stateCopy.pending
  const isManualPayment = state === 'manual-pending' || state === 'manual-review' || state === 'manual-rejected'

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 text-cocoa sm:px-6 sm:pt-12 lg:px-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-olive">{copy.eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 text-sm text-cocoa/60">Order #{order.orderNumber}</p>
        {copy.body ? <p className="mt-4 max-w-xl text-cocoa/75">{copy.body}</p> : null}
      </header>

      <details className="mb-6 rounded-2xl border border-cocoa/15 bg-butter/50 p-4 lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
          <span>Order details · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
          <span className="text-olive">View</span>
        </summary>
        <div className="mt-5 border-t border-cocoa/15 pt-5"><OrderDetails order={order} /></div>
      </details>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {isManualPayment && order.momo ? (
            <ManualMomoPayment
              amount={order.total}
              currency={order.currency}
              momo={order.momo}
              status={state === 'manual-review' ? 'review' : state === 'manual-rejected' ? 'rejected' : 'pending'}
              rejectionReason={order.paymentProofs[0]?.rejectionReason}
              onSubmit={async (reference, file) => {
                const { proof } = await submitOrderPaymentProof(orderId, reference, file, guestAccessToken)
                setOrder((current) => current ? { ...current, paymentProofs: [proof, ...current.paymentProofs] } : current)
                void loadOrder().catch((caught: unknown) => setActionError(caught instanceof Error ? caught.message : 'Could not refresh payment status.'))
              }}
              onRefresh={loadOrder}
            />
          ) : isManualPayment ? (
            <p role="alert" className="rounded-xl border border-flame/20 bg-flame/5 px-4 py-3 text-sm">Payment details are unavailable. Please contact us for help.</p>
          ) : null}

          {actionError ? <p role="alert" className="mt-5 rounded-xl border border-flame/20 bg-flame/5 px-4 py-3 text-sm">{actionError}</p> : null}

          {!isManualPayment ? (
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
                <Button onClick={() => void loadOrder().catch((caught: unknown) => setActionError(caught instanceof Error ? caught.message : 'Could not refresh payment status.'))} variant="outline" accent="cocoa">
                  Refresh status
                </Button>
              ) : null}
            </div>
          ) : null}

          {order.whatsappLink ? (
            <div className="mt-8 border-t border-cocoa/15 pt-6">
              <Button href={order.whatsappLink} variant="outline" accent="olive" className="w-full sm:w-auto">
                Chat with us on WhatsApp
              </Button>
            </div>
          ) : null}

          <Link to="/" className="mt-8 inline-flex text-sm font-semibold text-cocoa/70 hover:text-olive">
            ← Back to home
          </Link>
        </div>

        <aside className="hidden rounded-2xl border border-cocoa/15 bg-butter/50 p-6 lg:sticky lg:top-28 lg:block">
          <h2 className="mb-5 font-display text-xl font-bold">Order details</h2>
          <OrderDetails order={order} />
        </aside>
      </div>
    </section>
  )
}
