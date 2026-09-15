import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink } from 'react-router'
import { forgotPasswordRequest } from '@/auth/authApi'
import { normalizePhoneNumber } from '@/utils/phoneNumber'

const fieldClassName =
  'w-full rounded-2xl border-2 border-cocoa bg-white/60 px-4 py-3.5 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'

export function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      setMessage(await forgotPasswordRequest(phoneNumber))
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not process your request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />
      <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-cocoa bg-cream p-8 shadow-chunky sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Account recovery</p>
        <h1 className="mt-2 text-4xl font-bold">Forgot your password?</h1>
        <p className="mt-3 leading-relaxed text-cocoa/75">
          Enter the phone number you use to sign in. We will email a secure reset link to the address on your account.
        </p>

        {message ? (
          <div className="mt-8">
            <div role="status" className="rounded-2xl border-2 border-olive bg-olive/10 px-5 py-4 font-semibold">
              {message}
            </div>
            <p className="mt-3 text-sm text-cocoa/70">The link expires in 30 minutes. Check your spam folder too.</p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="mt-5 font-bold text-flame hover:text-cocoa"
            >
              Try another phone number
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="recovery-phone" className="mb-2 block text-sm font-bold">Phone number</label>
              <input
                id="recovery-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="+233 20 123 4567"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                aria-describedby={error ? 'recovery-error' : undefined}
                className={fieldClassName}
              />
            </div>
            {error ? (
              <p id="recovery-error" role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>
        )}

        <NavLink to="/signin" className="mt-8 inline-flex text-sm font-bold text-cocoa hover:text-flame">
          &larr; Back to sign in
        </NavLink>
      </div>
    </section>
  )
}
