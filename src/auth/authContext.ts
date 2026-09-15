import { createContext, useContext } from 'react'
import type { AuthSession, SignInCredentials, SignUpDetails, UpdateProfileDetails } from './authApi'

export interface AuthContextValue {
  session: AuthSession | null
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (details: SignUpDetails) => Promise<void>
  updateProfile: (details: UpdateProfileDetails) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
