// ========================
// Datos mock del sistema
// ========================

// Usuarios de prueba — jefe, supervisor y operarios con sus credenciales
export const USERS = [
  { id: 'u1', name: 'María Flores', email: 'maria@qorifoods.com', password: 'jefe123', role: 'jefe', active: true },
  { id: 'u2', name: 'Pedro Salas', email: 'pedro@qorifoods.com', password: 'super123', role: 'supervisor', active: true },
  { id: 'u3', name: 'Carlos Quispe', email: 'carlos@qorifoods.com', password: 'operario123', role: 'operario', active: true },
  { id: 'u4', name: 'Luis Mamani', email: 'luis@qorifoods.com', password: 'operario123', role: 'operario', active: true },
  { id: 'u5', name: 'Ana Torres', email: 'ana@qorifoods.com', password: 'super123', role: 'supervisor', active: false },
]

// Catálogo de insumos — lo usa el jefe para registrar nuevos materiales y el operario al crear requerimientos
export const INSUMOS = [
  { nombre: 'Sémola de trigo', proveedor: 'Molinos del Norte SAC', unidad: 'kg', puntoReorden: 100, leadTime: 5 },
  { nombre: 'Harina de trigo', proveedor: 'Industrias Unidas SAC', unidad: 'kg', puntoReorden: 80, leadTime: 3 },
  { nombre: 'Aceite vegetal', proveedor: 'Distribuidora Lima SAC', unidad: 'L', puntoReorden: 20, leadTime: 7 },
  { nombre: 'Sal yodada', proveedor: 'Salinera Perú SAC', unidad: 'kg', puntoReorden: 50, leadTime: 5 },
  { nombre: 'Huevos deshidratados', proveedor: 'Avícola Andina SAC', unidad: 'kg', puntoReorden: 200, leadTime: 6 },
  { nombre: 'Quinua orgánica', proveedor: 'Andes Orgánicos SAC', unidad: 'kg', puntoReorden: 150, leadTime: 7 },
]

// Ubicaciones físicas del almacén (pasillo / rack / nivel) — acá se asignan los lotes
export const UBICACIONES = (() => {
  const ps = ['A','B','C','D','E']
  const rs = [1,2,3,4,5,6,7,8,9,10]
  const ns = [1,2,3,4,5,6]
  const r = []
  for (const p of ps) for (const rk of rs) for (const n of ns) r.push(`Pasillo ${p} – Rack ${rk} – Nivel ${n}`)
  return r
})()

