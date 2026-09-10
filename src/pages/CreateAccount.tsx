import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { PasswordField } from '@/components/ui/PasswordField'
import { cn } from '@/utils/cn'

export function CreateAccount() {
  const navigate = useNavigate()
  const { session, signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [landmark, setLandmark] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const trimmedEmail = email.trim()
      const trimmedWhatsapp = whatsappNumber.trim()
      const trimmedAddressLine2 = addressLine2.trim()
      const trimmedLandmark = landmark.trim()
      await signUp({
        name: name.trim(),
        email: trimmedEmail,
        phoneNumber,
        password,
        ...(trimmedWhatsapp ? { whatsappNumber } : {}),
        deliveryAddress: {
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          ...(trimmedAddressLine2 ? { addressLine2: trimmedAddressLine2 } : {}),
          ...(trimmedLandmark ? { landmark: trimmedLandmark } : {}),
        },
      })
      await navigate('/', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  if (session) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border-2 border-cocoa bg-butter p-8 text-center shadow-chunky">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Account ready</p>
          <h1 className="mt-2 text-4xl font-bold">Hi, {session.user.name}!</h1>
          <p className="mt-3 text-cocoa/80">You are already signed in.</p>
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

  const fieldBaseClassName =
    'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'
  const fieldClassName = cn(fieldBaseClassName, 'px-4')
  const passwordFieldClassName = cn(fieldBaseClassName, 'pl-4')

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-24 bottom-10 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />
      <div className="absolute -right-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream shadow-chunky lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Create account</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">A little sweetness starts here.</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-bold">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-bold">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-phone-number" className="mb-2 block text-sm font-bold">Phone number</label>
                <input
                  id="signup-phone-number"
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="020 123 4567"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                  aria-describedby="signup-phone-hint"
                  className={fieldClassName}
                />
                <p id="signup-phone-hint" className="mt-2 text-xs text-cocoa/70">Any common format works; Ghana's +233 is added if missing.</p>
              </div>

              <div>
                <label htmlFor="whatsapp-number" className="mb-2 block text-sm font-bold">WhatsApp <span className="font-normal">(optional)</span></label>
                <input
                  id="whatsapp-number"
                  name="whatsappNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="020 123 4567"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  onBlur={() => {
                    if (whatsappNumber.trim()) setWhatsappNumber(normalizePhoneNumber(whatsappNumber))
                  }}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address-line-1" className="mb-2 block text-sm font-bold">Delivery address</label>
              <input
                id="address-line-1"
                name="addressLine1"
                type="text"
                autoComplete="shipping street-address"
                required
                maxLength={255}
                value={addressLine1}
                onChange={(event) => setAddressLine1(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="address-line-2" className="mb-2 block text-sm font-bold">Address line 2 <span className="font-normal">(optional)</span></label>
                <input
                  id="address-line-2"
                  name="addressLine2"
                  type="text"
                  autoComplete="shipping address-line2"
                  maxLength={255}
                  value={addressLine2}
                  onChange={(event) => setAddressLine2(event.target.value)}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-bold">City or town</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="shipping address-level2"
                  required
                  maxLength={120}
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="landmark" className="mb-2 block text-sm font-bold">Nearby landmark <span className="font-normal">(optional)</span></label>
              <input
                id="landmark"
                name="landmark"
                type="text"
                maxLength={255}
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-bold">Password</label>
                <PasswordField
                  id="signup-password"
                  name="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby="password-hint"
                  className={passwordFieldClassName}
                />
                <p id="password-hint" className="mt-2 text-xs text-cocoa/70">Use at least 8 characters.</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold">Confirm password</label>
                <PasswordField
                  id="confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-describedby={error ? 'signup-error' : undefined}
                  className={passwordFieldClassName}
                />
              </div>
            </div>

            {error && (
              <p id="signup-error" role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-cocoa/80">
            Already have an account?{' '}
            <NavLink to="/signin" className="font-bold text-cocoa hover:text-flame">
              Sign in
            </NavLink>
          </p>

          <NavLink to="/" className="mt-6 inline-flex text-sm font-bold text-cocoa hover:text-flame">
            ← Back to home
          </NavLink>
        </div>

        <div className="flex flex-col justify-between bg-flame p-8 text-cream sm:p-10 lg:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-butter">Your Sour Lemon account</p>
            <h2 className="mt-4 text-5xl font-bold leading-[0.95] sm:text-6xl">
              Come for cake.
              <br />
              Stay for joy.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/90">
              Save your details and make every future order a little quicker.
            </p>
          </div>
          <p className="mt-12 font-display text-xl font-semibold text-butter">Good cake. Bright days.</p>
        </div>
      </div>
    </section>
  )
}
