import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { addCartItem, getCart, removeCartItem, updateCartItem, type Cart } from '@/api/cart'
import { useAuth } from '@/auth/authContext'
import { CartContext } from './cartContext'
import type { CartContextValue } from './cartContext'

const emptyCart: Cart = { id: null, items: [], subtotal: '0.00', currency: 'GHS' }

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const token = session?.token ?? null
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [loadedToken, setLoadedToken] = useState<string | null | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const cartRevision = useRef(0)
  const pendingLoad = useRef<Promise<unknown> | null>(null)
  const isLoading = isRefreshing || loadedToken !== token

  const waitForLoad = useCallback(async () => {
    await pendingLoad.current?.catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)
    const revision = cartRevision.current
    const request = getCart(token)
    pendingLoad.current = request
    try {
      const { cart: nextCart } = await request
      if (revision === cartRevision.current) setCart(nextCart)
    } catch (caught) {
      if (revision === cartRevision.current) setError(caught instanceof Error ? caught.message : 'We could not load your cart.')
    } finally {
      if (pendingLoad.current === request) pendingLoad.current = null
      setIsRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const revision = cartRevision.current
    const request = getCart(token, controller.signal)
    pendingLoad.current = request
    void request
      .then(({ cart: nextCart }) => {
        if (active && revision === cartRevision.current) {
          setCart(nextCart)
          setError(null)
        }
      })
      .catch((caught: unknown) => {
        if (active && revision === cartRevision.current) {
          setError(caught instanceof Error ? caught.message : 'We could not load your cart.')
        }
      })
      .finally(() => {
        if (pendingLoad.current === request) pendingLoad.current = null
        if (active) setLoadedToken(token)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [token])

  const itemCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      isLoading,
      error,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev),
      addItem: async (productId, quantity = 1) => {
        await waitForLoad()
        cartRevision.current += 1
        setError(null)
        try {
          const { cart: nextCart } = await addCartItem(productId, quantity, token)
          setCart(nextCart)
          setIsOpen(true)
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : 'We could not add that to your cart.'
          setError(message)
          throw caught instanceof Error ? caught : new Error(message)
        }
      },
      updateItem: async (productId, quantity) => {
        await waitForLoad()
        cartRevision.current += 1
        setError(null)
        try {
          const { cart: nextCart } = await updateCartItem(productId, quantity, token)
          setCart(nextCart)
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : 'We could not update your cart.'
          setError(message)
          throw caught instanceof Error ? caught : new Error(message)
        }
      },
      removeItem: async (productId) => {
        await waitForLoad()
        cartRevision.current += 1
        setError(null)
        try {
          const { cart: nextCart } = await removeCartItem(productId, token)
          setCart(nextCart)
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : 'We could not remove that item.'
          setError(message)
          throw caught instanceof Error ? caught : new Error(message)
        }
      },
      refresh,
    }),
    [cart, itemCount, isLoading, error, isOpen, token, refresh, waitForLoad],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
