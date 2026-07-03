import { cn } from '../../lib/utils.js'

const COLORS = {
  amber: 'bg-[var(--warning-subtle)] text-[var(--warning)]',
  green: 'bg-[var(--success-subtle)] text-[var(--success)]',
  red: 'bg-[var(--danger-subtle)] text-[var(--danger)]',
  blue: 'bg-[var(--info-subtle)] text-[var(--info)]',
  navy: 'bg-[var(--info-subtle)] text-[var(--info)]',
  gray: 'bg-[var(--surface-overlay)] text-[var(--text-secondary)]',
}

export function Badge({ color = 'gray', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-[6px] py-[2px] text-[11px] font-medium',
        COLORS[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
