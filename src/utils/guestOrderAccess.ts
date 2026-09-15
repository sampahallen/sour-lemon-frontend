const storageKey = (orderId: string) => `sour-lemon-guest-order-${orderId}`

export function storeGuestOrderAccessToken(orderId: string, token: string) {
  sessionStorage.setItem(storageKey(orderId), token)
}

export function getGuestOrderAccessToken(orderId: string): string | null {
  return sessionStorage.getItem(storageKey(orderId))
}
