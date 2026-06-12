import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina clases de Tailwind resolviendo conflictos — estándar en proyectos shadcn/ui
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Formatea números con separadores de miles (locale Perú)
export function fmt(n) {
  return n.toLocaleString('es-PE')
}

// Atajo para mostrar "cantidad + unidad" ya formateado (ej: "1 200 kg")
export function qty(n, unit) {
  return `${fmt(n)} ${unit}`
}
