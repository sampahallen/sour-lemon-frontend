import { useCallback, useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { getCustomerOrders } from '@/api/orders'
import type { CustomerOrderScope, CustomerOrderSummary, OrderStatus, Pagination } from '@/api/orderTypes'
import { Button } from '@/components/ui/Button'
import { CakeSlice } from '@/assets/stickers/CakeSlice'

const statusCopy: Record<OrderStatus, string> = {
  received: 'Order received',
  pending_payment: 'Payment pending',
  confirmed: 'Confirmed',
  preparing: 'Being prepared',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusClasses: Record<OrderStatus, string> = {
  received: 'bg-butter text-cocoa',
  pending_payment: 'bg-flame/15 text-flame',
  confirmed: 'bg-olive/15 text-olive',
  preparing: 'bg-butter text-cocoa',
  ready_for_pickup: 'bg-olive text-cream',
  out_for_delivery: 'bg-olive text-cream',
  completed: 'bg-cocoa/10 text-cocoa/70',
  cancelled: 'bg-flame/10 text-flame',
}

const fulfillmentCopy = {
  pickup: 'Pickup',
  customer_rider: 'Your rider',
  sour_lemon_delivery: 'Sour Lemon delivery',
} as const

const paymentAttention = new Set(['waiting_for_payment', 'failed'])

function money(amount: string, currency: string) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(Number(amount))
}

function orderDate(order: CustomerOrderSummary) {
  return new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(
    new Date(order.placedAt ?? order.createdAt),
  )
}

function OrderCard({ order }: { order: CustomerOrderSummary }) {
  const needsPayment = order.status !== 'completed' && order.status !== 'cancelled' &&
    paymentAttention.has(order.paymentDisplayStatus)
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border-2 border-cocoa bg-cream p-5 shadow-chunky sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cocoa/55">Order #{order.orderNumber}</p>
          <p className="mt-1 text-sm font-semibold text-cocoa/70">{orderDate(order)}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClasses[order.status]}`}>
          {statusCopy[order.status]}
        </span>
      </div>

      <div className="mt-5 flex -space-x-3">
        {order.itemPreview.map((item) => (
          <div
            key={item.id}
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-cream bg-butter text-center text-[10px] font-bold text-cocoa"
            title={`${item.quantity} x ${item.productName}`}
          >
            {item.productImageUrl ? (
              <img src={item.productImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="px-1">{item.productName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-xl font-bold text-cocoa">{money(order.total, order.currency)}</p>
          <p className="mt-1 text-sm text-cocoa/65">
            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {fulfillmentCopy[order.fulfillmentType]}
          </p>
        </div>
        {needsPayment ? (
          <span className="shrink-0 rounded-full bg-flame px-3 py-1.5 text-xs font-bold text-cream">
            Payment needed
          </span>
        ) : null}
      </div>

      <Button
        to={`/order-confirmation/${order.id}`}
        variant={needsPayment ? 'primary' : 'outline'}
        accent="cocoa"
        className="mt-6 w-full shadow-none"
      >
        {needsPayment ? 'Complete payment' : 'View order'}
      </Button>
    </article>
  )
}

export function Orders() {
  const { session } = useAuth()
  const token = session?.token
  const [searchParams, setSearchParams] = useSearchParams()
  const scope: CustomerOrderScope = searchParams.get('scope') === 'history' ? 'history' : 'active'
  const requestedPage = Number(searchParams.get('page'))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const queryKey = `${session?.user.id ?? ''}:${scope}:${page}`
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const retry = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadKey((current) => current + 1)
  }, [])

  const changePage = (nextPage: number) => {
    setIsLoading(true)
    setError(null)
    setSearchParams({ scope, page: String(nextPage) })
  }

  const changeScope = (nextScope: CustomerOrderScope) => {
    if (nextScope === scope) return
    setIsLoading(true)
    setError(null)
    setSearchParams({ scope: nextScope })
  }

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    void getCustomerOrders(token, scope, page, controller.signal)
      .then((result) => {
        setOrders(result.orders)
        setPagination(result.pagination)
        setLoadedQuery(queryKey)
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'We could not load your orders.')
          setLoadedQuery(queryKey)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [page, queryKey, reloadKey, scope, token])

  if (!session) return <Navigate to="/signin" replace />

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />
      <div className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Your orders</p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Your orders, at a glance.</h1>
            <p className="mt-3 max-w-xl text-cocoa/75">Follow each order, finish a pending payment, or open the full details.</p>
          </div>
          {loadedQuery === queryKey && !error && pagination?.total ? (
            <p className="rounded-full bg-butter px-4 py-2 text-sm font-bold text-cocoa">
              {pagination.total} {scope === 'active' ? 'current' : 'past'} {pagination.total === 1 ? 'order' : 'orders'}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border-2 border-cocoa bg-cream p-1" aria-label="Order views">
            {(['active', 'history'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => changeScope(view)}
                aria-pressed={scope === view}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${scope === view ? 'bg-cocoa text-cream' : 'text-cocoa hover:bg-butter'}`}
              >
                {view === 'active' ? 'Current orders' : 'Order history'}
              </button>
            ))}
          </div>
          <Button variant="outline" accent="cocoa" onClick={retry} disabled={isLoading} className="shadow-none">
            Refresh orders
          </Button>
        </div>

        {isLoading || loadedQuery !== queryKey ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading orders">
            {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-[1.75rem] bg-butter/60" />)}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-[2rem] border-2 border-flame bg-cream p-8 text-center shadow-chunky">
            <p role="alert" className="font-semibold text-cocoa">{error}</p>
            <Button onClick={retry} className="mt-5">Try again</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[2rem] border-2 border-cocoa bg-cream p-8 text-center shadow-chunky sm:p-10">
            <CakeSlice className="h-28 w-28" />
            <h2 className="mt-6 text-2xl font-bold">
              {scope === 'active' ? 'No current orders.' : 'No past orders yet.'}
            </h2>
            <p className="mt-2 max-w-sm text-cocoa/75">
              {scope === 'active'
                ? 'Orders you place will appear here until they are completed or cancelled.'
                : 'Completed and cancelled orders will appear here.'}
            </p>
            <Button to="/bakery" className="mt-7" accent="flame">Browse the bakery</Button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            </div>
            {pagination && pagination.totalPages > 1 ? (
              <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Orders pagination">
                <Button variant="outline" accent="cocoa" disabled={page === 1} onClick={() => changePage(page - 1)}>
                  Previous
                </Button>
                <span className="text-sm font-bold text-cocoa">Page {page} of {pagination.totalPages}</span>
                <Button variant="outline" accent="cocoa" disabled={page === pagination.totalPages} onClick={() => changePage(page + 1)}>
                  Next
                </Button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
