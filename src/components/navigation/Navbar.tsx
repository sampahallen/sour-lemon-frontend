import { useState } from 'react'
import { NavLink } from 'react-router'
import { Wordmark } from '@/assets/logo/Wordmark'
import { CartIcon } from '@/assets/icons/CartIcon'
import { MenuIcon } from '@/assets/icons/MenuIcon'
import { cn } from '@/utils/cn'
import { useHideOnScroll } from '@/hooks/useHideOnScroll'
import { useNavOverDark } from '@/hooks/useNavOverDark'
import { useNavBandIntersects } from '@/hooks/useNavBandIntersects'
import { useVisibleNavLinks } from '@/hooks/useVisibleNavLinks'
import { useCart } from '@/cart/cartContext'
import { MobileMenu } from './MobileMenu'
import { AccountMenu } from './AccountMenu'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { itemCount, toggleCart } = useCart()
  const scrolledHidden = useHideOnScroll()
  const collidesWithContent = useNavBandIntersects('[data-navbar-avoid="true"]')
  const hidden = scrolledHidden || collidesWithContent
  const light = useNavOverDark()
  const overHero = useNavBandIntersects('#home-hero')
  const glass = !overHero
  const visibleNavLinks = useVisibleNavLinks()

  // Liquid-glass backing for the individual controls — the bar itself stays
  // transparent, but the logo, links, and every icon button get a frosted pill
  // for legibility once they're over page content instead of the hero.
  const glassClassName = cn(
    'transition-[background-color,box-shadow,border-color] duration-300 ease-out',
    glass && 'backdrop-blur-xl backdrop-saturate-150 border',
    glass &&
      (light
        ? 'border-white/10 bg-white/5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)] backdrop-brightness-75'
        : 'border-black/5 bg-white/20 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)] backdrop-brightness-110'),
  )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out',
          hidden && !menuOpen && !accountMenuOpen ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:h-24 lg:px-10">
          <NavLink
            to="/"
            aria-label="Sour Lemon home"
            className={cn('rounded-full px-4 py-2', glassClassName)}
          >
            <Wordmark className="text-xl lg:text-2xl" light={light} />
          </NavLink>

          {visibleNavLinks.length > 0 ? (
            <nav
              className={cn('hidden items-center gap-8 rounded-full px-6 py-2.5 lg:flex', glassClassName)}
              aria-label="Primary"
            >
              {visibleNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'font-display text-base font-semibold transition-colors',
                      light ? 'text-cream hover:text-butter' : 'text-cocoa hover:text-flame',
                      isActive && (light ? 'text-butter' : 'text-flame'),
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-1.5 sm:gap-3">
            <AccountMenu
              light={light}
              glass={glass}
              open={accountMenuOpen}
              onOpenChange={setAccountMenuOpen}
            />
            <button
              type="button"
              aria-label={itemCount > 0 ? `Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Cart'}
              onClick={toggleCart}
              className={cn(
                'relative flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors lg:h-10 lg:px-4 lg:text-base',
                light ? 'text-cream hover:bg-cream/15' : 'text-cocoa hover:bg-butter/60',
                glassClassName,
              )}
            >
              <CartIcon className="h-5 w-5" />
              Cart
              {itemCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-flame px-1 font-display text-xs font-bold text-cream"
                >
                  {itemCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:hidden',
                light ? 'text-cream hover:bg-cream/15' : 'text-cocoa hover:bg-butter/60',
                glassClassName,
              )}
            >
              <MenuIcon open={menuOpen} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="h-20 lg:h-24" aria-hidden="true" />
    </>
  )
}
