import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router'
import { useVisibleNavLinks } from '@/hooks/useVisibleNavLinks'
import { Wordmark } from '@/assets/logo/Wordmark'
import { MenuIcon } from '@/assets/icons/MenuIcon'
import { Star, Squiggle } from '@/assets/doodles/doodleIcons'
import { cn } from '@/utils/cn'

type MobileMenuProps = {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const visibleNavLinks = useVisibleNavLinks()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-cocoa/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col justify-between bg-flame px-8 py-8 text-cream shadow-2xl lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div>
              <div className="flex items-center justify-between">
                <Wordmark light className="text-lg" />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/15"
                >
                  <MenuIcon open className="h-6 w-6" />
                </button>
              </div>

              <nav className="mt-12 flex flex-col gap-6" aria-label="Mobile primary">
                {visibleNavLinks.map((link, index) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'font-display text-3xl font-bold tracking-tight text-cream/90 transition-colors hover:text-cocoa',
                        isActive && 'text-cocoa',
                      )
                    }
                    style={{ transform: `rotate(${index % 2 === 0 ? -1 : 1}deg)` }}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4 text-cream/80">
              <Star className="h-6 w-6" />
              <Squiggle className="h-3 w-16" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