// Inventario actual por lote — el corazón del sistema, visible para todos los roles
// Cada lote traza: insumo, proveedor, ubicación, cantidad, vencimiento y quién lo registró
export const INVENTORY = [
  {
    id: 'l1', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0018', cantidad: 700, unidad: 'kg',
    cantidadInicial: 1200, vencimiento: '15/08/2026', ubicacion: 'Pasillo A – Rack 2 – Nivel 1',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '10/02/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l2', insumo: 'Harina de trigo', codigoLote: 'LOT-2026-0021', cantidad: 120, unidad: 'kg',
    cantidadInicial: 500, vencimiento: '10/07/2026', ubicacion: 'Pasillo B – Rack 1 – Nivel 3',
    proveedor: 'Industrias Unidas SAC', estado: 'bajo', fechaIngreso: '05/03/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l3', insumo: 'Aceite vegetal', codigoLote: 'LOT-2026-0009', cantidad: 30, unidad: 'L',
    cantidadInicial: 80, vencimiento: '22/06/2026', ubicacion: 'Pasillo C – Rack 3 – Nivel 2',
    proveedor: 'Distribuidora Lima SAC', estado: 'bajo', fechaIngreso: '15/01/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l4', insumo: 'Sal yodada', codigoLote: 'LOT-2026-0031', cantidad: 0, unidad: 'kg',
    cantidadInicial: 300, vencimiento: '30/12/2026', ubicacion: 'Pasillo A – Rack 1 – Nivel 1',
    proveedor: 'Salinera Perú SAC', estado: 'agotado', fechaIngreso: '20/01/2026', registradoPor: 'Pedro Salas',
  },
  {
    id: 'l5', insumo: 'Huevos deshidratados', codigoLote: 'LOT-2026-0027', cantidad: 850, unidad: 'kg',
    cantidadInicial: 1000, vencimiento: '20/09/2026', ubicacion: 'Pasillo D – Rack 2 – Nivel 1',
    proveedor: 'Avícola Andina SAC', estado: 'disponible', fechaIngreso: '28/02/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l6', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0015', cantidad: 200, unidad: 'kg',
    cantidadInicial: 600, vencimiento: '09/06/2026', ubicacion: 'Pasillo A – Rack 3 – Nivel 2',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '02/01/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l7', insumo: 'Quinua orgánica', codigoLote: 'LOT-2026-0035', cantidad: 400, unidad: 'kg',
    cantidadInicial: 800, vencimiento: '20/11/2026', ubicacion: 'Pasillo E – Rack 1 – Nivel 1',
    proveedor: 'Andes Orgánicos SAC', estado: 'disponible', fechaIngreso: '15/04/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l8', insumo: 'Harina de trigo', codigoLote: 'LOT-2026-0038', cantidad: 250, unidad: 'kg',
    cantidadInicial: 400, vencimiento: '05/08/2026', ubicacion: 'Pasillo B – Rack 2 – Nivel 2',
    proveedor: 'Industrias Unidas SAC', estado: 'disponible', fechaIngreso: '20/04/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l9', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0042', cantidad: 500, unidad: 'kg',
    cantidadInicial: 500, vencimiento: '10/10/2026', ubicacion: 'Pasillo C – Rack 1 – Nivel 1',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '01/05/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l10', insumo: 'Aceite vegetal', codigoLote: 'LOT-2026-0045', cantidad: 15, unidad: 'L',
    cantidadInicial: 40, vencimiento: '18/07/2026', ubicacion: 'Pasillo D – Rack 3 – Nivel 2',
    proveedor: 'Distribuidora Lima SAC', estado: 'bajo', fechaIngreso: '10/05/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l11', insumo: 'Huevos deshidratados', codigoLote: 'LOT-2026-0048', cantidad: 600, unidad: 'kg',
    cantidadInicial: 600, vencimiento: '25/12/2026', ubicacion: 'Pasillo E – Rack 4 – Nivel 1',
    proveedor: 'Avícola Andina SAC', estado: 'disponible', fechaIngreso: '12/05/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l12', insumo: 'Sal yodada', codigoLote: 'LOT-2026-0050', cantidad: 80, unidad: 'kg',
    cantidadInicial: 200, vencimiento: '30/09/2026', ubicacion: 'Pasillo D – Rack 6 – Nivel 3',
    proveedor: 'Salinera Perú SAC', estado: 'disponible', fechaIngreso: '18/05/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l13', insumo: 'Quinua orgánica', codigoLote: 'LOT-2026-0053', cantidad: 120, unidad: 'kg',
    cantidadInicial: 300, vencimiento: '15/11/2026', ubicacion: 'Pasillo D – Rack 5 – Nivel 2',
    proveedor: 'Andes Orgánicos SAC', estado: 'bajo', fechaIngreso: '25/05/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l14', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0056', cantidad: 350, unidad: 'kg',
    cantidadInicial: 350, vencimiento: '22/12/2026', ubicacion: 'Pasillo D – Rack 4 – Nivel 1',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '01/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l15', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0059', cantidad: 280, unidad: 'kg',
    cantidadInicial: 400, vencimiento: '28/12/2026', ubicacion: 'Pasillo D – Rack 8 – Nivel 1',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '05/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l16', insumo: 'Harina de trigo', codigoLote: 'LOT-2026-0062', cantidad: 180, unidad: 'kg',
    cantidadInicial: 300, vencimiento: '15/09/2026', ubicacion: 'Pasillo E – Rack 2 – Nivel 3',
    proveedor: 'Industrias Unidas SAC', estado: 'disponible', fechaIngreso: '08/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l17', insumo: 'Aceite vegetal', codigoLote: 'LOT-2026-0065', cantidad: 25, unidad: 'L',
    cantidadInicial: 50, vencimiento: '10/08/2026', ubicacion: 'Pasillo E – Rack 1 – Nivel 2',
    proveedor: 'Distribuidora Lima SAC', estado: 'disponible', fechaIngreso: '10/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l18', insumo: 'Sal yodada', codigoLote: 'LOT-2026-0068', cantidad: 100, unidad: 'kg',
    cantidadInicial: 250, vencimiento: '05/01/2027', ubicacion: 'Pasillo E – Rack 5 – Nivel 1',
    proveedor: 'Salinera Perú SAC', estado: 'disponible', fechaIngreso: '12/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l19', insumo: 'Huevos deshidratados', codigoLote: 'LOT-2026-0071', cantidad: 450, unidad: 'kg',
    cantidadInicial: 500, vencimiento: '30/01/2027', ubicacion: 'Pasillo F – Rack 3 – Nivel 4',
    proveedor: 'Avícola Andina SAC', estado: 'disponible', fechaIngreso: '15/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l20', insumo: 'Quinua orgánica', codigoLote: 'LOT-2026-0074', cantidad: 200, unidad: 'kg',
    cantidadInicial: 350, vencimiento: '20/12/2026', ubicacion: 'Pasillo E – Rack 3 – Nivel 5',
    proveedor: 'Andes Orgánicos SAC', estado: 'disponible', fechaIngreso: '18/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l21', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0077', cantidad: 420, unidad: 'kg',
    cantidadInicial: 420, vencimiento: '10/02/2027', ubicacion: 'Pasillo E – Rack 4 – Nivel 2',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '20/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l22', insumo: 'Harina de trigo', codigoLote: 'LOT-2026-0080', cantidad: 350, unidad: 'kg',
    cantidadInicial: 350, vencimiento: '25/10/2026', ubicacion: 'Pasillo D – Rack 8 – Nivel 1',
    proveedor: 'Industrias Unidas SAC', estado: 'disponible', fechaIngreso: '22/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l23', insumo: 'Aceite vegetal', codigoLote: 'LOT-2026-0083', cantidad: 60, unidad: 'L',
    cantidadInicial: 60, vencimiento: '15/08/2026', ubicacion: 'Pasillo C – Rack 4 – Nivel 3',
    proveedor: 'Distribuidora Lima SAC', estado: 'disponible', fechaIngreso: '24/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l24', insumo: 'Huevos deshidratados', codigoLote: 'LOT-2026-0086', cantidad: 300, unidad: 'kg',
    cantidadInicial: 300, vencimiento: '20/02/2027', ubicacion: 'Pasillo B – Rack 3 – Nivel 5',
    proveedor: 'Avícola Andina SAC', estado: 'disponible', fechaIngreso: '26/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l25', insumo: 'Quinua orgánica', codigoLote: 'LOT-2026-0089', cantidad: 90, unidad: 'kg',
    cantidadInicial: 250, vencimiento: '15/01/2027', ubicacion: 'Pasillo A – Rack 4 – Nivel 6',
    proveedor: 'Andes Orgánicos SAC', estado: 'bajo', fechaIngreso: '28/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l26', insumo: 'Sémola de trigo', codigoLote: 'LOT-2026-0092', cantidad: 150, unidad: 'kg',
    cantidadInicial: 150, vencimiento: '28/02/2027', ubicacion: 'Pasillo A – Rack 2 – Nivel 1',
    proveedor: 'Molinos del Norte SAC', estado: 'disponible', fechaIngreso: '30/06/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l27', insumo: 'Harina de trigo', codigoLote: 'LOT-2026-0095', cantidad: 80, unidad: 'kg',
    cantidadInicial: 80, vencimiento: '05/11/2026', ubicacion: 'Pasillo B – Rack 1 – Nivel 3',
    proveedor: 'Industrias Unidas SAC', estado: 'disponible', fechaIngreso: '30/06/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l28', insumo: 'Aceite vegetal', codigoLote: 'LOT-2026-0098', cantidad: 10, unidad: 'L',
    cantidadInicial: 10, vencimiento: '12/08/2026', ubicacion: 'Pasillo C – Rack 3 – Nivel 2',
    proveedor: 'Distribuidora Lima SAC', estado: 'disponible', fechaIngreso: '01/07/2026', registradoPor: 'Carlos Quispe',
  },
  {
    id: 'l29', insumo: 'Huevos deshidratados', codigoLote: 'LOT-2026-0101', cantidad: 200, unidad: 'kg',
    cantidadInicial: 200, vencimiento: '15/03/2027', ubicacion: 'Pasillo D – Rack 2 – Nivel 1',
    proveedor: 'Avícola Andina SAC', estado: 'disponible', fechaIngreso: '01/07/2026', registradoPor: 'Luis Mamani',
  },
  {
    id: 'l30', insumo: 'Sal yodada', codigoLote: 'LOT-2026-0104', cantidad: 40, unidad: 'kg',
    cantidadInicial: 40, vencimiento: '20/11/2026', ubicacion: 'Pasillo D – Rack 2 – Nivel 1',
    proveedor: 'Salinera Perú SAC', estado: 'disponible', fechaIngreso: '01/07/2026', registradoPor: 'Carlos Quispe',
  },
]

