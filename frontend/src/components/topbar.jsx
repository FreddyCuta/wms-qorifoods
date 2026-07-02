import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useApp } from '../lib/store.jsx'

// Barra superior fija. Muestra el título de la pantalla, el botón de alertas de reabastecimiento
// (visible solo para jefe/supervisor) y el nombre del usuario activo.
export function Topbar({ title }) {
  const { currentUser, activeAlertCount } = useApp()
  const navigate = useNavigate()
  if (!currentUser) return null

  // La campana de alertas solo se muestra para el supervisor porque es quien gestiona reabastecimientos
  const showBell = currentUser.role === 'supervisor'

  return (
    <header className="fixed inset-x-0 left-60 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-8">
      <h1 className="text-lg font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-5">
        {showBell && (
          <button
            type="button"
            onClick={() => navigate('/alertas')}
            aria-label={`Alertas de reabastecimiento: ${activeAlertCount}`}
            className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-5" />
            {activeAlertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-critical text-[10px] font-bold text-critical-foreground">
                {activeAlertCount}
              </span>
            )}
          </button>
        )}
        <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
      </div>
    </header>
  )
}
