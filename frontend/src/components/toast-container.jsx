import { Check, X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'

export function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'flex w-[340px] items-start gap-3 rounded-md border bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)]',
            t.variant === 'success' ? 'border-l-[3px] border-l-[var(--success)]' : 'border-l-[3px] border-l-[var(--danger)]',
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm text-white',
              t.variant === 'success' ? 'bg-[var(--success)]' : 'bg-[var(--danger)]',
            )}
          >
            {t.variant === 'success' ? <Check className="size-2.5" /> : <X className="size-2.5" />}
          </div>
          <p className="flex-1 text-[13px] text-[var(--text-primary)]">{t.message}</p>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => dismissToast(t.id)}
            className="text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
