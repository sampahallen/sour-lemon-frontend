import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { signInRequest, signUpRequest, updateProfileRequest } from './authApi'
import type { AuthSession } from './authApi'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'

const SESSION_STORAGE_KEY = 'sour-lemon-auth-session'

const loadStoredSession = (): AuthSession | null => {
  const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthSession
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadStoredSession)

  const storeSession = (nextSession: AuthSession) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      signIn: async (credentials) => {
        const nextSession = await signInRequest(credentials)
        storeSession(nextSession)
      },
      signUp: async (details) => {
        const nextSession = await signUpRequest(details)
        storeSession(nextSession)
      },
      updateProfile: async (details) => {
        if (!session) throw new Error('You must be signed in to update your details.')
        const updatedUser = await updateProfileRequest(session.token, details)
        storeSession({ ...session, user: updatedUser })
      },
      signOut: () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
