import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { Sidebar } from './sidebar.jsx'
import { Topbar } from './topbar.jsx'
import { ToastContainer } from './toast-container.jsx'
import { Modal, ModalFooter } from './ui/modal.jsx'
import { ActionButton } from './ui/action-button.jsx'

// Layout principal que envuelve cada pantalla protegida.
// Renderiza el sidebar, la topbar, el contenedor de toasts y un modal de confirmación para cerrar sesión.
// También se encarga de redirigir si el usuario no está autenticado o no tiene el rol adecuado.
export function AppShell({ title, children, allowedRoles }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    if (!currentUser) navigate('/', { replace: true })
  }, [currentUser, navigate])

  // Si el componente recibe allowedRoles, verificamos que el rol del usuario esté permitido.
  // Esto sirve para restringir pantallas completas por rol sin tener que hacerlo manual en cada ruta.
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

      <ToastContainer />

      {/* Modal de confirmación al cerrar sesión — lo controla el sidebar via onLogout */}
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
