import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { NAV_BY_ROLE } from '../lib/nav.js'
import { ROLE_LABEL } from '../lib/types.js'
import { cn, initials } from '../lib/utils.js'

// Menú lateral izquierdo. Muestra el logo, los enlaces de navegación filtrados según el rol del usuario
// (usando NAV_BY_ROLE, que está definido en lib/nav.js), y un footer con los datos del usuario activo
// y el botón de cerrar sesión.
export function Sidebar({ onLogout }) {
  const { currentUser } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  if (!currentUser) return null

  // Los items se obtienen del mapa NAV_BY_ROLE según el rol del usuario.
  // Cada rol tiene su propio conjunto de rutas, así el operario solo ve lo que le corresponde.
  const items = NAV_BY_ROLE[currentUser.role]

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <img src="/images/LOGO-QORI.png" alt="Qori Foods" className="mb-2 h-8 w-auto" />
        <div className="text-lg font-bold text-primary">WMS Qori Foods</div>
        <div className="text-xs text-sidebar-foreground/60">Almacén de Insumos</div>
      </div>

      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border-l-4 px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'border-l-primary bg-sidebar-accent font-medium text-white'
                      : 'border-l-transparent text-sidebar-foreground/85 hover:bg-sidebar-accent/60',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="m-2 flex items-center gap-3 rounded-md bg-sidebar-accent/50 px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {initials(currentUser.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{currentUser.nombre}</div>
          <div className="truncate text-xs text-sidebar-foreground/60">
            {ROLE_LABEL[currentUser.role]}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          className="rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-white"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
