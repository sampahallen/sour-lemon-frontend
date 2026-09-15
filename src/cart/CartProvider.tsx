import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { cart: nextCart } = await getCart(token)
      setCart(nextCart)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not load your cart.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    let active = true
    void getCart(token)
      .then(({ cart: nextCart }) => {
        if (active) {
          setCart(nextCart)
          setError(null)
        }
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'We could not load your cart.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
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
    [cart, itemCount, isLoading, error, isOpen, token, refresh],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
