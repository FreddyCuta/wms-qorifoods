import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

const FIELD_MAP = {
  rol: 'role',
  activo: 'active',
  descripcion: 'description',
  creadaEn: 'timestamp',
  asignadoAId: 'assigneeId',
  asignadoANombre: 'assigneeName',
  atendidoPorId: 'atendidoPor',
  registradoPorId: 'registradoPorId',
  registradoPorNombre: 'registradoPorNombre',
}

const NUMERIC_KEYS = new Set([
  'cantidad', 'cantidadInicial', 'puntoReorden', 'stockSnapshot',
  'atendido', 'stockActual', 'stock',
])

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return v
  if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) {
    return Number(v)
  }
  return v
}

function transformKeys(obj) {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const mapped = {}
    for (const [k, v] of Object.entries(obj)) {
      let newKey = toCamel(k)
      if (FIELD_MAP[newKey]) newKey = FIELD_MAP[newKey]
      const transformed = transformKeys(v)
      mapped[newKey] = NUMERIC_KEYS.has(newKey) ? toNumber(transformed) : transformed
    }
    return mapped
  }
  return obj
}

api.interceptors.response.use((res) => {
  res.data = transformKeys(res.data)
  return res
})

export function login(email, password) {
  return api.post('/auth/login', { email, password }).then((r) => r.data)
}

export function getInsumos() {
  return api.get('/insumos').then((r) => r.data)
}

export function createInsumo(data) {
  return api.post('/insumos', data).then((r) => r.data)
}

export function updateInsumo(id, data) {
  return api.put(`/insumos/${id}`, data).then((r) => r.data)
}

export function getLotes(params) {
  return api.get('/lotes', { params }).then((r) => r.data)
}

export function createLote(data) {
  return api.post('/lotes', data).then((r) => r.data)
}

export function getRequerimientos() {
  return api.get('/requerimientos').then((r) => r.data)
}

export function getRequerimiento(id) {
  return api.get(`/requerimientos/${id}`).then((r) => r.data)
}

export function createRequerimiento(data) {
  return api.post('/requerimientos', data).then((r) => r.data)
}

export function atenderRequerimiento(id, data) {
  return api.post(`/requerimientos/${id}/atender`, data).then((r) => r.data)
}

export function getUsuarios() {
  return api.get('/usuarios').then((r) => r.data)
}

export function createUsuario(data) {
  return api.post('/usuarios', data).then((r) => r.data)
}

export function updateUsuario(id, data) {
  return api.put(`/usuarios/${id}`, data).then((r) => r.data)
}

export function toggleUsuarioActive(id) {
  return api.patch(`/usuarios/${id}/toggle-active`).then((r) => r.data)
}

export function getTareas(params) {
  return api.get('/tareas', { params }).then((r) => r.data)
}

export function createTarea(data) {
  return api.post('/tareas', data).then((r) => r.data)
}

export function toggleTarea(id) {
  return api.patch(`/tareas/${id}/toggle`).then((r) => r.data)
}

export function getAlertas() {
  return api.get('/alertas').then((r) => r.data)
}

export function atenderAlerta(data) {
  return api.post('/alertas/atender', data).then((r) => r.data)
}

export function getDashboard() {
  return api.get('/dashboard').then((r) => r.data)
}

export function getUbicaciones() {
  return api.get('/ubicaciones').then((r) => r.data)
}
