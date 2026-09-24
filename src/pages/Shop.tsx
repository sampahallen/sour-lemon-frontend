import { Link } from 'react-router'
import { Sparkle, Star, Squiggle } from '@/assets/doodles/doodleIcons'
import { ShopIllustration } from '@/assets/illustrations/ShopIllustration'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
import { asset } from '@/utils/asset'
import { cn } from '@/utils/cn'

const collections = [
  {
    id: 'pantry',
    eyebrow: 'Small-batch pantry',
    title: 'Spread a little joy.',
    description: 'Jams, syrups and bright things for toast, cake and late-night spoonfuls.',
    image: '/images/hero-v2/artisan-jam-jar.png',
    to: '/jams',
    action: 'Preview the pantry',
    className: 'bg-flame text-cream lg:col-span-7',
    imageClassName: 'max-h-[22rem] lg:max-h-[26rem]',
  },
  {
    id: 'wearables',
    eyebrow: 'Wear the feeling',
    title: 'Memory, but make it merch.',
    description: 'T-shirts, totes and small-run pieces inspired by Ghanaian nostalgia.',
    image: '/images/hero-v2/ghanaian-memory-tshirt.png',
    to: '/merch',
    action: 'See what is coming',
    className: 'bg-butter text-cocoa lg:col-span-5',
    imageClassName: 'max-h-[20rem] lg:max-h-[23rem]',
  },
  {
    id: 'studio',
    eyebrow: 'From the studio',
    title: 'Good ideas, made tangible.',
    description: 'Prints, playful objects and collaborative experiments from our creative table.',
    image: '/images/hero-v2/creative-studio.png',
    to: '/collabs',
    action: 'Explore the studio',
    className: 'bg-olive text-cream lg:col-span-12',
    imageClassName: 'max-h-[20rem] lg:max-h-[25rem]',
  },
]

export function Shop() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      <header
        data-navbar-theme="dark"
        className="relative isolate -mt-20 overflow-hidden rounded-b-[2.5rem] bg-cocoa pt-20 text-cream lg:-mt-24 lg:rounded-b-[4rem] lg:pt-24"
      >
        <LemonPrintBackdrop className="opacity-10 mix-blend-screen" />
        <Star className="absolute left-[8%] top-[30%] h-8 w-8 rotate-12 text-butter/60" />
        <Sparkle className="absolute right-[8%] top-[25%] h-10 w-10 text-flame/70" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:px-10 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-3 font-display text-xs font-bold uppercase tracking-[0.22em] text-butter sm:text-sm">
              <span className="h-px w-8 bg-butter" aria-hidden="true" />
              The first drop is taking shape
            </span>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(4rem,10vw,8.5rem)] font-extrabold leading-[0.78] tracking-[-0.065em]">
              The Shop<span className="text-flame">.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-cream/80 sm:text-lg lg:text-xl">
              A general store for pantry treats, wearable memories and playful things from the Sour Lemon world.
            </p>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[20rem]">
            <div className="absolute inset-2 -rotate-6 rounded-full bg-flame" />
            <div className="absolute inset-7 rotate-6 rounded-full bg-butter" />
            <ShopIllustration className="relative h-full w-full drop-shadow-[8px_10px_0_rgba(0,0,0,0.14)]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <nav
          aria-label="Shop collections"
          className="overflow-x-auto rounded-[1.75rem] border border-cocoa/15 bg-cream px-4 py-4 shadow-[0_8px_30px_rgba(74,44,29,0.06)] sm:px-5"
        >
          <div className="flex w-max items-center gap-2">
            <a href="#collections" className="rounded-full border-2 border-cocoa bg-cocoa px-5 py-2.5 font-display text-sm font-bold text-cream">
              All goods
            </a>
            {collections.map((collection) => (
              <a
                key={collection.id}
                href={`#${collection.id}`}
                className="rounded-full border-2 border-transparent bg-butter/45 px-5 py-2.5 font-display text-sm font-bold text-cocoa transition-colors hover:border-cocoa/30"
              >
                {collection.id === 'pantry' ? 'Pantry' : collection.id === 'wearables' ? 'Wearables' : 'Art & play'}
              </a>
            ))}
          </div>
        </nav>

        <section id="collections" className="mt-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Browse the shelves</span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-cocoa sm:text-5xl">Pick your corner.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-cocoa/60">
              Preview the collections now. The shop opens when the first limited drop is ready.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            {collections.map((collection) => (
              <article
                key={collection.id}
                id={collection.id}
                className={cn(
                  'group relative isolate min-h-[32rem] scroll-mt-28 overflow-hidden rounded-[2.25rem] border-2 border-cocoa p-6 shadow-chunky sm:p-8 lg:min-h-[36rem]',
                  collection.className,
                )}
              >
                <div className="relative z-10 max-w-xl rounded-[1.5rem] bg-cream/90 p-4 text-cocoa backdrop-blur-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:text-inherit sm:backdrop-blur-none">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.18em] opacity-75">{collection.eyebrow}</span>
                  <h3 className="mt-3 font-display text-3xl font-extrabold leading-[0.9] tracking-[-0.04em] sm:text-5xl">{collection.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed opacity-80 sm:text-base">{collection.description}</p>
                </div>

                <img
                  src={asset(collection.image)}
                  alt=""
                  loading="lazy"
                  className={cn(
                    'pointer-events-none absolute bottom-8 right-1/2 z-0 w-[78%] translate-x-1/2 object-contain transition-transform duration-700 motion-safe:group-hover:scale-[1.04] sm:right-8 sm:w-[55%] sm:translate-x-0 lg:w-[48%]',
                    collection.imageClassName,
                    collection.id === 'studio' && 'sm:right-4 lg:right-10 lg:w-[42%]',
                  )}
                />

                <Link
                  to={collection.to}
                  className="absolute bottom-6 left-6 z-20 inline-flex items-center gap-2 rounded-full border-2 border-current bg-cream px-5 py-3 font-display text-sm font-bold text-cocoa transition-transform motion-safe:hover:-translate-y-0.5 sm:bottom-8 sm:left-8"
                >
                  {collection.action} <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[2.5rem] bg-cocoa px-6 py-10 text-cream sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-12 lg:py-12">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-butter">Hungry right now?</span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] sm:text-4xl">The Bakery counter is open.</h2>
          </div>
          <Link
            to="/bakery"
            className="mt-7 inline-flex items-center rounded-full border-2 border-cream bg-flame px-6 py-3 font-display text-sm font-bold text-cream shadow-[3px_3px_0_0_#f8f0c9] transition-transform motion-safe:hover:translate-x-0.5 motion-safe:hover:translate-y-0.5 lg:mt-0"
          >
            Shop today&apos;s treats
          </Link>
        </section>

        <div className="mt-10 flex items-center justify-center gap-4 text-flame/70">
          <Squiggle className="h-5 w-20" />
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em]">Food, art & play</span>
          <Squiggle className="h-5 w-20 -scale-x-100" />
        </div>
      </main>
    </div>
  )
}
