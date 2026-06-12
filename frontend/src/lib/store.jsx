import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  ALERTS,
  INSUMOS,
  INVENTORY,
  REQUIREMENTS,
  TASKS,
  USERS,
} from './data.js'

// Contexto global — reemplazar con llamadas a API cuando llegue el backend
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(USERS)
  const [inventory] = useState(INVENTORY) // el inventario es solo lectura por ahora
  const [insumos, setInsumos] = useState(INSUMOS)
  const [requirements, setRequirements] = useState(REQUIREMENTS)
  const [alerts, setAlerts] = useState(ALERTS)
  const [tasks, setTasks] = useState(TASKS)
  // Toasts de feedback visual — se autodestruyen a los 4 segundos
  const [toasts, setToasts] = useState([])

  // ---- Toast / feedback visual ----
  const addToast = useCallback((message, variant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  // ---- Sesión ----
  const login = useCallback((user) => setCurrentUser(user), [])
  const logout = useCallback(() => setCurrentUser(null), [])

  /* ---- Tareas / Responsabilidades ----
     Estas funciones van a mutar contra el backend cuando tengamos API.
     Por ahora todo es sobre el state local. */

  // Marca/desmarca una tarea como completada (toggle)
  const completeTask = useCallback((id) => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completada' ? 'pendiente' : 'completada' }
          : t,
      ),
    )
  }, [])

  // ---- Requerimientos ----
  // Cambia el estado del requerimiento: si algún insumo falta stock, queda como "parcial"
  const attendRequirement = useCallback((id) => {
    setRequirements((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r
        const insufficient = r.insumos.some((i) => i.stock < i.cantidad)
        return { ...r, estado: insufficient ? 'parcial' : 'atendido' }
      }),
    )
  }, [])

  // ---- Alertas ----
  // Marca una alerta como atendida con fecha y responsable (hardcodeado por ahora)
  const attendAlert = useCallback((id) => {
    setAlerts((as) =>
      as.map((a) =>
        a.id === id
          ? { ...a, atendida: { fecha: '06/06/2026 a las 14:45', por: 'María Flores' } }
          : a,
      ),
    )
  }, [])

  // ---- Usuarios ----
  // Activar / desactivar usuario (toggle)
  const toggleUserActive = useCallback((id) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))
  }, [])

  // Agregar usuario nuevo (genera un id random, el backend haría esto)
  const addUser = useCallback((u) => {
    setUsers((us) => [...us, { ...u, id: Math.random().toString(36).slice(2) }])
  }, [])

  // ---- Tareas (asignación) ----
  // Busca al usuario por id y crea una tarea con su nombre
  const assignTask = useCallback(
    (assigneeId, description) => {
      const assignee = users.find((u) => u.id === assigneeId)
      if (assignee) {
        setTasks((ts) => [
          {
            id: Math.random().toString(36).slice(2),
            assigneeId,
            assigneeName: assignee.name,
            description,
            timestamp: 'Ahora',
            status: 'pendiente',
          },
          ...ts,
        ])
      }
    },
    [users],
  )

  // ---- Insumos ----
  const addInsumo = useCallback((insumo) => {
    setInsumos((ins) => [...ins, insumo])
  }, [])

  const updateInsumo = useCallback((oldNombre, data) => {
    setInsumos((ins) =>
      ins.map((i) => (i.nombre === oldNombre ? { ...i, ...data } : i)),
    )
  }, [])

  // ---- Contadores derivados ----
  const activeAlertCount = useMemo(
    () => alerts.filter((a) => !a.atendida).length,
    [alerts],
  )
  const pendingReqCount = useMemo(
    () => requirements.filter((r) => r.estado === 'pendiente').length,
    [requirements],
  )

  // Todo lo que se expone a los componentes vía contexto
  const value = {
    currentUser,
    users,
    inventory,
    insumos,
    requirements,
    alerts,
    tasks,
    toasts,
    activeAlertCount,
    pendingReqCount,
    login,
    logout,
    addToast,
    dismissToast,
    completeTask,
    attendRequirement,
    attendAlert,
    toggleUserActive,
    addUser,
    assignTask,
    addInsumo,
    updateInsumo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook para consumir el contexto desde cualquier componente
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