// Requerimientos de insumos — los crea el supervisor (cuando producción los solicita), los atiende el operario
// Cada insumo tiene 'atendido' (cantidad ya despachada acumulada) y el req guarda 'atenciones' (historial de despachos)
export const REQUIREMENTS = [
  {
    id: 'r1', numero: 'REQ-047', fechaSolicitud: '05/06/2026', fechaRegistro: '05/06/2026 08:30',
    registradoPor: 'Carlos Quispe', estado: 'pendiente',
    atenciones: [],
    insumos: [
      { insumo: 'Sémola de trigo', cantidad: 500, unidad: 'kg', stock: 900, atendido: 0 },
      { insumo: 'Harina de trigo', cantidad: 300, unidad: 'kg', stock: 120, atendido: 0 },
      { insumo: 'Aceite vegetal', cantidad: 50, unidad: 'L', stock: 30, atendido: 0 },
    ],
  },
  {
    id: 'r2', numero: 'REQ-046', fechaSolicitud: '04/06/2026', fechaRegistro: '04/06/2026 14:15',
    registradoPor: 'Carlos Quispe', estado: 'parcial',
    atenciones: [
      { fecha: '05/06/2026 10:15', por: 'Carlos Quispe', insumos: { 'Quinua orgánica': 50 } },
    ],
    insumos: [
      { insumo: 'Quinua orgánica', cantidad: 200, unidad: 'kg', stock: 0, atendido: 50 },
      { insumo: 'Sal yodada', cantidad: 80, unidad: 'kg', stock: 0, atendido: 0 },
    ],
  },
  {
    id: 'r3', numero: 'REQ-045', fechaSolicitud: '03/06/2026', fechaRegistro: '03/06/2026 09:00',
    registradoPor: 'Luis Mamani', estado: 'atendido',
    atenciones: [
      { fecha: '03/06/2026 11:30', por: 'Luis Mamani', insumos: { 'Sémola de trigo': 300, 'Harina de trigo': 150, 'Huevos deshidratados': 100, 'Aceite vegetal': 20 } },
    ],
    insumos: [
      { insumo: 'Sémola de trigo', cantidad: 300, unidad: 'kg', stock: 900, atendido: 300 },
      { insumo: 'Harina de trigo', cantidad: 150, unidad: 'kg', stock: 120, atendido: 150 },
      { insumo: 'Huevos deshidratados', cantidad: 100, unidad: 'kg', stock: 850, atendido: 100 },
      { insumo: 'Aceite vegetal', cantidad: 20, unidad: 'L', stock: 30, atendido: 20 },
    ],
  },
  {
    id: 'r4', numero: 'REQ-044', fechaSolicitud: '02/06/2026', fechaRegistro: '02/06/2026 11:20',
    registradoPor: 'Carlos Quispe', estado: 'atendido',
    atenciones: [
      { fecha: '02/06/2026 14:00', por: 'Carlos Quispe', insumos: { 'Sal yodada': 40 } },
    ],
    insumos: [{ insumo: 'Sal yodada', cantidad: 40, unidad: 'kg', stock: 0, atendido: 40 }],
  },
]

