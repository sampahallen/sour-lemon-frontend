import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { PasswordField } from '@/components/ui/PasswordField'
import { cn } from '@/utils/cn'

const fieldBaseClassName =
  'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'
const fieldClassName = cn(fieldBaseClassName, 'px-4')
const passwordFieldClassName = cn(fieldBaseClassName, 'pl-4')

export function SignIn() {
  const navigate = useNavigate()
  const { session, signIn } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn({ phoneNumber, password })
      await navigate('/', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not sign you in.')
    } finally {
      setSubmitting(false)
    }
  }

  if (session) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border-2 border-cocoa bg-butter p-8 text-center shadow-chunky">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Already signed in</p>
          <h1 className="mt-2 text-4xl font-bold">Hi, {session.user.name}!</h1>
          <NavLink
            to="/"
            className="mt-6 inline-flex rounded-full bg-cocoa px-6 py-3 font-bold text-cream transition-transform hover:-translate-y-0.5"
          >
            Back to Sour Lemon
          </NavLink>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div
        className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream shadow-chunky lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-flame p-8 text-cream sm:p-10 lg:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-butter">Your Sour Lemon account</p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.95] sm:text-6xl">
              Welcome back,
              <br />
              sweet thing.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/90">
              Sign in to keep your details close and make your next cake order feel effortless.
            </p>
          </div>
          <p className="mt-12 font-display text-xl font-semibold text-butter">Good cake. Bright days.</p>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Sign in</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Let’s get you sorted.</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="phone-number" className="mb-2 block text-sm font-bold">
                Phone number
              </label>
              <input
                id="phone-number"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="+233 20 123 4567"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                aria-describedby="phone-number-hint"
                className={fieldClassName}
              />
              <p id="phone-number-hint" className="mt-2 text-xs leading-relaxed text-cocoa/70">
                Use any common format. We add Ghana's +233 code when it is missing.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold">
                Password
              </label>
              <PasswordField
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={error ? 'signin-error' : undefined}
                className={passwordFieldClassName}
              />
            </div>

            {error && (
              <p
                id="signin-error"
                role="alert"
                className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Signing you in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-cocoa/80">
            New here?{' '}
            <NavLink
              to="/create-account"
              className="font-bold text-cocoa hover:text-flame"
            >
              Create account
            </NavLink>
          </p>

          <NavLink
            to="/"
            className="mt-6 inline-flex text-sm font-bold text-cocoa hover:text-flame"
          >
            ← Back to home
          </NavLink>
        </div>
      </div>
    </section>
  )
}
