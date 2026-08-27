import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { EyeIcon } from '@/assets/icons/EyeIcon'
import { EyeOffIcon } from '@/assets/icons/EyeOffIcon'
import { cn } from '@/utils/cn'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordField({ className, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        id={id}
        type={visible ? 'text' : 'password'}
        className={cn(className, 'pr-12')}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={id}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-cocoa/50 transition-colors hover:text-cocoa"
      >
        {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  )
}
