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

// Convierte fecha DD/MM/YYYY a objeto Date
export function parseDate(d) {
  if (!d) return new Date(NaN)
  if (d.includes('-')) {
    const [year, month, day] = d.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  const [day, month, year] = d.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Días restantes hasta una fecha (opcional: fecha base para testing)
export function daysUntil(d, from = new Date()) {
  const target = parseDate(d)
  if (isNaN(target)) return Infinity
  const base = new Date(from)
  base.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - base) / 86400000)
}

// Mapa nombre → ID de insumo (se construye al importar)
const nombreAId = {}
const idANombre = {}

export function initInsumoMap(insumos) {
  for (const i of insumos) {
    nombreAId[i.nombre] = i.id
    idANombre[i.id] = i.nombre
  }
}

export function insumoId(nombre) { return nombreAId[nombre] }
export function insumoName(id) { return idANombre[id] }

// Extrae las iniciales de un nombre (hasta 2 palabras) — ej: "María Flores" → "MF"
export function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
