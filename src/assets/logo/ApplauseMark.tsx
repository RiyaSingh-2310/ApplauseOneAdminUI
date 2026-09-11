import { cn } from '@/lib/utils'

export function ApplauseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-5', className)} fill="none" aria-hidden="true">
      <path
        d="M8 22c2.4-1.8 4.5-4.8 5.6-9 .5-1.8.8-3.7.9-5.8h.2c.1 2.1.4 4 .9 5.8 1.1 4.2 3.2 7.2 5.6 9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="23.4" r="1.4" className="fill-gold" />
    </svg>
  )
}
