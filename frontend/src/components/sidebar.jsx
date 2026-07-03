import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { NAV_BY_ROLE } from '../lib/nav.js'
import { ROLE_LABEL } from '../lib/types.js'
import { cn, initials } from '../lib/utils.js'

export function Sidebar({ onLogout }) {
  const { currentUser } = useApp()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  if (!currentUser) return null

  const items = NAV_BY_ROLE[currentUser.role]

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col px-3 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <img src="/images/LOGO-QORI.png" alt="Qori Foods" className="h-7 w-auto" />
          <span className="text-[13px] font-medium text-sidebar-accent-foreground/90">WMS Qori Foods</span>
        </div>
        <span className="mt-0.5 text-[11px] text-sidebar-foreground/60">Almacén de Insumos</span>
      </div>

      <nav className="flex-1 px-0">
        <ul className="flex flex-col">
          {items.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex w-full items-center gap-2.5 border-l-2 px-3 text-left text-[13px] transition-colors h-8',
                    active
                      ? 'border-l-[var(--sidebar-accent)] bg-[var(--sidebar-item-active)] text-sidebar-accent-foreground font-medium'
                      : 'border-l-transparent text-sidebar-foreground/80 hover:bg-[var(--sidebar-item-hover)]',
                  )}
                >
                  <Icon className="size-[15px] shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="h-px bg-white/5 mx-3" />

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center bg-sidebar-accent/20 text-[11px] font-semibold text-sidebar-accent-foreground/80">
          {initials(currentUser.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-medium text-sidebar-accent-foreground/80">{currentUser.nombre}</div>
          <div className="truncate text-[11px] text-sidebar-foreground/50">{ROLE_LABEL[currentUser.role]}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          className="rounded p-1 text-sidebar-foreground/50 transition-colors hover:text-sidebar-accent-foreground/80"
        >
          <LogOut className="size-[14px]" />
        </button>
      </div>
    </aside>
  )
}
