import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink } from 'react-router'
import { resetPasswordRequest } from '@/auth/authApi'
import { PasswordField } from '@/components/ui/PasswordField'

const passwordClassName =
  'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 pl-4 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'

const readToken = () => {
  return new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
}

export function ResetPassword() {
  const [token] = useState(readToken)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await resetPasswordRequest(token, password)
      setComplete(true)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not reset your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />
      <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-cocoa bg-cream p-8 shadow-chunky sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Account recovery</p>
        <h1 className="mt-2 text-4xl font-bold">Choose a new password</h1>

        {complete ? (
          <div className="mt-8">
            <div role="status" className="rounded-2xl border-2 border-olive bg-olive/10 px-5 py-4 font-semibold">
              Your password has been changed. You can now sign in with your new password.
            </div>
            <NavLink to="/signin" className="mt-6 inline-flex rounded-full bg-olive px-6 py-3 font-display text-lg font-semibold text-cream hover:bg-olive/90">
              Sign in
            </NavLink>
          </div>
        ) : !token ? (
          <div className="mt-8">
            <p role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-5 py-4 font-semibold">
              This reset link is incomplete or has expired. Request a fresh link to continue.
            </p>
            <NavLink to="/forgot-password" className="mt-6 inline-flex font-bold text-flame hover:text-cocoa">
              Request a new reset link
            </NavLink>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-bold">New password</label>
              <PasswordField
                id="new-password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={passwordClassName}
              />
              <p className="mt-2 text-xs text-cocoa/70">Use at least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold">Confirm new password</label>
              <PasswordField
                id="confirm-password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                aria-describedby={error ? 'reset-error' : undefined}
                className={passwordClassName}
              />
            </div>
            {error ? (
              <p id="reset-error" role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        {!complete ? (
          <NavLink to="/signin" className="mt-8 inline-flex text-sm font-bold text-cocoa hover:text-flame">
            &larr; Back to sign in
          </NavLink>
        ) : null}
      </div>
    </section>
  )
}
