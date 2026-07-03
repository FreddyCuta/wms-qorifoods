import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useApp } from '../lib/store.jsx'

export function Topbar({ title }) {
  const { currentUser, activeAlertCount } = useApp()
  const navigate = useNavigate()
  if (!currentUser) return null

  const showBell = currentUser.role === 'supervisor'

  return (
    <header className="fixed inset-x-0 left-[220px] top-0 z-20 flex h-11 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)] px-6">
      <h1 className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</h1>
      <div className="flex items-center gap-3">
        {showBell && (
          <button
            type="button"
            onClick={() => navigate('/alertas')}
            aria-label={`Alertas de reabastecimiento: ${activeAlertCount}`}
            className="relative rounded p-1 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <Bell className="size-[18px]" />
            {activeAlertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-medium text-white">
                {activeAlertCount}
              </span>
            )}
          </button>
        )}
        <div className="h-4 w-px bg-[var(--border-subtle)]" />
        <span className="text-[13px] text-[var(--text-secondary)]">{currentUser.nombre}</span>
      </div>
    </header>
  )
}
