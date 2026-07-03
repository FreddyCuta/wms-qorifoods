import { cn } from '../../lib/utils.js'

const SIZE_MAP = {
  sm: 'h-7 px-[10px] text-[13px] rounded-sm',
  md: 'h-8 px-[14px] text-[13px] rounded-md',
  lg: 'h-9 px-[18px] text-[14px] rounded-md',
}

const VARIANTS = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-raised)]',
  danger: 'bg-[var(--danger-subtle)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white border border-transparent hover:border-transparent',
  outline: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--surface-raised)]',
}

export function ActionButton({ variant = 'primary', size = 'md', className, fullWidth, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        SIZE_MAP[size],
        VARIANTS[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
