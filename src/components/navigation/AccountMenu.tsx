import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router'
import { AccountIcon } from '@/assets/icons/AccountIcon'
import { useAuth } from '@/auth/authContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utils/cn'

interface AccountMenuProps {
  light: boolean
  glass: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountMenu({ light, glass, open, onOpenChange }: AccountMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { session, signOut } = useAuth()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [signOutError, setSignOutError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onOpenChange, open])

  const triggerClassName = cn(
    'flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:h-10 lg:w-10',
    light ? 'text-cream hover:bg-cream/15' : 'text-cocoa hover:bg-butter/60',
    glass && 'backdrop-blur-xl backdrop-saturate-150 border',
    glass &&
      (light
        ? 'border-white/10 bg-white/5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)] backdrop-brightness-75'
        : 'border-black/5 bg-white/20 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.12)] backdrop-brightness-110'),
  )

  // Signed-out visitors have exactly one thing to do here, so skip the popover
  // entirely and send them straight to the sign-in page.
  if (!session) {
    return (
      <NavLink to="/signin" aria-label="Sign in" className={triggerClassName}>
        <AccountIcon className="h-5 w-5" />
      </NavLink>
    )
  }

  const initial = session.user.name.trim().charAt(0).toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Account"
        aria-expanded={open}
        aria-controls="account-menu"
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        className={cn(triggerClassName, open && (light ? 'bg-cream/15' : 'bg-butter/60'))}
      >
        <span
          aria-hidden="true"
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold lg:h-7 lg:w-7 lg:text-sm',
            light ? 'bg-cream text-cocoa' : 'bg-flame text-cream',
          )}
        >
          {initial}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="account-menu"
            role="menu"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: -6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-52 origin-top-right rounded-2xl border-2 border-cocoa bg-cream p-2 text-cocoa shadow-chunky"
          >
            <div
              className="absolute -top-[9px] right-3 h-4 w-4 rotate-45 border-l-2 border-t-2 border-cocoa bg-cream"
              aria-hidden="true"
            />

            <div className="px-3 py-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-olive">Signed in as</p>
              <p className="mt-1 truncate font-display text-lg font-semibold">{session.user.name}</p>
            </div>

            <div className="my-1 h-px bg-cocoa/10" aria-hidden="true" />

            <NavLink
              to="/account"
              role="menuitem"
              onClick={() => onOpenChange(false)}
              className="block rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors hover:bg-butter/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
            >
              Account details
            </NavLink>

            <NavLink
              to="/orders"
              role="menuitem"
              onClick={() => onOpenChange(false)}
              className="block rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors hover:bg-butter/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
            >
              Orders
            </NavLink>

            <div className="my-1 h-px bg-cocoa/10" aria-hidden="true" />

            {signOutError ? <p role="alert" className="px-3 text-xs font-semibold text-flame">{signOutError}</p> : null}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setSignOutError(null)
                void signOut().then(() => onOpenChange(false)).catch(() => setSignOutError('Could not sign out while disconnected. Please try again.'))
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors hover:bg-butter/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
