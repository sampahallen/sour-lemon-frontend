import { Navigate } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { Button } from '@/components/ui/Button'
import { CakeSlice } from '@/assets/stickers/CakeSlice'

export function Orders() {
  const { session } = useAuth()

  if (!session) return <Navigate to="/signin" replace />

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />
      <div className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />

      <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream p-8 text-center shadow-chunky sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Orders</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Track your orders here.</h1>

        <div className="mt-10 flex flex-col items-center">
          <CakeSlice className="h-28 w-28" />
          <p className="mt-6 max-w-sm text-base leading-relaxed text-cocoa/80">
            You haven't placed any orders yet. Once you do, you'll be able to follow their
            status right here.
          </p>
          <Button to="/shop" className="mt-8" accent="flame">
            Start shopping
          </Button>
        </div>
      </div>
    </section>
  )
}
