import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { confirmNewsletter, unsubscribeNewsletter } from '@/api/newsletter'

export function NewsletterAction({ action }: { action: 'confirm' | 'unsubscribe' }) {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)

  const submit = async () => {
    setWorking(true)
    setError('')
    try { setMessage(await (action === 'confirm' ? confirmNewsletter(token) : unsubscribeNewsletter(token))) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Please try again later.') }
    finally { setWorking(false) }
  }

  return <section className="mx-auto max-w-xl px-6 py-20 text-center">
    <h1 className="font-display text-4xl font-bold">{action === 'confirm' ? 'Confirm drop alerts' : 'Unsubscribe'}</h1>
    {!message ? <>
      <p className="mt-4 text-cocoa/70">{action === 'confirm' ? 'Confirm that you want emails when bakery treats and Journal stories drop.' : 'Stop receiving Sour Lemon drop alerts?'}</p>
      <button type="button" onClick={() => void submit()} disabled={working || !token}
        className="mt-6 rounded-full bg-flame px-6 py-3 font-semibold text-cream disabled:opacity-50">
        {working ? 'Working…' : action === 'confirm' ? 'Confirm my email' : 'Unsubscribe'}
      </button>
    </> : null}
    {message ? <p role="status" className="mt-6">{message}</p> : null}
    {error || !token ? <p role="alert" className="mt-6 text-flame">{error || 'This email link is incomplete.'}</p> : null}
    <p className="mt-8"><Link to="/" className="underline">Back to Sour Lemon</Link></p>
  </section>
}
