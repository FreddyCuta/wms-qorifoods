import { cn } from '../../lib/utils.js'

const COLORS = {
  amber: 'bg-warning/12 text-warning',
  green: 'bg-success/12 text-success',
  red: 'bg-critical/12 text-critical',
  blue: 'bg-info/12 text-info',
  navy: 'bg-navy/12 text-navy',
  gray: 'bg-muted text-muted-foreground',
}

export function Badge({ color = 'gray', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        COLORS[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
