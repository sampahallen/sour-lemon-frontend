import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { getPublicSettings, type PublicSettings } from '@/api/settings'
import { Arrow, Sparkle, Star } from '@/assets/doodles/doodleIcons'
import { ShopIllustration } from '@/assets/illustrations/ShopIllustration'
import { Button } from '@/components/ui/Button'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
import { asset } from '@/utils/asset'
import { buildWhatsAppUrl } from '@/utils/whatsapp'

const discoveryCards = [
  {
    title: 'Bakery',
    copy: 'Celebration cakes, small treats and the current bake list.',
    to: '/bakery',
    image: '/images/hero-v2/signature-celebration-cake.png',
    color: 'bg-butter',
  },
  {
    title: 'Shop',
    copy: 'Pantry jars and playful objects from the Sour Lemon world.',
    to: '/shop',
    image: '/images/hero-v2/artisan-jam-jar.png',
    color: 'bg-flame',
  },
  {
    title: 'Journal',
    copy: 'Notes on food, memory, process and everything around the table.',
    to: '/journal',
    image: '/images/hero-v2/creative-studio.png',
    color: 'bg-olive',
  },
] as const

type ContactCardProps = {
  number: string
  title: string
  copy: string
  action: string
  color: string
  href?: string | null
  to?: string
  disabled?: boolean
}

function ContactCard({ number, title, copy, action, color, href, to, disabled }: ContactCardProps) {
  const content: ReactNode = (
    <>
      <div className="flex items-start justify-between gap-5">
        <span className="font-display text-sm font-extrabold opacity-55">{number}</span>
        <Arrow className="h-7 w-12 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <div className="mt-20">
        <h2 className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-md leading-relaxed opacity-75">{copy}</p>
        <p className="mt-6 font-display text-sm font-bold underline decoration-2 underline-offset-4">{action}</p>
      </div>
    </>
  )

  const classes = `group flex min-h-80 flex-col rounded-[2rem] border-2 border-cocoa p-7 shadow-chunky transition-transform duration-300 motion-safe:hover:-translate-y-1 ${color}`

  if (to) return <Link to={to} className={classes}>{content}</Link>
  if (href && !disabled) return <a href={href} target="_blank" rel="noreferrer" className={classes}>{content}</a>
  return <div className={`${classes} cursor-not-allowed opacity-65`}>{content}</div>
}

export function Contact() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getPublicSettings(controller.signal)
      .then(setSettings)
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'Contact details are unavailable.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  const phoneNumber = settings?.businessWhatsappNumber ?? null
  const whatsappReady = Boolean(phoneNumber)
  const orderUrl = buildWhatsAppUrl(phoneNumber, 'Hi Sour Lemon! I need help with an order. My order number is: ')
  const collaborationUrl = buildWhatsAppUrl(phoneNumber, 'Hi Sour Lemon! I would love to talk about a collaboration.')
  const helloUrl = buildWhatsAppUrl(phoneNumber, 'Hi Sour Lemon! I would like to say hello and ask a question.')
  const whatsappAction = isLoading ? 'Loading WhatsApp…' : whatsappReady ? 'Chat on WhatsApp' : 'WhatsApp is being configured'

  return (
    <div className="min-h-screen bg-cream pb-24">
      <header
        data-navbar-theme="dark"
        className="relative isolate -mt-20 overflow-hidden rounded-b-[2.75rem] bg-cocoa pt-20 text-cream lg:-mt-24 lg:rounded-b-[4.5rem] lg:pt-24"
      >
        <LemonPrintBackdrop className="opacity-[0.08] mix-blend-screen" />
        <Star className="absolute left-[7%] top-[30%] h-9 w-9 rotate-12 text-butter/60" />
        <Sparkle className="absolute right-[8%] top-[20%] h-11 w-11 text-flame/70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-20">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-butter sm:text-sm">Our door is open</span>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(4.5rem,11vw,9rem)] font-extrabold leading-[0.78] tracking-[-0.07em]">
              Let&apos;s<br />talk<span className="text-flame">.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
              Orders, custom cakes, collaborations or a simple hello—choose the right door and we&apos;ll take it from there.
            </p>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[24rem]">
            <div className="absolute inset-4 rotate-6 rounded-full bg-flame" />
            <div className="absolute inset-9 -rotate-6 rounded-full bg-butter" />
            <ShopIllustration className="relative h-full w-full drop-shadow-[7px_9px_0_rgba(0,0,0,0.16)]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-14 lg:px-10 lg:pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Choose an inquiry</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-cocoa sm:text-6xl">What can we help with?</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cocoa/60">WhatsApp opens with a helpful starter message. You can edit it before sending.</p>
        </div>

        {error ? (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border-2 border-flame/25 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-flame">{error}</p>
            <Button variant="outline" accent="cocoa" onClick={() => window.location.reload()}>Try again</Button>
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2" aria-label="Contact options">
          <ContactCard
            number="01"
            title="Order help"
            copy="Questions about an order, payment or collection? Have your order number ready so we can help quickly."
            action={whatsappAction}
            color="bg-butter text-cocoa"
            href={orderUrl}
            disabled={!whatsappReady || isLoading}
          />
          <ContactCard
            number="02"
            title="Custom cakes"
            copy="Tell us what you are celebrating, when you need it and what you have in mind through our dedicated request form."
            action="Start a cake request"
            color="bg-flame text-cream"
            to="/custom-cake"
          />
          <ContactCard
            number="03"
            title="Collaborations"
            copy="Artists, brands and playful thinkers: share the shape of your idea and let&apos;s see what we can make together."
            action={whatsappAction}
            color="bg-olive text-cream"
            href={collaborationUrl}
            disabled={!whatsappReady || isLoading}
          />
          <ContactCard
            number="04"
            title="Just saying hi"
            copy="Questions, kind words or something that does not fit another box are always welcome here."
            action={whatsappAction}
            color="bg-white text-cocoa"
            href={helloUrl}
            disabled={!whatsappReady || isLoading}
          />
        </section>

        <section className="mt-20" aria-labelledby="discover-heading">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Keep exploring</span>
              <h2 id="discover-heading" className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-cocoa sm:text-6xl">See what&apos;s cooking.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-cocoa/60">A few more ways into the food, objects and ideas we are making.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {discoveryCards.map((card, index) => (
              <Link
                key={card.title}
                to={card.to}
                className={`group relative isolate min-h-[24rem] overflow-hidden rounded-[2rem] border-2 border-cocoa shadow-chunky ${card.color}`}
              >
                <img
                  src={asset(card.image)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain p-7 transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/5 to-transparent" />
                <span className="absolute right-5 top-5 rounded-full border-2 border-cocoa bg-cream px-3 py-1 font-display text-xs font-bold text-cocoa">
                  0{index + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl font-extrabold">{card.title}</h3>
                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-cream/75">{card.copy}</p>
                    </div>
                    <Arrow className="h-7 w-12 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
