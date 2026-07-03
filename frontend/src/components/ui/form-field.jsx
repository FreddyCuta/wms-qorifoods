import { cn } from '../../lib/utils.js'

export function Field({ label, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-[4px]', className)}>
      <label className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
      {error && <p className="text-[11px] text-[var(--danger)]" style={{ marginTop: '3px' }}>{error}</p>}
    </div>
  )
}

const baseInput =
  'h-8 w-full rounded-md border bg-[var(--surface-overlay)] px-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]'

export function TextInput({ invalid, className, ...props }) {
  return (
    <input
      className={cn(
        baseInput,
        invalid ? 'border-[var(--danger)]' : 'border-[var(--border-default)]',
        props.readOnly && 'bg-[var(--surface-raised)] text-[var(--text-tertiary)]',
        className,
      )}
      {...props}
    />
  )
}

export function SelectInput({ invalid, className, children, ...props }) {
  return (
    <select
      className={cn(
        baseInput,
        'appearance-none bg-[length:14px] bg-[right_0.5rem_center] bg-no-repeat pr-8',
        invalid ? 'border-[var(--danger)]' : 'border-[var(--border-default)]',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238f8f8a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
}

export function TextArea({ invalid, className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full min-h-[72px] rounded-md border bg-[var(--surface-overlay)] px-2 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]',
        invalid ? 'border-[var(--danger)]' : 'border-[var(--border-default)]',
        className,
      )}
      {...props}
    />
  )
}
