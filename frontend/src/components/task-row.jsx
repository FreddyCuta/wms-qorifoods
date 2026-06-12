import { Check, Circle } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'

// Fila de una tarea pendiente. El botón circular hace toggle del estado completado/no completado.
// Al marcarla como completada se tacha la descripción y se muestra visualmente el cambio.
export function TaskRow({ task }) {
  const { completeTask } = useApp()
  const done = task.status === 'completada'

  return (
    <div className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={() => completeTask(task.id)}
        aria-label={done ? 'Desmarcar como completado' : 'Marcar como completado'}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          done
            ? 'border-success bg-success text-white hover:border-success/60'
            : 'border-muted-foreground/40 text-transparent hover:border-primary',
        )}
      >
        {done ? <Check className="size-3" /> : <Circle className="size-0" />}
      </button>

      <p
        className={cn(
          'flex-1 text-sm',
          done ? 'text-muted-foreground line-through' : 'text-foreground',
        )}
      >
        {task.description}
      </p>

      <span className="shrink-0 text-xs text-muted-foreground">{task.timestamp}</span>
    </div>
  )
}
