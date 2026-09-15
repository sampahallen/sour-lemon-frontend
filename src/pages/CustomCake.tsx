import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { normalizePhoneNumber } from '@/utils/phoneNumber'
import { submitCustomCakeRequest, uploadCustomCakeRequestImage } from '@/api/customCakeRequest'
import { cn } from '@/utils/cn'

export function CustomCake() {
  const { session } = useAuth()

  const [customerName, setCustomerName] = useState(session?.user.name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(session?.user.phoneNumber ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(session?.user.whatsappNumber ?? '')
  const [occasion, setOccasion] = useState('')
  const [requestedSize, setRequestedSize] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhoto(file)
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const clearPhoto = () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl)
    setPhoto(null)
    setPhotoPreviewUrl(null)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const trimmedWhatsapp = whatsappNumber.trim()
      const trimmedNotes = notes.trim()
      const { request } = await submitCustomCakeRequest(
        {
          customerName: customerName.trim(),
          phoneNumber,
          occasion: occasion.trim(),
          requestedSize: requestedSize.trim(),
          ...(trimmedWhatsapp ? { whatsappNumber } : {}),
          ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        },
        session?.token,
      )

      if (photo) {
        await uploadCustomCakeRequestImage(request.id, photo, session?.token)
      }

      setSubmitted(true)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'We could not submit your request.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldBaseClassName =
    'w-full rounded-2xl border-2 border-cocoa bg-white/60 py-3.5 px-4 text-base outline-none transition focus:border-flame focus:ring-4 focus:ring-flame/15'

  if (submitted) {
    return (
      <section className="flex min-h-[65vh] items-center justify-center px-6 py-16">
        <div className="max-w-md rounded-3xl border-2 border-cocoa bg-butter p-8 text-center shadow-chunky">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Request sent</p>
          <h1 className="mt-2 text-4xl font-bold">Thank you, {customerName || 'friend'}!</h1>
          <p className="mt-3 text-cocoa/80">
            We've got your custom cake request. We'll be in touch on WhatsApp with your quote soon.
          </p>
          <NavLink
            to="/bakery"
            className="mt-6 inline-flex rounded-full bg-cocoa px-6 py-3 font-bold text-cream transition-transform hover:-translate-y-0.5"
          >
            Back to the Bakery
          </NavLink>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden px-6 py-12 sm:py-16 lg:px-10 lg:py-20">
      <div className="absolute -left-24 bottom-10 -z-10 h-72 w-72 rounded-full bg-olive/20" aria-hidden="true" />
      <div className="absolute -right-20 top-12 -z-10 h-64 w-64 rounded-full bg-butter/80" aria-hidden="true" />

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border-2 border-cocoa bg-cream shadow-chunky lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 sm:p-10 lg:p-12">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-olive">Custom cakes</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Tell us what you're celebrating.</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cc-name" className="mb-2 block text-sm font-bold">Your name</label>
              <input
                id="cc-name"
                name="customerName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className={fieldBaseClassName}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cc-phone" className="mb-2 block text-sm font-bold">Phone number</label>
                <input
                  id="cc-phone"
                  name="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="020 123 4567"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  onBlur={() => setPhoneNumber(normalizePhoneNumber(phoneNumber))}
                  className={fieldBaseClassName}
                />
              </div>

              <div>
                <label htmlFor="cc-whatsapp" className="mb-2 block text-sm font-bold">
                  WhatsApp <span className="font-normal">(optional)</span>
                </label>
                <input
                  id="cc-whatsapp"
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
                  className={fieldBaseClassName}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="cc-occasion" className="mb-2 block text-sm font-bold">Occasion</label>
                <input
                  id="cc-occasion"
                  name="occasion"
                  type="text"
                  required
                  maxLength={160}
                  placeholder="e.g. Birthday, wedding"
                  value={occasion}
                  onChange={(event) => setOccasion(event.target.value)}
                  className={fieldBaseClassName}
                />
              </div>

              <div>
                <label htmlFor="cc-size" className="mb-2 block text-sm font-bold">Size</label>
                <input
                  id="cc-size"
                  name="requestedSize"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Serves 20"
                  value={requestedSize}
                  onChange={(event) => setRequestedSize(event.target.value)}
                  className={fieldBaseClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cc-notes" className="mb-2 block text-sm font-bold">
                Notes <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="cc-notes"
                name="notes"
                rows={4}
                maxLength={5000}
                placeholder="Theme, colors, flavors, anything else we should know…"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={cn(fieldBaseClassName, 'resize-none')}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Reference photo <span className="font-normal">(optional)</span>
              </label>
              <input
                ref={photoInputRef}
                id="cc-photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <div className="flex flex-wrap items-start gap-3">
                {photoPreviewUrl ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-flame bg-white/60">
                    <img src={photoPreviewUrl} alt="Reference preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label="Remove reference photo"
                      onClick={clearPhoto}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-cocoa/80 text-sm font-bold text-cream"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label="Add a reference photo"
                    onClick={() => photoInputRef.current?.click()}
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-cocoa/30 text-3xl font-light text-cocoa/60 transition hover:border-flame hover:text-flame"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-2xl border-2 border-flame bg-flame/10 px-4 py-3 text-sm font-semibold text-cocoa">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-full bg-olive px-6 py-3.5 font-display text-lg font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? 'Sending your request…' : 'Request a custom cake'}
            </button>
          </form>

          <NavLink to="/bakery" className="mt-6 inline-flex text-sm font-bold text-cocoa hover:text-flame">
            ← Back to the Bakery
          </NavLink>
        </div>

        <div className="flex flex-col justify-between bg-flame p-8 text-cream sm:p-10 lg:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-butter">Made just for you</p>
            <h2 className="mt-4 text-5xl font-bold leading-[0.95] sm:text-6xl">
              One of a kind.
              <br />
              Every time.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-cream/90">
              Tell us the occasion and the size you need. We'll follow up on WhatsApp with a price and next steps.
            </p>
          </div>
          <p className="mt-12 font-display text-xl font-semibold text-butter">Good cake. Bright days.</p>
        </div>
      </div>
    </section>
  )
}
