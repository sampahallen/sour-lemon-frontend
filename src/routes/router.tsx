import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Bakery } from '@/pages/Bakery'
import { BakeryProduct } from '@/pages/BakeryProduct'
import { CustomCake } from '@/pages/CustomCake'
import { Shop } from '@/pages/Shop'
import { Jams } from '@/pages/Jams'
import { Collabs } from '@/pages/Collabs'
import { Merch } from '@/pages/Merch'
import { Games } from '@/pages/Games'
import { Journal } from '@/pages/Journal'
import { JournalPost } from '@/pages/JournalPost'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { SignIn } from '@/pages/SignIn'
import { CreateAccount } from '@/pages/CreateAccount'
import { Account } from '@/pages/Account'
import { Orders } from '@/pages/Orders'
import { Checkout } from '@/pages/Checkout'
import { OrderConfirmation } from '@/pages/OrderConfirmation'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/bakery', element: <Bakery /> },
        { path: '/bakery/:slug', element: <BakeryProduct /> },
        { path: '/custom-cake', element: <CustomCake /> },
        { path: '/shop', element: <Shop /> },
        { path: '/jams', element: <Jams /> },
        { path: '/collabs', element: <Collabs /> },
        { path: '/merch', element: <Merch /> },
        { path: '/games', element: <Games /> },
        { path: '/journal', element: <Journal /> },
        { path: '/journal/:slug', element: <JournalPost /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
        { path: '/signin', element: <SignIn /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/reset-password', element: <ResetPassword /> },
        { path: '/create-account', element: <CreateAccount /> },
        { path: '/account', element: <Account /> },
        { path: '/orders', element: <Orders /> },
        { path: '/checkout', element: <Checkout /> },
        { path: '/order-confirmation/:orderId', element: <OrderConfirmation /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') },
)
