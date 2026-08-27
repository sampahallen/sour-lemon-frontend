import { normalizePhoneNumber } from '@/utils/phoneNumber'

export interface AuthUser {
  id: string
  name: string
  phoneNumber: string
  whatsappNumber: string | null
  role: 'customer' | 'admin'
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: AuthUser
  token: string
  tokenType: 'Bearer'
  expiresIn: string | number
}

export interface SignInCredentials {
  phoneNumber: string
  password: string
}

export interface SignUpDetails {
  name: string
  phoneNumber: string
  whatsappNumber?: string
  password: string
  deliveryAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    landmark?: string
  }
}

export interface UpdateProfileDetails {
  name?: string
  phoneNumber?: string
  whatsappNumber?: string | null
  currentPassword?: string
  newPassword?: string
}

interface ApiErrorResponse {
  error?: string
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

export async function signInRequest(credentials: SignInCredentials): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...credentials,
      phoneNumber: normalizePhoneNumber(credentials.phoneNumber),
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.error ?? 'We could not sign you in. Please try again.')
  }

  return (await response.json()) as AuthSession
}

export async function signUpRequest(details: SignUpDetails): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...details,
      phoneNumber: normalizePhoneNumber(details.phoneNumber),
      ...(details.whatsappNumber
        ? { whatsappNumber: normalizePhoneNumber(details.whatsappNumber) }
        : {}),
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.error ?? 'We could not create your account. Please try again.')
  }

  return (await response.json()) as AuthSession
}

export async function updateProfileRequest(
  token: string,
  details: UpdateProfileDetails,
): Promise<AuthUser> {
  const response = await fetch(`${apiBaseUrl}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...details,
      ...(details.phoneNumber ? { phoneNumber: normalizePhoneNumber(details.phoneNumber) } : {}),
      ...(details.whatsappNumber
        ? { whatsappNumber: normalizePhoneNumber(details.whatsappNumber) }
        : {}),
    }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.error ?? 'We could not update your details. Please try again.')
  }

  const data = (await response.json()) as { user: AuthUser }
  return data.user
}
