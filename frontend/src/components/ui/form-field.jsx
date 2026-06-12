import { cn } from '../../lib/utils.js'

// Wrapper de formulario que muestra una label, el input hijo y un mensaje de error opcional.
// Se usa como contenedor para TextInput, SelectInput y TextArea.
export function Field({ label, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}

// Clases base compartidas entre TextInput, SelectInput y TextArea para mantener consistencia visual.
// Todas usan el mismo alto, border-radius, padding y estilos de focus.
const baseInput =
  'h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'

export function TextInput({ invalid, className, ...props }) {
  return (
    <input
      className={cn(
        baseInput,
        invalid ? 'border-critical focus:border-critical focus:ring-critical/20' : 'border-input',
        props.readOnly && 'bg-muted text-muted-foreground',
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
        'appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9',
        invalid ? 'border-critical focus:border-critical focus:ring-critical/20' : 'border-input',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a807a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
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
        'w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
        invalid ? 'border-critical focus:border-critical focus:ring-critical/20' : 'border-input',
        className,
      )}
      {...props}
    />
  )
}
