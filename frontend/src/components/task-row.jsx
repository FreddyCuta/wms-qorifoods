import { Check, Circle } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { cn } from '../lib/utils.js'

export function TaskRow({ task }) {
  const { completeTask } = useApp()
  const done = task.status === 'completada'

  return (
    <div className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        onClick={() => completeTask(task.id)}
        aria-label={done ? 'Desmarcar como completado' : 'Marcar como completado'}
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
          done
            ? 'border-[var(--success)] bg-[var(--success)] text-white'
            : 'border-[var(--text-tertiary)] text-transparent hover:border-[var(--accent)]',
        )}
      >
        {done ? <Check className="size-2.5" /> : <Circle className="size-0" />}
      </button>

      <p
        className={cn(
          'flex-1 text-[13px]',
          done ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]',
        )}
      >
        {task.description}
      </p>

      <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">{task.timestamp}</span>
    </div>
  )
}
