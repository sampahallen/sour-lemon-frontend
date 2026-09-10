import { Outlet } from 'react-router'
import { Navbar } from '@/components/navigation/Navbar'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
