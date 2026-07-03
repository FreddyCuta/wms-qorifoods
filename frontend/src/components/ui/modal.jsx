import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, footer, width = 480 }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface)] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="px-4 py-4 text-[13px] text-[var(--text-secondary)]">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-overlay)] px-4 py-3 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--surface-overlay)] px-4 py-3">
      {children}
    </div>
  )
}
