import { useState, useMemo, useCallback } from 'react'
import {
  Package, AlertTriangle, ClipboardList, Bell, Boxes,
  ChevronDown, ChevronRight, CheckCircle,
  Calendar, User,
} from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { cn, fmt, qty } from '../lib/utils.js'

function parseDate(ddmmYYYY) {
  const [d, m, y] = ddmmYYYY.split('/').map(Number)
  return new Date(y, m - 1, d)
}

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseDate(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

function parseDateTime(dtStr) {
  const [datePart, timePart] = dtStr.split(' ')
  const [d, m, y] = datePart.split('/').map(Number)
  const [hh, mm] = timePart ? timePart.split(':').map(Number) : [0, 0]
  return new Date(y, m - 1, d, hh, mm).getTime()
}

function InitialsAvatar({ name, className }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className={cn('inline-flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary', className)}>
      {initials}
    </span>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-foreground">{children}</h2>
      <div className="mt-1.5 h-px bg-border" />
    </div>
  )
}

function EmptyState({ icon, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      {icon}
      <p className="mt-2 text-sm">{children}</p>
    </div>
  )
}

function PulseDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-warning" />
    </span>
  )
}

export default function DashboardPage() {
  const { currentUser, inventory, insumos, requirements, alerts, tasks, users } = useApp()
  const [expandedRow, setExpandedRow] = useState(null)

  const toggleRow = useCallback((nombre) => {
    setExpandedRow((prev) => (prev === nombre ? null : nombre))
  }, [])

  const lotesActivos = useMemo(() => inventory.filter((l) => l.cantidad > 0), [inventory])

  const stockPorInsumo = useMemo(() => {
    const map = {}
    inventory.forEach((l) => {
      map[l.insumo] = (map[l.insumo] || 0) + l.cantidad
    })
    return map
  }, [inventory])

  const kpiData = useMemo(() => {
    const insumosRegistrados = insumos.length
    const lotesActivosCount = lotesActivos.length

    const stockCritico = insumos.filter((ins) => {
      const total = stockPorInsumo[ins.nombre] || 0
      return total < ins.puntoReorden
    }).length

    const reqsPendientes = requirements.filter((r) => r.estado === 'pendiente').length
    const alertasActivas = alerts.filter((a) => !a.atendida).length

    return { insumosRegistrados, lotesActivosCount, stockCritico, reqsPendientes, alertasActivas }
  }, [insumos, lotesActivos, stockPorInsumo, requirements, alerts])

  const uniqueReqDays = useMemo(() => {
    const days = new Set()
    requirements
      .filter((r) => r.estado === 'atendido' || r.estado === 'parcial')
      .forEach((r) => days.add(r.fechaSolicitud))
    return days.size
  }, [requirements])

  const consumoDiarioPorInsumo = useMemo(() => {
    const map = {}
    requirements
      .filter((r) => r.estado === 'atendido' || r.estado === 'parcial')
      .forEach((r) => {
        r.insumos.forEach((i) => {
          map[i.insumo] = (map[i.insumo] || 0) + i.cantidad
        })
      })
    return map
  }, [requirements])

  const insumoStatusData = useMemo(() => {
    return insumos.map((ins) => {
      const stockTotal = stockPorInsumo[ins.nombre] || 0
      const lotesCount = inventory.filter((l) => l.insumo === ins.nombre && l.cantidad > 0).length

      const totalDespachado = consumoDiarioPorInsumo[ins.nombre] || 0
      const consumoPromedio = uniqueReqDays > 0 ? totalDespachado / uniqueReqDays : 0
      const cobertura = consumoPromedio > 0 ? Math.round(stockTotal / consumoPromedio) : null

      const alerta = alerts.find((a) => a.insumo === ins.nombre && !a.atendida)
      const leadTime = alerta ? alerta.leadTime : null

      let estado
      let estadoColor
      if (stockTotal === 0) {
        estado = 'Agotado'
        estadoColor = 'red'
      } else if (stockTotal <= ins.puntoReorden) {
        estado = 'Stock bajo'
        estadoColor = 'amber'
      } else {
        estado = 'Normal'
        estadoColor = 'green'
      }

      const maxCapacidad = Math.max(...inventory.filter((l) => l.insumo === ins.nombre).map((l) => l.cantidadInicial), 1000)

      const activeLotes = inventory
        .filter((l) => l.insumo === ins.nombre && l.cantidad > 0)

      const reqsRelacionados = requirements
        .filter((r) => r.insumos.some((i) => i.insumo === ins.nombre))
        .sort((a, b) => parseDateTime(b.fechaRegistro) - parseDateTime(a.fechaRegistro))
        .slice(0, 3)

      return {
        ...ins,
        stockTotal,
        lotesCount,
        cobertura,
        leadTime,
        estado,
        estadoColor,
        alertaActiva: !!alerta,
        maxCapacidad,
        activeLotes,
        reqsRelacionados,
      }
    })
  }, [insumos, stockPorInsumo, inventory, consumoDiarioPorInsumo, uniqueReqDays, alerts, requirements])

  const recentRequirements = useMemo(() => {
    return [...requirements]
      .sort((a, b) => parseDateTime(b.fechaRegistro) - parseDateTime(a.fechaRegistro))
      .slice(0, 8)
  }, [requirements])

  const expiringLotes = useMemo(() => {
    return [...lotesActivos]
      .sort((a, b) => {
        const da = parseDate(a.vencimiento)
        const db = parseDate(b.vencimiento)
        return da - db
      })
      .slice(0, 8)
  }, [lotesActivos])

  const hasUrgentExpiring = useMemo(() => {
    return expiringLotes.some((l) => daysUntil(l.vencimiento) <= 30)
  }, [expiringLotes])

  const activeRequirements = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return requirements
      .filter((r) => r.estado === 'pendiente' || r.estado === 'parcial')
      .map((r) => ({
        ...r,
        diasEspera: Math.ceil((today - parseDate(r.fechaSolicitud)) / (1000 * 60 * 60 * 24)),
      }))
  }, [requirements])

  const teamActivity = useMemo(() => {
    if (currentUser.role !== 'jefe') return { members: [], lastTasks: [] }
    const activeUsers = users.filter((u) => u.active && u.id !== currentUser.id)
    const members = activeUsers.map((u) => {
      const userTasks = tasks.filter((t) => t.assigneeId === u.id)
      return {
        ...u,
        pendingCount: userTasks.filter((t) => t.status === 'pendiente').length,
        completedCount: userTasks.filter((t) => t.status === 'completada').length,
      }
    })
    const lastTasks = tasks.slice(0, 5)
    return { members, lastTasks }
  }, [users, tasks, currentUser])

  return (
    <AppShell title="Dashboard" allowedRoles={['jefe', 'supervisor']}>
      <div className="space-y-8">

        {/* ───── Section 1: KPI Cards ───── */}
        <section>
          <SectionTitle>Resumen del Almacén</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              icon={<Boxes className="size-5" />}
              value={kpiData.insumosRegistrados}
              label="Insumos registrados"
              borderColor="border-l-green-600"
              iconColor="text-green-600"
            />
            <KpiCard
              icon={<Package className="size-5" />}
              value={kpiData.lotesActivosCount}
              label="Lotes activos"
              borderColor="border-l-green-600"
              iconColor="text-green-600"
            />
            <KpiCard
              icon={<AlertTriangle className="size-5" />}
              value={kpiData.stockCritico}
              label="Stock crítico"
              borderColor="border-l-red-500"
              iconColor={kpiData.stockCritico > 0 ? 'text-red-500' : 'text-green-600'}
              valueColor={kpiData.stockCritico > 0 ? 'text-red-500' : ''}
            />
            <KpiCard
              icon={<ClipboardList className="size-5" />}
              value={kpiData.reqsPendientes}
              label="Requerimientos pendientes"
              borderColor="border-l-amber-500"
              iconColor={kpiData.reqsPendientes > 0 ? 'text-amber-500' : 'text-green-600'}
              valueColor={kpiData.reqsPendientes > 0 ? 'text-amber-500' : ''}
            />
            <KpiCard
              icon={<Bell className="size-5" />}
              value={kpiData.alertasActivas}
              label="Alertas activas"
              borderColor="border-l-red-500"
              iconColor={kpiData.alertasActivas > 0 ? 'text-red-500' : 'text-green-600'}
              valueColor={kpiData.alertasActivas > 0 ? 'text-red-500' : ''}
            />
          </div>
        </section>

        {/* ───── Section 2: Inventory Status Table ───── */}
        <section>
          <SectionTitle>Estado del Inventario por Insumo</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground">
                  <th className="px-4 py-3">Insumo</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Stock total</th>
                  <th className="px-4 py-3">P. reorden</th>
                  <th className="px-4 py-3">Cobertura</th>
                  <th className="px-4 py-3">Lead time</th>
                  <th className="px-4 py-3">Lotes</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Alerta</th>
                  <th className="w-8 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {insumoStatusData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No hay insumos registrados.
                    </td>
                  </tr>
                ) : (
                  insumoStatusData.map((row) => {
                    const isExpanded = expandedRow === row.nombre
                    const rowBg = row.estado === 'Agotado'
                      ? 'bg-critical/5'
                      : row.estado === 'Stock bajo'
                        ? 'bg-warning/5'
                        : ''
                    const borderLeft = row.estado === 'Agotado'
                      ? 'border-l-2 border-l-red-400'
                      : row.estado === 'Stock bajo'
                        ? 'border-l-2 border-l-amber-400'
                        : 'border-l-2 border-l-transparent'
                    return (
                      <>
                        <tr
                          key={row.nombre}
                          className={cn('cursor-pointer transition-colors hover:bg-muted/50', rowBg, borderLeft)}
                          onClick={() => toggleRow(row.nombre)}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{row.nombre}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.proveedor}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{qty(row.stockTotal, row.unidad)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{qty(row.puntoReorden, row.unidad)}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {row.cobertura !== null ? `${row.cobertura} días` : 'Sin datos'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {row.leadTime !== null ? `${row.leadTime} días` : '—'}
                          </td>
                          <td className="px-4 py-3 text-foreground">{row.lotesCount}</td>
                          <td className="px-4 py-3">
                            <Badge color={row.estadoColor}>{row.estado}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {row.alertaActiva ? (
                              <Bell className="size-4 text-red-500" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${row.nombre}-detail`}>
                            <td colSpan={10} className="bg-card/50 px-6 py-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Lotes activos
                                  </h4>
                                  {row.activeLotes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin lotes activos.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded border border-border">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-muted/50 text-left text-muted-foreground">
                                            <th className="px-3 py-2">Código</th>
                                            <th className="px-3 py-2">Cantidad</th>
                                            <th className="px-3 py-2">Vencimiento</th>
                                            <th className="px-3 py-2">Ubicación</th>
                                            <th className="px-3 py-2">Estado</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {row.activeLotes.map((l) => (
                                            <tr key={l.id}>
                                              <td className="px-3 py-2 font-medium text-foreground">{l.codigoLote}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{qty(l.cantidad, l.unidad)}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{l.vencimiento}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{l.ubicacion}</td>
                                              <td className="px-3 py-2">
                                                <Badge color={l.estado === 'disponible' ? 'green' : l.estado === 'bajo' ? 'amber' : 'red'}>
                                                  {l.estado === 'disponible' ? 'Disponible' : l.estado === 'bajo' ? 'Stock bajo' : 'Agotado'}
                                                </Badge>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Últimos requerimientos
                                  </h4>
                                  {row.reqsRelacionados.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin requerimientos previos.</p>
                                  ) : (
                                    <div className="overflow-x-auto rounded border border-border">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-muted/50 text-left text-muted-foreground">
                                            <th className="px-3 py-2">N°</th>
                                            <th className="px-3 py-2">Fecha</th>
                                            <th className="px-3 py-2">Cantidad solicitada</th>
                                            <th className="px-3 py-2">Estado</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {row.reqsRelacionados.map((r) => {
                                            const ins = r.insumos.find((i) => i.insumo === row.nombre)
                                            return (
                                              <tr key={r.id}>
                                                <td className="px-3 py-2 font-medium text-foreground">{r.numero}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{r.fechaSolicitud}</td>
                                                <td className="px-3 py-2 text-muted-foreground">
                                                  {ins ? qty(ins.cantidad, ins.unidad) : '—'}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <Badge color={r.estado === 'atendido' ? 'green' : r.estado === 'parcial' ? 'amber' : 'blue'}>
                                                    {r.estado === 'atendido' ? 'Atendido' : r.estado === 'parcial' ? 'Parcial' : 'Pendiente'}
                                                  </Badge>
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ───── Section 3: Two columns ───── */}
        <section>
          <SectionTitle>Movimientos recientes y Lotes próximos a vencer</SectionTitle>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Recent movements */}
            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Movimientos recientes</h3>
              </div>
              <div className="divide-y divide-border">
                {recentRequirements.length === 0 ? (
                  <EmptyState icon={<ClipboardList className="size-8" />}>
                    No hay requerimientos registrados.
                  </EmptyState>
                ) : (
                  recentRequirements.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <div className="flex shrink-0 items-center gap-1.5">
                        {r.estado === 'pendiente' && <PulseDot />}
                        <span className="font-medium text-foreground">{r.numero}</span>
                      </div>
                      <span className="text-muted-foreground">{r.fechaRegistro}</span>
                      <span className="text-muted-foreground">{r.registradoPor}</span>
                      <span className="ml-auto text-muted-foreground">{r.insumos.length} insumos</span>
                      <Badge color={r.estado === 'atendido' ? 'green' : r.estado === 'parcial' ? 'amber' : 'blue'}>
                        {r.estado === 'atendido' ? 'Atendido' : r.estado === 'parcial' ? 'Parcial' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Expiring lots */}
            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Lotes próximos a vencer</h3>
              </div>
              <div className="divide-y divide-border">
                {!hasUrgentExpiring ? (
                  <EmptyState icon={<CheckCircle className="size-8 text-green-500" />}>
                    Todos los lotes están dentro del rango seguro de vencimiento.
                  </EmptyState>
                ) : (
                  expiringLotes.map((l) => {
                    const remaining = daysUntil(l.vencimiento)
                    let urgBadge = null
                    if (remaining <= 7) {
                      urgBadge = <Badge color="red">Urgente</Badge>
                    } else if (remaining <= 30) {
                      urgBadge = <Badge color="amber">Próximo</Badge>
                    }
                    return (
                      <div key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                        <Calendar className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">{l.insumo}</div>
                          <div className="text-xs text-muted-foreground">{l.codigoLote} · {qty(l.cantidad, l.unidad)}</div>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">{l.vencimiento}</span>
                        {urgBadge}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ───── Section 4: CSS Bar Chart ───── */}
        <section>
          <SectionTitle>Distribución de Stock por Insumo</SectionTitle>
          <div className="rounded-lg border border-border p-4">
            {insumoStatusData.length === 0 ? (
              <EmptyState icon={<Package className="size-8" />}>
                No hay insumos registrados.
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {insumoStatusData.map((row) => {
                  const pct = Math.min(100, (row.stockTotal / row.maxCapacidad) * 100)
                  const barColor = row.estadoColor === 'green'
                    ? 'bg-green-600'
                    : row.estadoColor === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  return (
                    <div key={row.nombre} className="flex items-center gap-4">
                      <span className="w-40 shrink-0 truncate text-sm font-medium text-foreground" title={row.nombre}>
                        {row.nombre}
                      </span>
                      <div className="flex-1">
                        <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full transition-all duration-600 ease-out', barColor)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-0.5 flex justify-between text-xs text-muted-foreground">
                          <span>{qty(row.stockTotal, row.unidad)}</span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ───── Section 5: Active Requirements ───── */}
        <section>
          <SectionTitle>Requerimientos Activos</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-border">
            {activeRequirements.length === 0 ? (
              <EmptyState icon={<CheckCircle className="size-8 text-green-500" />}>
                No hay requerimientos pendientes de atención.
              </EmptyState>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">N° requerimiento</th>
                    <th className="px-4 py-3">Fecha solicitud</th>
                    <th className="px-4 py-3">Registrado por</th>
                    <th className="px-4 py-3">Insumos</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Días en espera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeRequirements.map((r) => {
                    const insumosText = r.insumos
                      .slice(0, 2)
                      .map((i) => `${i.insumo} (${i.cantidad}${i.unidad})`)
                      .join(', ')
                    const hasMore = r.insumos.length > 2
                    return (
                      <tr key={r.id} className="transition-colors hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">{r.numero}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.fechaSolicitud}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.registradoPor}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {insumosText}
                          {hasMore && <span className="text-xs text-muted-foreground">…</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge color={r.estado === 'pendiente' ? 'blue' : 'amber'}>
                            {r.estado === 'pendiente' ? 'Pendiente' : 'Parcial'}
                          </Badge>
                        </td>
                        <td className={cn('px-4 py-3 font-medium', r.diasEspera > 2 ? 'text-red-500' : 'text-muted-foreground')}>
                          {r.diasEspera} días
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ───── Section 6: Team Activity (jefe only) ───── */}
        {currentUser.role === 'jefe' && (
          <section>
            <SectionTitle>Resumen de Usuarios y Responsabilidades</SectionTitle>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Team activity */}
              <div className="rounded-lg border border-border">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">Actividad del equipo</h3>
                </div>
                <div className="divide-y divide-border">
                  {teamActivity.members.length === 0 ? (
                    <EmptyState icon={<User className="size-8" />}>
                      No hay miembros activos en el equipo.
                    </EmptyState>
                  ) : (
                    teamActivity.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                        <InitialsAvatar name={m.name} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground">{m.name}</div>
                          <Badge color={m.role === 'supervisor' ? 'amber' : 'gray'}>
                            {m.role === 'supervisor' ? 'Supervisor' : 'Operario'}
                          </Badge>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div className={m.pendingCount > 2 ? 'text-red-500 font-medium' : ''}>
                            Tareas pendientes: {m.pendingCount}
                          </div>
                          <div className="text-green-600">Completadas: {m.completedCount}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Last responsibilities */}
              <div className="rounded-lg border border-border">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">Últimas responsabilidades asignadas</h3>
                </div>
                <div className="divide-y divide-border">
                  {teamActivity.lastTasks.length === 0 ? (
                    <EmptyState icon={<ClipboardList className="size-8" />}>
                      No hay responsabilidades asignadas recientemente.
                    </EmptyState>
                  ) : (
                    teamActivity.lastTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                        <InitialsAvatar name={t.assigneeName} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-foreground" title={t.description}>
                            {t.description.length > 60 ? `${t.description.slice(0, 60)}…` : t.description}
                          </div>
                          <div className="text-xs text-muted-foreground">{t.timestamp}</div>
                        </div>
                        <Badge color={t.status === 'completada' ? 'green' : 'amber'}>
                          {t.status === 'completada' ? 'Completada' : 'Pendiente'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </AppShell>
  )
}

function KpiCard({ icon, value, label, borderColor, iconColor, valueColor }) {
  return (
    <div className={cn('flex items-center gap-4 rounded-lg border border-border bg-card border-l-4 px-4 py-4', borderColor)}>
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-md bg-muted', iconColor)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn('text-2xl font-bold leading-none text-foreground', valueColor)}>
          {fmt(value)}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
