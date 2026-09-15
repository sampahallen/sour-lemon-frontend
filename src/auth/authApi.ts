import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { apiBaseUrl } from '@/api/baseUrl'
import { apiRequest } from '@/api/http'

export interface AuthUser {
  id: string
  name: string
  email: string | null
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
  accessExpiresAt: string
  sessionExpiresAt: string
  idleExpiresAt: string
}

export interface SignInCredentials {
  phoneNumber: string
  password: string
}

export interface SignUpDetails {
  name: string
  email: string
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
  email?: string
  phoneNumber?: string
  whatsappNumber?: string | null
  currentPassword?: string
  newPassword?: string
}

interface ApiErrorResponse {
  error?: string
  message?: string
}

export { apiBaseUrl } from '@/api/baseUrl'

export async function signOutRequest(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/customer/signout`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Could not sign out.')
}

export async function signInRequest(credentials: SignInCredentials): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/api/auth/signin`, {
    method: 'POST',
    credentials: 'include',
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

export async function forgotPasswordRequest(phoneNumber: string): Promise<string> {
  const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: normalizePhoneNumber(phoneNumber) }),
  })

  const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
  if (!response.ok) {
    throw new Error(body.error ?? 'We could not process your request. Please try again.')
  }
  return body.message ?? 'Check the email registered to your account for a reset link.'
}

export async function resetPasswordRequest(token: string, password: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorResponse
    throw new Error(body.error ?? 'We could not reset your password. Please request a new link.')
  }
}

export async function signUpRequest(details: SignUpDetails): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
    method: 'POST',
    credentials: 'include',
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
  _token: string,
  details: UpdateProfileDetails,
): Promise<AuthUser> {
  void _token
  const data = await apiRequest<{ user: AuthUser }>('/api/users/me', {
    method: 'PATCH',
    body: {
      ...details,
      ...(details.phoneNumber ? { phoneNumber: normalizePhoneNumber(details.phoneNumber) } : {}),
      ...(details.whatsappNumber
        ? { whatsappNumber: normalizePhoneNumber(details.whatsappNumber) }
        : {}),
    },
  }, 'We could not update your details. Please try again.')
  return data.user
}
