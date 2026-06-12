import { Check, X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'

// Contenedor flotante de notificaciones temporales (toasts). Se posiciona en la esquina superior derecha
// y consume el estado global toasts para mostrar mensajes de éxito o error con un icono y botón para cerrar.
export function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'flex w-[340px] items-start gap-3 rounded-lg border-l-4 bg-card p-3 shadow-lg',
            t.variant === 'success' ? 'border-l-success' : 'border-l-critical',
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white',
              t.variant === 'success' ? 'bg-success' : 'bg-critical',
            )}
          >
            {t.variant === 'success' ? <Check className="size-3" /> : <X className="size-3" />}
          </div>
          <p className="flex-1 text-sm text-foreground">{t.message}</p>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => dismissToast(t.id)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
