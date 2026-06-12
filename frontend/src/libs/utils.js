import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function fmt(n) {
  return n.toLocaleString('es-PE')
}

export function qty(n, unit) {
  return `${fmt(n)} ${unit}`
}
