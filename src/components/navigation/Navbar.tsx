import { useState } from 'react'
import { NavLink } from 'react-router'
import { Wordmark } from '@/assets/logo/Wordmark'
import { CartIcon } from '@/assets/icons/CartIcon'
import { MenuIcon } from '@/assets/icons/MenuIcon'
import { NAV_LINKS } from '@/utils/navigation'
import { cn } from '@/utils/cn'
import { useHideOnScroll } from '@/hooks/useHideOnScroll'
import { useNavOverDark } from '@/hooks/useNavOverDark'
import { useNavBandIntersects } from '@/hooks/useNavBandIntersects'
import { MobileMenu } from './MobileMenu'
import { AccountMenu } from './AccountMenu'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const scrolledHidden = useHideOnScroll()
  const collidesWithContent = useNavBandIntersects('[data-navbar-avoid="true"]')
  const hidden = scrolledHidden || collidesWithContent
  const light = useNavOverDark()

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b-2 border-transparent bg-transparent transition-transform duration-300 ease-out',
          hidden && !menuOpen && !accountMenuOpen ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:h-24 lg:px-10">
          <NavLink to="/" aria-label="Sour Lemon home">
            <Wordmark className="text-xl lg:text-2xl" light={light} />
          </NavLink>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
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

          <div className="flex items-center gap-1.5 sm:gap-3">
            <AccountMenu
              light={light}
              open={accountMenuOpen}
              onOpenChange={setAccountMenuOpen}
            />
            <button
              type="button"
              aria-label="Cart"
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors lg:h-10 lg:px-4 lg:text-base',
                light ? 'bg-cream text-cocoa hover:bg-cream/90' : 'bg-olive text-cream hover:bg-olive/90',
              )}
            >
              <CartIcon className="h-5 w-5" />
              Cart
            </button>
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:hidden',
                light ? 'text-cream hover:bg-cream/15' : 'text-cocoa hover:bg-butter/60',
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
