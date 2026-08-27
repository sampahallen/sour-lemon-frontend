import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, NavLink } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { PasswordField } from '@/components/ui/PasswordField'
import { cn } from '@/utils/cn'

const fieldBaseClassName =
  'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'
const fieldClassName = cn(fieldBaseClassName, 'px-4')
const passwordFieldClassName = cn(fieldBaseClassName, 'pl-4')

export function Account() {
  const { session, updateProfile } = useAuth()

  const [name, setName] = useState(session?.user.name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(session?.user.phoneNumber ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(session?.user.whatsappNumber ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!session) return <Navigate to="/signin" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword && newPassword !== confirmNewPassword) {
      setError('Your new passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const trimmedWhatsapp = whatsappNumber.trim()
      await updateProfile({
        name: name.trim(),
        phoneNumber,
        whatsappNumber: trimmedWhatsapp ? normalizePhoneNumber(trimmedWhatsapp) : null,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setSuccess(true)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not save your details.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />
      <div className="absolute -right-24 bottom-8 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />

      <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream p-8 shadow-chunky sm:p-10 lg:p-12">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Account details</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Keep your info fresh.</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="account-name" className="mb-2 block text-sm font-bold">Full name</label>
            <input
              id="account-name"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="account-phone-number" className="mb-2 block text-sm font-bold">Phone number</label>
              <input
                id="account-phone-number"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="account-whatsapp-number" className="mb-2 block text-sm font-bold">
                WhatsApp <span className="font-normal">(optional)</span>
              </label>
              <input
                id="account-whatsapp-number"
                name="whatsappNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={whatsappNumber}
                onChange={(event) => setWhatsappNumber(event.target.value)}
                onBlur={() => {
                  if (whatsappNumber.trim()) setWhatsappNumber(normalizePhoneNumber(whatsappNumber))
                }}
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-cocoa/15 pt-5">
            <p className="text-sm font-bold">Change password</p>
            <p className="mt-1 text-xs leading-relaxed text-cocoa/70">Leave blank to keep your current password.</p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="account-current-password" className="mb-2 block text-sm font-bold">Current password</label>
                <PasswordField
                  id="account-current-password"
                  name="currentPassword"
                  autoComplete="current-password"
                  required={Boolean(newPassword)}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className={passwordFieldClassName}
                />
              </div>

              <div>
                <label htmlFor="account-new-password" className="mb-2 block text-sm font-bold">New password</label>
                <PasswordField
                  id="account-new-password"
                  name="newPassword"
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={passwordFieldClassName}
                />
              </div>

              <div>
                <label htmlFor="account-confirm-new-password" className="mb-2 block text-sm font-bold">Confirm new password</label>
                <PasswordField
                  id="account-confirm-new-password"
                  name="confirmNewPassword"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  aria-describedby={error ? 'account-error' : undefined}
                  className={passwordFieldClassName}
                />
              </div>
            </div>
          </div>

          {error && (
            <p
              id="account-error"
              role="alert"
              className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa"
            >
              {error}
            </p>
          )}

          {success && !error && (
            <p role="status" className="rounded-2xl border-2 border-olive bg-olive/10 px-4 py-3 text-sm font-semibold text-cocoa">
              Your details are saved.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
          >
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <NavLink to="/" className="mt-8 inline-flex text-sm font-bold text-cocoa hover:text-flame">
          ← Back to home
        </NavLink>
      </div>
    </section>
  )
}
