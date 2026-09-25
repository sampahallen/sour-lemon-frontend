import { Link } from 'react-router'
import { LuInstagram } from 'react-icons/lu'
import { FaTiktok, FaPinterest } from 'react-icons/fa'
import { Star, Sparkle } from '@/assets/doodles/doodleIcons'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { Button } from '@/components/ui/Button'
import { useVisibleNavLinks } from '@/hooks/useVisibleNavLinks'

export function Footer() {
  const visibleNavLinks = useVisibleNavLinks()
  const shopLinks = visibleNavLinks.filter((link) => link.to === '/bakery' || link.to === '/shop')
  const infoLinks = visibleNavLinks.filter((link) => link.to !== '/bakery' && link.to !== '/shop')

  return (
    <footer data-navbar-theme="dark" className="relative bg-cocoa text-cream">
      <SectionDivider color="cocoa" className="bg-cream" />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-2 lg:px-10">
        <div className="grid gap-12 border-b border-cream/15 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-cream">
              Sour <span className="text-butter">Lemon</span>
            </p>
            <p className="mt-4 max-w-xs text-sm text-cream/70">
              A world where food, art and play come together — cakes, jams, collabs and a little
              bit of nostalgia, made by hand.
            </p>
            <div className="mt-6 flex items-center gap-2 text-cream/80">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="rounded-full p-2 transition-colors hover:bg-cream/10 hover:text-flame"
              >
                <LuInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com"
                aria-label="TikTok"
                className="rounded-full p-2 transition-colors hover:bg-cream/10 hover:text-flame"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
              <a
                href="https://pinterest.com"
                aria-label="Pinterest"
                className="rounded-full p-2 transition-colors hover:bg-cream/10 hover:text-flame"
              >
                <FaPinterest className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-butter">Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              {shopLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-flame">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-butter">Info</h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              {infoLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-flame">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-butter">
              Stay in the loop
            </h3>
            <p className="mt-3 text-sm text-cream/70">
              Drops, collabs and journal notes — no spam, just lemons.
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@email.com"
                className="w-full rounded-full border-2 border-cream/25 bg-cream/5 px-5 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-flame focus:outline-none"
              />
              <Button type="submit" size="md" className="shrink-0">
                Join
              </Button>
            </form>
            <Star className="pointer-events-none absolute -right-2 -top-6 hidden h-8 w-8 text-butter/70 lg:block" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Sour Lemon. Made by hand, with a little zest.</p>
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-flame/70" />
            <span>Food, art &amp; play</span>
            <Sparkle className="h-4 w-4 text-flame/70" />
          </div>
        </div>
      </div>
    </footer>
  )
}
