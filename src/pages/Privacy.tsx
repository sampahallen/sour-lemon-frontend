import { Link } from 'react-router'

export function Privacy() {
  return <article className="mx-auto max-w-3xl px-6 py-16 leading-relaxed">
    <h1 className="font-display text-4xl font-bold">Drop alert privacy notice</h1>
    <p className="mt-6">When you subscribe to Sour Lemon drop alerts, we use your email address to let you know when new bakery treats and Journal stories go live. We record when you request and confirm your subscription so we can honor your choice.</p>
    <p className="mt-4">We use our email provider to deliver these messages. After you unsubscribe, we keep a suppression record so we do not send to you again. You can ask us to remove your subscription data. Unsubscribing does not affect your account or orders.</p>
    <p className="mt-4">To ask about or request removal of your subscription data, use the contact details in an alert email or <Link to="/contact" className="underline">contact Sour Lemon</Link>.</p>
  </article>
}