// Alertas de stock bajo — se disparan cuando un insumo cae por debajo del punto de reorden
// Las ve el supervisor y puede marcarlas como atendidas
// Los datos reflejan el stock real del inventario y el ROP definido en el catálogo de insumos
export const ALERTS = [
  {
    id: 'a1', insumo: 'Sal yodada', stockActual: 0, puntoReorden: 50, unidad: 'kg',
    leadTime: 5, generada: 'hace 3 horas',
  },
  {
    id: 'a2', insumo: 'Quinua orgánica', stockActual: 0, puntoReorden: 150, unidad: 'kg',
    leadTime: 7, generada: 'hace 2 días',
  },
]

// Tareas asignadas — las crea el jefe desde "Asignar Responsabilidades" y las completa el operario
export const TASKS = [
  {
    id: 't1', assigneeId: 'u3', assigneeName: 'Carlos Quispe',
    description: 'Verificar el ingreso del lote LOT-2026-0041 en Rack 3 – Nivel 2',
    timestamp: 'Asignado hoy a las 09:15', status: 'pendiente',
  },
  {
    id: 't2', assigneeId: 'u3', assigneeName: 'Carlos Quispe',
    description: 'Registrar el ingreso del lote LOT-2026-0048 en Rack 2',
    timestamp: 'Asignado hoy a las 09:15', status: 'pendiente',
  },
  {
    id: 't3', assigneeId: 'u3', assigneeName: 'Carlos Quispe',
    description: 'Reubicar el lote LOT-2026-0033 al Pasillo B',
    timestamp: 'Asignado ayer a las 16:40', status: 'completada',
  },
  {
    id: 't4', assigneeId: 'u1', assigneeName: 'María Flores',
    description: 'Revisar el inventario de insumos próximos a vencer',
    timestamp: 'Asignado hoy a las 08:00', status: 'pendiente',
  },
  {
    id: 't5', assigneeId: 'u2', assigneeName: 'Pedro Salas',
    description: 'Supervisar el despacho del requerimiento REQ-046',
    timestamp: 'Ayer 16:30', status: 'completada',
  },
]
