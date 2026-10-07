import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxImageBytes = 5 * 1024 * 1024

type MomoDetails = { number: string; recipientName: string; network: string }

type ManualMomoPaymentProps = {
  amount: string
  currency: string
  momo: MomoDetails
  status: 'pending' | 'review' | 'rejected'
  rejectionReason?: string | null
  onSubmit: (reference: string, file: File | null) => Promise<void>
  onRefresh: () => Promise<void> | void
}

function money(amount: string, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}

export function ManualMomoPayment({
  amount,
  currency,
  momo,
  status,
  rejectionReason,
  onSubmit,
  onRefresh,
}: ManualMomoPaymentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [reference, setReference] = useState('')
  const [showReference, setShowReference] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(momo.number)
      setCopyMessage('Number copied')
    } catch {
      setCopyMessage('Could not copy. Select the number to copy it.')
    }
  }

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    if (!selected) return
    if (!allowedImageTypes.has(selected.type)) {
      setError('Choose a JPEG, PNG, or WebP screenshot.')
      event.target.value = ''
      return
    }
    if (selected.size > maxImageBytes) {
      setError('Choose a screenshot smaller than 5 MB.')
      event.target.value = ''
      return
    }
    setFile(selected)
    setError(null)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file && !reference.trim()) {
      setError('Add a screenshot or transaction reference first.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(reference.trim(), file)
      setReference('')
      removeFile()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not submit payment proof.')
    } finally {
      setSubmitting(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      await onRefresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not refresh payment status.')
    } finally {
      setRefreshing(false)
    }
  }

  if (status === 'review') {
    return (
      <div className="rounded-2xl border border-olive/20 bg-olive/5 p-5 text-cocoa sm:p-6">
        <h2 className="font-display text-xl font-bold">Proof submitted</h2>
        <p className="mt-2 text-sm leading-relaxed text-cocoa/70">The owner will check the Mobile Money account before confirming your payment.</p>
        <button type="button" onClick={() => void refresh()} disabled={refreshing} className="mt-5 rounded-full border border-olive px-5 py-2.5 text-sm font-semibold text-olive disabled:opacity-50">
          {refreshing ? 'Checking…' : 'Refresh status'}
        </button>
        {error ? <p role="alert" className="mt-3 text-sm font-medium text-flame">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="min-w-0 text-cocoa">
      {status === 'rejected' ? (
        <p role="alert" className="mb-5 rounded-xl border border-flame/20 bg-flame/5 px-4 py-3 text-sm leading-relaxed text-cocoa">
          {rejectionReason || 'We could not match your payment. Please send new proof.'}
        </p>
      ) : null}

      <section aria-labelledby="momo-transfer-heading" className="rounded-2xl border border-cocoa/15 bg-butter/50 p-4 sm:p-6">
        <h2 id="momo-transfer-heading" className="text-sm font-semibold text-cocoa/65">Send with Mobile Money</h2>
        <p className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{money(amount, currency)}</p>
        <div className="mt-5 border-t border-cocoa/15 pt-4">
          <p className="text-sm font-semibold">{momo.network} · {momo.recipientName}</p>
          <div className="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <strong className="min-w-0 select-all break-all text-xl sm:text-2xl">{momo.number}</strong>
            <button type="button" onClick={() => void copyNumber()} className="min-h-11 shrink-0 rounded-full border border-olive px-5 py-2.5 text-sm font-semibold text-olive transition hover:bg-olive/10">
              Copy number
            </button>
          </div>
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-cocoa/65">{copyMessage}</p>
        </div>
      </section>

      <form onSubmit={submit} className="mt-8 border-t border-cocoa/15 pt-7">
        <h2 className="font-display text-xl font-bold">Submit payment proof</h2>
        <p className="mt-1 text-sm text-cocoa/65">After sending the transfer, add a receipt screenshot or reference.</p>

        <div className="mt-5 rounded-xl border border-cocoa/20 bg-white p-4">
          <label htmlFor="momo-receipt-file" className="block text-sm font-semibold">Receipt screenshot</label>
          <p className="mt-1 text-xs text-cocoa/60">JPEG, PNG, or WebP · up to 5 MB</p>
          <input
            ref={fileInputRef}
            id="momo-receipt-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={chooseFile}
            className="hidden"
          />
          {file ? (
            <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="min-w-0 flex-1 break-all font-medium">{file.name}</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="font-semibold text-olive underline underline-offset-4">Replace</button>
              <button type="button" onClick={removeFile} className="font-semibold text-cocoa/65 underline underline-offset-4">Remove</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-olive px-5 py-2.5 text-sm font-semibold text-olive transition hover:bg-olive/10">
              Choose screenshot
            </button>
          )}
        </div>

        <button type="button" aria-expanded={showReference} onClick={() => setShowReference((open) => !open)} className="mt-5 block text-sm font-semibold text-olive underline underline-offset-4">
          {showReference ? 'Hide transaction reference' : 'Use a transaction reference instead'}
        </button>
        {showReference ? (
          <div className="mt-4">
            <label htmlFor="momo-transaction-reference" className="mb-2 block text-sm font-semibold">Transaction reference</label>
            <input
              id="momo-transaction-reference"
              type="text"
              maxLength={160}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              className="w-full rounded-xl border border-cocoa/25 bg-white px-4 py-3 text-base outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/15"
            />
          </div>
        ) : null}

        {error ? <p role="alert" className="mt-4 text-sm font-medium text-flame">{error}</p> : null}
        <button type="submit" disabled={submitting} className="mt-6 block min-h-12 w-full rounded-full bg-olive px-6 py-3 font-display font-semibold text-cream transition hover:bg-olive/90 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:min-w-52">
          {submitting ? 'Submitting…' : 'Submit payment proof'}
        </button>
        <p className="mt-3 text-xs text-cocoa/60">The owner will confirm your payment after checking the transfer.</p>
      </form>
    </div>
  )
}
