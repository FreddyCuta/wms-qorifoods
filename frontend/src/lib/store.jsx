import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from './api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [inventory, setInventory] = useState([])
  const [insumos, setInsumos] = useState([])
  const [requirements, setRequirements] = useState([])
  const [tasks, setTasks] = useState([])
  const [alerts, setAlerts] = useState([])
  const [ubicaciones, setUbicaciones] = useState([])
  const [toasts, setToasts] = useState([])

  // ---- Toast ----
  const addToast = useCallback((message, variant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  // ---- Data loaders ----
  const loadAll = useCallback(async () => {
    const [u, i, l, r, t, a, ub] = await Promise.all([
      api.getUsuarios(),
      api.getInsumos(),
      api.getLotes(),
      api.getRequerimientos(),
      api.getTareas(),
      api.getAlertas(),
      api.getUbicaciones(),
    ])
    setUsers(u)
    setInsumos(i)
    setInventory(l.map((lot) => ({
      ...lot,
      ubicacion: `Pasillo ${lot.pasillo} – Rack ${lot.rack} – Nivel ${lot.nivel}`,
    })))
    setRequirements(r)
    setTasks(t.map((task) => ({ ...task, status: task.estado })))
    setAlerts(a)
    setUbicaciones(ub)
  }, [])

  // ---- Sesión ----
  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password)
    setCurrentUser(res.user)
    await loadAll()
  }, [loadAll])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setUsers([])
    setInsumos([])
    setInventory([])
    setRequirements([])
    setTasks([])
    setAlerts([])
  }, [])

  // ---- Tareas ----
  const completeTask = useCallback(async (id) => {
    const updated = await api.toggleTarea(id)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...updated, status: updated.estado } : t)))
  }, [])

  const assignTask = useCallback(async (assigneeId, description) => {
    const created = await api.createTarea({ asignado_a_id: assigneeId, descripcion: description })
    setTasks((prev) => [{ ...created, status: created.estado }, ...prev])
  }, [])

  // ---- Requerimientos ----
  const attendRequirement = useCallback(async (reqId, salidaQtys, atendidoPor) => {
    const salidas = Object.entries(salidaQtys)
      .filter(([, qty]) => qty > 0)
      .map(([insumoId, cantidad]) => ({ insumo_id: insumoId, cantidad }))

    await api.atenderRequerimiento(reqId, { salidas, atendido_por_id: atendidoPor.id })

    const [lotes, reqs, alertas] = await Promise.all([api.getLotes(), api.getRequerimientos(), api.getAlertas()])
    setInventory(lotes.map((lot) => ({
      ...lot,
      ubicacion: `Pasillo ${lot.pasillo} – Rack ${lot.rack} – Nivel ${lot.nivel}`,
    })))
    setRequirements(reqs)
    setAlerts(alertas)
  }, [])

  const addRequirement = useCallback(async (req) => {
    const created = await api.createRequerimiento({
      numero: req.numero,
      fecha_solicitud: req.fechaSolicitud,
      registrado_por_id: req.registrado_por_id,
      insumos: req.insumos.map((i) => ({
        insumo_id: i.insumoId,
        cantidad: i.cantidad,
        unidad: i.unidad || 'kg',
        stock_snapshot: i.stock || 0,
      })),
    })
    setRequirements((prev) => [created, ...prev])
  }, [])

  // ---- Alertas ----
  const attendAlert = useCallback(async (insumoId, atendidoPorId) => {
    await api.atenderAlerta({ insumo_id: insumoId, atendido_por_id: atendidoPorId })
    const updated = await api.getAlertas()
    setAlerts(updated)
  }, [])

  // ---- Usuarios ----
  const toggleUserActive = useCallback(async (id) => {
    const updated = await api.toggleUsuarioActive(id)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }, [])

  const addUser = useCallback(async (u) => {
    const created = await api.createUsuario({
      nombre: u.name,
      email: u.email,
      password: u.password,
      rol: u.role,
    })
    setUsers((prev) => [...prev, created])
  }, [])

  const updateUser = useCallback(async (id, data) => {
    const updated = await api.updateUsuario(id, {
      nombre: data.name,
      password: data.password,
      rol: data.role,
    })
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }, [])

  // ---- Inventario ----
  const addLot = useCallback(async (lot) => {
    const created = await api.createLote({
      insumo_id: lot.insumoId,
      cantidad: lot.cantidad,
      vencimiento: lot.vencimiento,
      ubicacion_id: lot.ubicacionId,
      proveedor: lot.proveedor,
      registrado_por_id: lot.registradoPorId,
    })
    setInventory((prev) => [{
      ...created,
      ubicacion: `Pasillo ${created.pasillo} – Rack ${created.rack} – Nivel ${created.nivel}`,
    }, ...prev])
    const updated = await api.getAlertas()
    setAlerts(updated)
  }, [])

  // ---- Insumos ----
  const addInsumo = useCallback(async (insumo) => {
    const created = await api.createInsumo({
      nombre: insumo.nombre,
      proveedor: insumo.proveedor,
      unidad: insumo.unidad,
      punto_reorden: insumo.puntoReorden,
      lead_time: insumo.leadTime,
    })
    setInsumos((prev) => [...prev, created])
  }, [])

  const updateInsumo = useCallback(async (id, data) => {
    const updated = await api.updateInsumo(id, {
      nombre: data.nombre,
      proveedor: data.proveedor,
      unidad: data.unidad,
      punto_reorden: data.puntoReorden,
      lead_time: data.leadTime,
    })
    setInsumos((prev) => prev.map((i) => (i.id === id ? updated : i)))
  }, [])

  // ---- Contadores derivados ----
  const activeAlertCount = useMemo(
    () => alerts.filter((a) => !a.atendidaId).length,
    [alerts],
  )
  const pendingReqCount = useMemo(
    () => requirements.filter((r) => r.estado === 'pendiente').length,
    [requirements],
  )

  const value = {
    currentUser,
    users,
    inventory,
    insumos,
    requirements,
    alerts,
    tasks,
    ubicaciones,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
