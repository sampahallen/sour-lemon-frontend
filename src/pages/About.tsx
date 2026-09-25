import { Sparkle, Star, Squiggle, WavyLine } from '@/assets/doodles/doodleIcons'
import { Button } from '@/components/ui/Button'
import { LemonPrintBackdrop } from '@/components/ui/LemonPrintBackdrop'
import { asset } from '@/utils/asset'

const principles = [
  {
    number: '01',
    title: 'Small-batch care',
    copy: 'We make in thoughtful quantities, paying attention to the details that make every bite and object feel personal.',
    color: 'bg-flame text-cream',
  },
  {
    number: '02',
    title: 'Memory as material',
    copy: 'The flavors, colors and everyday objects we grew up around become starting points for something fresh.',
    color: 'bg-butter text-cocoa',
  },
  {
    number: '03',
    title: 'Food as expression',
    copy: 'A cake can carry an idea. A jar can hold a season. We treat food, art and play as parts of the same world.',
    color: 'bg-olive text-cream',
  },
]

export function About() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      <header
        data-navbar-theme="dark"
        className="relative isolate -mt-20 overflow-hidden rounded-b-[2.75rem] bg-olive pt-20 text-cream lg:-mt-24 lg:rounded-b-[4.5rem] lg:pt-24"
      >
        <LemonPrintBackdrop className="opacity-[0.09] mix-blend-screen" />
        <Star className="absolute left-[6%] top-[30%] h-9 w-9 rotate-12 text-butter/65" />
        <Sparkle className="absolute right-[8%] top-[18%] h-11 w-11 text-flame/70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-24">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-butter sm:text-sm">Made in Accra</span>
            <h1 className="mt-5 font-display text-[clamp(4rem,9vw,8rem)] font-extrabold leading-[0.8] tracking-[-0.065em]">
              A little<br />sour<span className="text-flame">.</span><br />A lot of joy<span className="text-butter">.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              Sour Lemon is where playful food meets art, design and nostalgia—made by hand and meant to be remembered.
            </p>
          </div>

          <div className="relative mx-auto min-h-[28rem] w-full max-w-[38rem] sm:min-h-[35rem]">
            <div className="absolute left-0 top-4 w-[62%] rotate-[-5deg] overflow-hidden rounded-[2rem] border-2 border-cocoa bg-butter shadow-chunky">
              <img src={asset('/images/hero-v2/signature-celebration-cake.png')} alt="A playful Sour Lemon celebration cake" className="aspect-[4/5] w-full object-contain p-5" />
            </div>
            <div className="absolute bottom-2 right-0 w-[58%] rotate-6 overflow-hidden rounded-[2rem] border-2 border-cocoa bg-flame shadow-chunky">
              <img src={asset('/images/hero-v2/artisan-jam-jar.png')} alt="A small-batch Sour Lemon pantry jar" className="aspect-square w-full object-contain p-5" />
            </div>
            <span className="absolute right-[4%] top-[8%] rounded-full border-2 border-cocoa bg-cream px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-cocoa shadow-chunky-sm">
              Food · art · play
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Our point of view</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-cocoa sm:text-6xl">The things we remember deserve new forms.</h2>
            <Squiggle className="mt-7 h-5 w-28 text-olive" />
          </div>
          <div className="space-y-6 text-lg leading-8 text-cocoa/75 sm:text-xl sm:leading-9">
            <p>
              Childhood flavors, familiar colors, the pleasure of a shared table—Sour Lemon turns those feelings into cakes, pantry treats and thoughtful goods.
            </p>
            <p>
              We are interested in the space where food becomes a keepsake and everyday nostalgia becomes something you can taste, hold or give away.
            </p>
            <p>
              The result is bright but grounded, playful but carefully made: a growing world shaped in Accra and open to collaboration.
            </p>
          </div>
        </section>

        <section className="bg-cocoa py-20 text-cream lg:py-28" aria-labelledby="principles-heading">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-butter">What guides us</span>
                <h2 id="principles-heading" className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">Our recipe, roughly.</h2>
              </div>
              <WavyLine className="h-6 w-32 text-flame" />
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {principles.map((principle) => (
                <article key={principle.number} className={`min-h-80 rounded-[2rem] border-2 border-cream/80 p-7 ${principle.color}`}>
                  <span className="font-display text-sm font-extrabold opacity-65">{principle.number}</span>
                  <h3 className="mt-20 font-display text-3xl font-extrabold leading-none">{principle.title}</h3>
                  <p className="mt-5 leading-relaxed opacity-80">{principle.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[2.5rem] border-2 border-cocoa bg-butter shadow-chunky">
            <img
              src={asset('/images/about/founder-placeholder.png')}
              alt="Editorial placeholder portrait of a fictional adult Black woman"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/35 via-transparent to-transparent" />
            <span className="absolute left-6 top-6 rounded-full border-2 border-cocoa bg-cream px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-cocoa">
              Concept portrait
            </span>
          </div>
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-flame">Meet the maker</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] text-cocoa sm:text-6xl">The person behind the world.</h2>
            <p className="mt-6 text-lg leading-8 text-cocoa/70">
              A personal founder story and portrait will live here. For now, this space marks the hands, memories and point of view behind every Sour Lemon idea without filling in details that have not yet been told.
            </p>
            <p className="mt-5 rounded-[1.5rem] border-2 border-cocoa/15 bg-white p-5 text-sm font-semibold leading-relaxed text-cocoa/60">
              This is a fictional placeholder image, not the founder. Their real portrait, name and biography are coming soon.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-cocoa bg-flame px-6 py-12 text-cream shadow-chunky sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
            <Star className="absolute right-[8%] top-6 h-8 w-8 rotate-12 text-butter/60" />
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-butter">Come further in</span>
              <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">Taste the story, read the notes, or say hello.</h2>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
              <Button to="/bakery">Visit the Bakery</Button>
              <Button to="/journal" variant="outline" accent="cream">Read the Journal</Button>
              <Button to="/contact" variant="outline" accent="cream">Contact us</Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
