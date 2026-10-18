import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { getCakePayment, submitCakePaymentProof } from '@/api/manualPayments'
import { ManualMomoPayment } from '@/components/payment/ManualMomoPayment'

type CakePayment = Awaited<ReturnType<typeof getCakePayment>>

export function CustomCakePayment() {
  const { requestId = '', token = '' } = useParams()
  const [details, setDetails] = useState<CakePayment | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    const nextDetails = await getCakePayment(requestId, token)
    setDetails(nextDetails)
    setLoadError(null)
  }, [requestId, token])

  useEffect(() => {
    let active = true
    void getCakePayment(requestId, token)
      .then((result) => {
        if (active) {
          setDetails(result)
          setLoadError(null)
        }
      })
      .catch((caught: unknown) => {
        if (active) setLoadError(caught instanceof Error ? caught.message : 'Could not load this quote.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [requestId, token])

  const submitProof = async (reference: string, file: File | null) => {
    const { proof } = await submitCakePaymentProof(requestId, token, reference, file)
    setDetails((current) => current ? { ...current, proofs: [proof, ...current.proofs] } : current)
    void refresh().catch((caught: unknown) => setLoadError(caught instanceof Error ? caught.message : 'Could not refresh payment status.'))
  }

  if (isLoading) {
    return <section className="mx-auto max-w-5xl px-4 py-16 text-center text-cocoa/65">Loading payment details…</section>
  }

  if (!details) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center text-cocoa">
        <h1 className="font-display text-2xl font-bold">Payment link unavailable</h1>
        <p role="alert" className="mt-3 text-sm text-cocoa/65">{loadError ?? 'We could not load this quote.'}</p>
        <button type="button" onClick={() => void refresh().catch((caught: unknown) => setLoadError(caught instanceof Error ? caught.message : 'Could not load this quote.'))} className="mt-6 rounded-full bg-olive px-6 py-3 font-semibold text-cream">
          Try again
        </button>
      </section>
    )
  }

  const latestProof = details.proofs[0]
  const canPay = details.payable && details.cake.quotedAmount && details.momo

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 text-cocoa sm:px-6 sm:pt-12 lg:px-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-olive">Custom cake payment</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Pay for your custom cake</h1>
        <p className="mt-2 text-sm text-cocoa/65">{details.cake.occasion}</p>
      </header>

      <div className="max-w-2xl">
        {loadError ? <p role="alert" className="mb-5 rounded-xl border border-flame/20 bg-flame/5 px-4 py-3 text-sm">{loadError}</p> : null}
        {details.cake.status === 'confirmed' ? (
          <div className="rounded-2xl border border-olive/20 bg-olive/5 p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">Payment confirmed</h2>
            <p className="mt-2 text-sm leading-relaxed text-cocoa/70">The owner will coordinate your cake with you on WhatsApp.</p>
          </div>
        ) : !details.payable ? (
          <div className="rounded-2xl border border-cocoa/15 bg-butter/50 p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">This quote is no longer payable</h2>
            <p className="mt-2 text-sm text-cocoa/70">Please contact the owner for an updated quote.</p>
          </div>
        ) : canPay ? (
          <ManualMomoPayment
            amount={details.cake.quotedAmount!}
            currency={details.cake.currency}
            momo={details.momo!}
            status={latestProof?.status === 'submitted' ? 'review' : latestProof?.status === 'rejected' ? 'rejected' : 'pending'}
            rejectionReason={latestProof?.rejectionReason}
            onSubmit={submitProof}
            onRefresh={refresh}
          />
        ) : (
          <p role="alert" className="rounded-xl border border-flame/20 bg-flame/5 px-4 py-3 text-sm">
            Payment details are unavailable. Please contact the owner for help.
          </p>
        )}
      </div>
    </section>
  )
}
