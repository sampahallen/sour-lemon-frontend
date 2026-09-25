import { normalizePhoneNumber } from './phoneNumber'

export function buildWhatsAppUrl(phoneNumber: string | null, message: string): string | null {
  if (!phoneNumber) return null
  const digits = normalizePhoneNumber(phoneNumber).replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
