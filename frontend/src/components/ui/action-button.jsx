import { cn } from '../../lib/utils.js'

// Mapa de variantes visuales para el botón. Cada variante define colores de fondo, texto,
// hover y focus-visible. Así podemos tener botones primary, ghost, danger y outline de forma consistente.
const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/40',
  ghost: 'bg-transparent text-foreground hover:bg-muted focus-visible:ring-ring/30',
  danger: 'bg-critical text-critical-foreground hover:bg-critical/90 focus-visible:ring-critical/40',
  outline: 'border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring/30',
}

// Botón reutilizable con variantes visuales. Soporta fullWidth y cualquier prop extra que se le pase.
// Por defecto usa la variante 'primary' si no se especifica otra.
export function ActionButton({ variant = 'primary', className, fullWidth, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        VARIANTS[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
