import { SectionGate } from '@/siteSections/SectionGate'
import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Bakery } from '@/pages/Bakery'
import { BakeryProduct } from '@/pages/BakeryProduct'
import { CustomCake } from '@/pages/CustomCake'
import { CustomCakePayment } from '@/pages/CustomCakePayment'
import { Shop } from '@/pages/Shop'
import { Collabs } from '@/pages/Collabs'
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
import { NewsletterAction } from '@/pages/NewsletterAction'
import { Privacy } from '@/pages/Privacy'

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/bakery', element: <SectionGate sectionKey="cakes"><Bakery /></SectionGate> },
        { path: '/bakery/:slug', element: <SectionGate sectionKey="cakes"><BakeryProduct /></SectionGate> },
        { path: '/custom-cake', element: <SectionGate sectionKey="cakes"><CustomCake /></SectionGate> },
        { path: '/custom-cake/payment/:requestId/:token', element: <CustomCakePayment /> },
        { path: '/shop', element: <SectionGate sectionKey="shop"><Shop /></SectionGate> },
        { path: '/collabs', element: <SectionGate sectionKey="collaborations"><Collabs /></SectionGate> },
        { path: '/games', element: <SectionGate sectionKey="games"><Games /></SectionGate> },
        { path: '/journal', element: <SectionGate sectionKey="journal"><Journal /></SectionGate> },
        { path: '/journal/:slug', element: <SectionGate sectionKey="journal"><JournalPost /></SectionGate> },
        { path: '/about', element: <SectionGate sectionKey="about"><About /></SectionGate> },
        { path: '/contact', element: <SectionGate sectionKey="contact"><Contact /></SectionGate> },
        { path: '/privacy', element: <Privacy /> },
        { path: '/newsletter/confirm', element: <NewsletterAction action="confirm" /> },
        { path: '/newsletter/unsubscribe', element: <NewsletterAction action="unsubscribe" /> },
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
