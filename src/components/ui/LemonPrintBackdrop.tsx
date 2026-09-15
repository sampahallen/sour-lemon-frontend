import printUrl from '@/assets/LEMON PRINT-01.PNG?url'

type LemonPrintBackdropProps = {
  className?: string
}

export function LemonPrintBackdrop({ className = '' }: LemonPrintBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url("${printUrl}")` }}
    />
  )
}
