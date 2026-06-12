import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './lib/store.jsx'
import LoginPage from './pages/login.jsx'
import InicioPage from './pages/inicio.jsx'
import IngresoPage from './pages/ingreso.jsx'
import InventarioPage from './pages/inventario.jsx'
import RequerimientosPage from './pages/requerimientos.jsx'
import NuevoRequerimientoPage from './pages/nuevo-requerimiento.jsx'
import AtenderRequerimientoPage from './pages/atender-requerimiento.jsx'
import AlertasPage from './pages/alertas.jsx'
import UsuariosPage from './pages/usuarios.jsx'
import ResponsabilidadesPage from './pages/responsabilidades.jsx'
import InsumosRegistroPage from './pages/insumos-registro.jsx'
import Almacen3dPage from './pages/almacen-3d.jsx'

// Componente wrapper que redirige al login si no hay sesión activa
function PrivateRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

// Definición de todas las rutas de la aplicación
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/inicio" element={<PrivateRoute><InicioPage /></PrivateRoute>} />
      <Route path="/ingreso" element={<PrivateRoute><IngresoPage /></PrivateRoute>} />
      <Route path="/inventario" element={<PrivateRoute><InventarioPage /></PrivateRoute>} />
      <Route path="/requerimientos" element={<PrivateRoute><RequerimientosPage /></PrivateRoute>} />
      <Route path="/requerimientos/nuevo" element={<PrivateRoute><NuevoRequerimientoPage /></PrivateRoute>} />
      <Route path="/requerimientos/:id/atender" element={<PrivateRoute><AtenderRequerimientoPage /></PrivateRoute>} />
      <Route path="/alertas" element={<PrivateRoute><AlertasPage /></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute><UsuariosPage /></PrivateRoute>} />
      <Route path="/responsabilidades" element={<PrivateRoute><ResponsabilidadesPage /></PrivateRoute>} />
      <Route path="/insumosRegistro" element={<PrivateRoute><InsumosRegistroPage /></PrivateRoute>} />
      <Route path="/almacen-3d" element={<PrivateRoute><Almacen3dPage /></PrivateRoute>} />
      {/* Catch-all → redirige al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Entry del router: AppProvider envuelve todo para que el contexto esté disponible globalmente
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
