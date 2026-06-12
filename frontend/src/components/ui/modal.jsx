import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full rounded-xl border border-border bg-card p-6 shadow-xl"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground text-balance">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export function ModalFooter({ children }) {
  return (
    <div className={cn('mt-6 flex items-center justify-end gap-2')}>
      {children}
    </div>
  )
}
