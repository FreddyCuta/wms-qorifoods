import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { ROLE_LABEL } from '../lib/types.js'
import { Sidebar } from './sidebar.jsx'
import { Topbar } from './topbar.jsx'
import { ToastContainer } from './toast-container.jsx'
import { Modal, ModalFooter } from './ui/modal.jsx'
import { ActionButton } from './ui/action-button.jsx'
import { cn } from '../lib/utils.js'

const ROLES = ['jefe', 'supervisor', 'operario']

export function AppShell({ title, children, allowedRoles }) {
  const { currentUser, logout, setRole } = useApp()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true })
  }, [currentUser, navigate])

  useEffect(() => {
    if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
      navigate('/inicio', { replace: true })
    }
  }, [currentUser, allowedRoles, navigate])

  if (!currentUser) return null
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={() => setLogoutOpen(true)} />
      <Topbar title={title} />
      <main className="ml-60 min-h-screen pt-16">
        <div className="p-8">{children}</div>
      </main>

      {/* Demo role switcher */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-md">
        <span className="px-2 text-xs text-muted-foreground">Demo · Rol:</span>
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              currentUser.role === r
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {ROLE_LABEL[r].replace(' de Almacén', '')}
          </button>
        ))}
      </div>

      <ToastContainer />

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Cerrar sesión" width={420}>
        <p className="text-sm text-muted-foreground">¿Desea cerrar su sesión actual?</p>
        <ModalFooter>
          <ActionButton variant="ghost" onClick={() => setLogoutOpen(false)}>
            Cancelar
          </ActionButton>
          <ActionButton
            onClick={() => {
              setLogoutOpen(false)
              logout()
            }}
          >
            Cerrar sesión
          </ActionButton>
        </ModalFooter>
      </Modal>
    </div>
  )
}
