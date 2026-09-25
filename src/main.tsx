import '@fontsource/baloo-2/400.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './auth/AuthProvider'
import { CartProvider } from './cart/CartProvider'
import { router } from './routes/router'
import { SiteSectionsProvider } from './siteSections/SiteSectionsProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SiteSectionsProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </SiteSectionsProvider>
    </AuthProvider>
  </StrictMode>,
)
