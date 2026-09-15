import logoUrl from '@/assets/SOUR LEMON LOGpng-01.PNG?url'

type WordmarkProps = {
  className?: string
  light?: boolean
}

export function Wordmark({ className = '', light = false }: WordmarkProps) {
  return (
    <span
      className={`relative inline-block aspect-[43/27] h-[2.25em] w-[3.58em] shrink-0 overflow-hidden ${light ? 'brightness-0 invert' : ''} ${className}`}
    >
      <img
        src={logoUrl}
        alt="Sour Lemon"
        draggable={false}
        className="absolute max-w-none"
        style={{ width: '407.91%', left: '-154.65%', top: '-92.59%' }}
      />
    </span>
  )
}
