import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
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
  const [inventory, setInventory] = useState(INVENTORY)
  const [insumos, setInsumos] = useState(INSUMOS)
  const [requirements, setRequirements] = useState(REQUIREMENTS)
  const [tasks, setTasks] = useState(TASKS)
  // Alertas atendidas: mapa de insumo → { fecha, por }
  const [attendedAlerts, setAttendedAlerts] = useState({})
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
  // Atiende un requerimiento: descuenta inventario, acumula atendido por insumo y guarda historial
  // salidaQtys: mapa de insumo → cantidad a despachar en esta atención
  const attendRequirement = useCallback((id, salidaQtys, currentUser) => {
    const ahora = new Date()
    const fecha = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${ahora.getFullYear()} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`

    setInventory((inv) => {
      const used = {}
      return inv.map((lot) => {
        const qtyToTake = salidaQtys[lot.insumo]
        if (!qtyToTake || lot.cantidad <= 0) return lot
        const alreadyTaken = used[lot.codigoLote] || 0
        const remaining = qtyToTake - alreadyTaken
        if (remaining <= 0) return lot
        const take = Math.min(lot.cantidad, remaining)
        used[lot.codigoLote] = alreadyTaken + take
        const newCantidad = lot.cantidad - take
        return { ...lot, cantidad: newCantidad, estado: newCantidad === 0 ? 'agotado' : newCantidad <= lot.cantidadInicial * 0.3 ? 'bajo' : 'disponible' }
      })
    })
    setRequirements((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r
        const newInsumos = r.insumos.map((item) => {
          const qty = salidaQtys[item.insumo] || 0
          if (qty <= 0) return item
          return { ...item, atendido: (item.atendido || 0) + qty }
        })
        const allComplete = newInsumos.every((item) => (item.atendido || 0) >= item.cantidad)
        const anyProgress = newInsumos.some((item) => (item.atendido || 0) > 0)
        return {
          ...r,
          insumos: newInsumos,
          atenciones: [...(r.atenciones || []), { fecha, por: currentUser?.name || 'Operario', insumos: salidaQtys }],
          estado: allComplete ? 'atendido' : anyProgress ? 'parcial' : 'pendiente',
        }
      }),
    )
  }, [])

  // Agrega un nuevo requerimiento al listado
  const addRequirement = useCallback((req) => {
    setRequirements((rs) => [req, ...rs])
  }, [])

  // ---- Alertas dinámicas ----
  // Las alertas se calculan automáticamente comparando stock total de cada insumo vs su punto de reorden
  const alerts = useMemo(() => {
    const stockPorInsumo = {}
    inventory.forEach((lot) => {
      stockPorInsumo[lot.insumo] = (stockPorInsumo[lot.insumo] || 0) + lot.cantidad
    })
    return insumos
      .filter((ins) => (stockPorInsumo[ins.nombre] || 0) < ins.puntoReorden)
      .map((ins) => {
        const stockActual = stockPorInsumo[ins.nombre] || 0
        return {
          id: `alert-${ins.nombre}`,
          insumo: ins.nombre,
          stockActual,
          puntoReorden: ins.puntoReorden,
          unidad: ins.unidad,
          leadTime: ins.leadTime,
          generada: 'Automática',
          atendida: attendedAlerts[ins.nombre] || null,
        }
      })
  }, [inventory, insumos, attendedAlerts])

  // Marca una alerta como atendida
  const attendAlert = useCallback((id) => {
    const insumo = id.replace('alert-', '')
    setAttendedAlerts((prev) => ({
      ...prev,
      [insumo]: { fecha: new Date().toLocaleString('es-PE'), por: 'Supervisor' },
    }))
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

  // Actualiza datos de un usuario existente (nombre, rol, contraseña)
  const updateUser = useCallback((id, data) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...data } : u)))
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

  // ---- Inventario / Lotes ----
  // Agrega un nuevo lote al inventario (lo usa el operario al registrar ingreso)
  const addLot = useCallback((lot) => {
    setInventory((inv) => [...inv, lot])
  }, [])

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
    addLot,
    addRequirement,
    updateUser,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook para consumir el contexto desde cualquier componente
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
