import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { signInRequest, signOutRequest, signUpRequest, updateProfileRequest } from './authApi'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'
import { acceptSession, clearSession, getAuthState, refreshSession, SessionEndedError, subscribeAuth } from './sessionManager'
import { SessionLifecycle } from './SessionLifecycle'

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [bootstrapError, setBootstrapError] = useState(false)
  const [bootAttempt, setBootAttempt] = useState(0)

  useEffect(() => {
    let active = true
    sessionStorage.removeItem('sour-lemon-auth-session')
    void refreshSession()
      .catch((error: unknown) => { if (active && !(error instanceof SessionEndedError)) setBootstrapError(true) })
      .finally(() => { if (active) setIsBootstrapping(false) })
    return () => { active = false }
  }, [bootAttempt])

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

  if (isBootstrapping) return <div className="grid min-h-screen place-items-center bg-cream font-semibold text-cocoa">Loading Sour Lemon…</div>
  if (bootstrapError) return (
    <div className="grid min-h-screen place-items-center bg-cream p-4 text-center">
      <div><p className="font-semibold">Could not reconnect to Sour Lemon.</p>
        <button className="mt-3 rounded-lg bg-flame px-4 py-2 font-bold text-white" onClick={() => { setIsBootstrapping(true); setBootstrapError(false); setBootAttempt((attempt) => attempt + 1) }}>Try again</button>
      </div>
    </div>
  )
  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionLifecycle signIn={signIn} appName="customer" />
    </AuthContext.Provider>
  )
}
