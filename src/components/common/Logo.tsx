import { Link } from 'react-router-dom'
import { ApplauseMark } from '@/assets/logo/ApplauseMark'
import { cn } from '@/lib/utils'

interface LogoProps {
  to?: string
  inverted?: boolean
  compact?: boolean
  className?: string
}

export function Logo({
  to = '/admin/dashboard',
  inverted = false,
  compact = false,
  className,
}: LogoProps) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)} aria-label="Applause One Admin">
      <span
        className={cn(
          'grid size-9 place-items-center rounded-2xl shadow-sm',
          inverted
            ? 'bg-surface text-primary'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <ApplauseMark />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span
            className={cn(
              'font-display text-[1.3rem] font-semibold tracking-tight',
              inverted ? 'text-sidebar-foreground' : 'text-foreground',
            )}
          >
            Applause One
          </span>
          <span
            className={cn(
              'mt-1 block text-[11px] tracking-[0.18em] uppercase',
              inverted ? 'text-sidebar-foreground/70' : 'text-muted-foreground',
            )}
          >
            Admin
          </span>
        </span>
      ) : null}
    </Link>
  )
}
