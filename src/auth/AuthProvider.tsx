import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { signInRequest, signOutRequest, signUpRequest, updateProfileRequest } from './authApi'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'
import { acceptSession, clearSession, getAuthState, refreshSession, SessionEndedError, subscribeAuth } from './sessionManager'
import { SessionLifecycle } from './SessionLifecycle'

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState)

  useEffect(() => {
    sessionStorage.removeItem('sour-lemon-auth-session')
    void refreshSession().catch((error: unknown) => {
      if (error instanceof SessionEndedError) return
      // Authentication enhances the public site; an unavailable API leaves this visit signed out.
    })
  }, [])

  const signIn: AuthContextValue['signIn'] = useCallback(async (credentials) => {
    const session = await signInRequest(credentials)
    if (session.user.role !== 'customer') throw new Error('This account does not have customer access.')
    const previous = getAuthState()
    acceptSession(session)
    if (previous.requiresSignIn && previous.session && previous.session.user.id !== session.user.id) window.location.reload()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session: auth.session,
    signIn,
    signUp: async (details) => acceptSession(await signUpRequest(details)),
    updateProfile: async (details) => {
      const session = getAuthState().session
      if (!session) throw new Error('You must be signed in to update your details.')
      const user = await updateProfileRequest(session.token, details)
      acceptSession({ ...getAuthState().session!, user })
    },
    signOut: async () => {
      await signOutRequest()
      clearSession()
    },
  }), [auth.session, signIn])

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionLifecycle signIn={signIn} appName="customer" />
    </AuthContext.Provider>
  )
}
