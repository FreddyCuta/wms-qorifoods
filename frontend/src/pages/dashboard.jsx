import { useState, useMemo, useCallback } from "react";
import {
  Package,
  AlertTriangle,
  ClipboardList,
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Calendar,
  User,
} from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { cn, fmt, qty, parseDate, daysUntil } from "../lib/utils.js";

function parseDateTime(dtStr) {
  if (!dtStr) return 0;
  const [datePart, timePart] = dtStr.split("T");
  let y, m, d, hh, mm;
  if (datePart.includes("-")) {
    [y, m, d] = datePart.split("-").map(Number);
  } else {
    [d, m, y] = datePart.split("/").map(Number);
  }
  if (timePart) {
    [hh, mm] = timePart.split(":").map(Number);
  } else {
    hh = 0; mm = 0;
  }
  return new Date(y, m - 1, d, hh, mm).getTime();
}

function PulseDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--warning)] opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-[var(--warning)]" />
    </span>
  );
}

export default function DashboardPage() {
  const {
    currentUser,
    inventory,
    insumos,
    requirements,
    alerts,
    tasks,
    users,
  } = useApp();
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = useCallback((nombre) => {
    setExpandedRow((prev) => (prev === nombre ? null : nombre));
  }, []);

  const lotesActivos = useMemo(
    () => inventory.filter((l) => l.cantidad > 0),
    [inventory],
  );

  const stockPorInsumo = useMemo(() => {
    const map = {};
    inventory.forEach((l) => {
      map[l.insumo] = (map[l.insumo] || 0) + l.cantidad;
    });
    return map;
  }, [inventory]);

  const kpiData = useMemo(() => {
    const insumosRegistrados = insumos.length;
    const lotesActivosCount = lotesActivos.length;

    const stockCritico = insumos.filter((ins) => {
      const total = stockPorInsumo[ins.nombre] || 0;
      return total < ins.puntoReorden;
    }).length;

    const reqsPendientes = requirements.filter(
      (r) => r.estado === "pendiente",
    ).length;
    const alertasActivas = alerts.filter((a) => !a.atendidaId).length;

    return {
      insumosRegistrados,
      lotesActivosCount,
      stockCritico,
      reqsPendientes,
      alertasActivas,
    };
  }, [insumos, lotesActivos, stockPorInsumo, requirements, alerts]);

  const uniqueReqDays = useMemo(() => {
    const days = new Set();
    requirements
      .filter((r) => r.estado === "atendido" || r.estado === "parcial")
      .forEach((r) => days.add(r.fechaSolicitud));
    return days.size;
  }, [requirements]);

  const consumoDiarioPorInsumo = useMemo(() => {
    const map = {};
    requirements
      .filter((r) => r.estado === "atendido" || r.estado === "parcial")
      .forEach((r) => {
        r.insumos.forEach((i) => {
          map[i.insumo] = (map[i.insumo] || 0) + i.cantidad;
        });
      });
    return map;
  }, [requirements]);

  const insumoStatusData = useMemo(() => {
    return insumos.map((ins) => {
      const stockTotal = stockPorInsumo[ins.nombre] || 0;
      const lotesCount = inventory.filter(
        (l) => l.insumo === ins.nombre && l.cantidad > 0,
      ).length;

      const totalDespachado = consumoDiarioPorInsumo[ins.nombre] || 0;
      const consumoPromedio =
        uniqueReqDays > 0 ? totalDespachado / uniqueReqDays : 0;
      const cobertura =
        consumoPromedio > 0 ? Math.round(stockTotal / consumoPromedio) : null;

      const alerta = alerts.find((a) => a.insumo === ins.nombre && !a.atendidaId);
      const leadTime = alerta ? alerta.leadTime : null;

      let estado;
      let estadoColor;
      if (stockTotal === 0) {
        estado = "Agotado";
        estadoColor = "red";
      } else if (stockTotal <= ins.puntoReorden) {
        estado = "Stock bajo";
        estadoColor = "amber";
      } else {
        estado = "Normal";
        estadoColor = "green";
      }

      const maxCapacidad = Math.max(
        ...inventory
          .filter((l) => l.insumo === ins.nombre)
          .map((l) => l.cantidadInicial),
        1000,
      );

      const activeLotes = inventory.filter(
        (l) => l.insumo === ins.nombre && l.cantidad > 0,
      );

      const reqsRelacionados = requirements
        .filter((r) => r.insumos.some((i) => i.insumo === ins.nombre))
        .sort(
          (a, b) =>
            parseDateTime(b.fechaRegistro) - parseDateTime(a.fechaRegistro),
        )
        .slice(0, 3);

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
      };
    });
  }, [
    insumos,
    stockPorInsumo,
    inventory,
    consumoDiarioPorInsumo,
    uniqueReqDays,
    alerts,
    requirements,
  ]);

  const recentRequirements = useMemo(() => {
    return [...requirements]
      .sort(
        (a, b) =>
          parseDateTime(b.fechaRegistro) - parseDateTime(a.fechaRegistro),
      )
      .slice(0, 8);
  }, [requirements]);

  const expiringLotes = useMemo(() => {
    return [...lotesActivos]
      .sort((a, b) => {
        const da = parseDate(a.vencimiento);
        const db = parseDate(b.vencimiento);
        return da - db;
      })
      .slice(0, 8);
  }, [lotesActivos]);

  const hasUrgentExpiring = useMemo(() => {
    return expiringLotes.some((l) => daysUntil(l.vencimiento) <= 30);
  }, [expiringLotes]);

  const activeRequirements = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return requirements
      .filter((r) => r.estado === "pendiente" || r.estado === "parcial")
      .map((r) => ({
        ...r,
        diasEspera: Math.ceil(
          (today - parseDate(r.fechaSolicitud)) / (1000 * 60 * 60 * 24),
        ),
      }));
  }, [requirements]);

  const teamActivity = useMemo(() => {
    if (currentUser.role !== "jefe") return { members: [], lastTasks: [] };
    const activeUsers = users.filter(
      (u) => u.active && u.id !== currentUser.id,
    );
    const members = activeUsers.map((u) => {
      const userTasks = tasks.filter((t) => t.assigneeId === u.id);
      return {
        ...u,
        pendingCount: userTasks.filter((t) => t.status === "pendiente").length,
        completedCount: userTasks.filter((t) => t.status === "completada")
          .length,
      };
    });
    const lastTasks = tasks.slice(0, 5);
    return { members, lastTasks };
  }, [users, tasks, currentUser]);

  function InitialsAvatar({ name, className }) {
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-sm bg-[var(--accent-subtle)] text-[10px] font-medium text-[var(--accent-text)]",
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  return (
    <AppShell title="Dashboard" allowedRoles={["jefe"]}>
      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Resumen del Almacén</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              value={fmt(kpiData.insumosRegistrados)}
              label="Insumos registrados"
              valueColor={kpiData.insumosRegistrados > 0 ? undefined : "text-[var(--text-tertiary)]"}
            />
            <KpiCard
              value={fmt(kpiData.lotesActivosCount)}
              label="Lotes activos"
              valueColor={kpiData.lotesActivosCount > 0 ? undefined : "text-[var(--text-tertiary)]"}
            />
            <KpiCard
              value={fmt(kpiData.stockCritico)}
              label="Stock crítico"
              valueColor={kpiData.stockCritico > 0 ? "text-[var(--danger)]" : undefined}
            />
            <KpiCard
              value={fmt(kpiData.reqsPendientes)}
              label="Requerimientos pendientes"
              valueColor={kpiData.reqsPendientes > 0 ? "text-[var(--warning)]" : undefined}
            />
            <KpiCard
              value={fmt(kpiData.alertasActivas)}
              label="Alertas activas"
              valueColor={kpiData.alertasActivas > 0 ? "text-[var(--danger)]" : undefined}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Estado del Inventario por Insumo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  <th className="px-3 py-2">Insumo</th>
                  <th className="px-3 py-2">Proveedor</th>
                  <th className="px-3 py-2">Stock total</th>
                  <th className="px-3 py-2">P. reorden</th>
                  <th className="px-3 py-2">Cobertura</th>
                  <th className="px-3 py-2">Lead time</th>
                  <th className="px-3 py-2">Lotes</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Alerta</th>
                  <th className="w-8 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {insumoStatusData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-[13px] text-[var(--text-tertiary)]">
                      No hay insumos registrados.
                    </td>
                  </tr>
                ) : (
                  insumoStatusData.map((row) => {
                    const isExpanded = expandedRow === row.nombre;
                    return (
                      <>
                        <tr
                          key={row.nombre}
                          className={cn(
                            "group cursor-pointer transition-colors hover:bg-[var(--surface-raised)] h-10",
                          )}
                          onClick={() => toggleRow(row.nombre)}
                        >
                          <td className="px-3 font-medium text-[var(--text-primary)]">{row.nombre}</td>
                          <td className="px-3 text-[var(--text-secondary)]">{row.proveedor}</td>
                          <td className="px-3 font-medium text-[var(--text-primary)]">{qty(row.stockTotal, row.unidad)}</td>
                          <td className="px-3 text-[var(--text-secondary)]">{qty(row.puntoReorden, row.unidad)}</td>
                          <td className="px-3 text-[var(--text-secondary)]">
                            {row.cobertura !== null ? `${row.cobertura} días` : "Sin datos"}
                          </td>
                          <td className="px-3 text-[var(--text-secondary)]">
                            {row.leadTime !== null ? `${row.leadTime} días` : "—"}
                          </td>
                          <td className="px-3 text-[var(--text-primary)]">{row.lotesCount}</td>
                          <td className="px-3"><Badge color={row.estadoColor}>{row.estado}</Badge></td>
                          <td className="px-3">
                            {row.alertaActiva ? (
                              <Bell className="size-4 text-[var(--danger)]" />
                            ) : (
                              <span className="text-[var(--text-tertiary)]">—</span>
                            )}
                          </td>
                          <td className="px-3 text-[var(--text-tertiary)]">
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${row.nombre}-detail`}>
                            <td colSpan={10} className="bg-[var(--surface-raised)]/50 px-4 py-3">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Lotes activos</h4>
                                  {row.activeLotes.length === 0 ? (
                                    <p className="text-[13px] text-[var(--text-tertiary)]">Sin lotes activos.</p>
                                  ) : (
                                    <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-sm">
                                      <table className="w-full text-[12px]">
                                        <thead>
                                          <tr className="bg-[var(--surface-overlay)] text-left text-[var(--text-tertiary)]">
                                            <th className="px-2 py-1.5">Código</th>
                                            <th className="px-2 py-1.5">Cantidad</th>
                                            <th className="px-2 py-1.5">Vencimiento</th>
                                            <th className="px-2 py-1.5">Ubicación</th>
                                            <th className="px-2 py-1.5">Estado</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                          {row.activeLotes.map((l) => (
                                            <tr key={l.id}>
                                              <td className="px-2 py-1.5 font-medium text-[var(--text-primary)]">{l.codigoLote}</td>
                                              <td className="px-2 py-1.5 text-[var(--text-secondary)]">{qty(l.cantidad, l.unidad)}</td>
                                              <td className="px-2 py-1.5 text-[var(--text-secondary)]">{l.vencimiento}</td>
                                              <td className="px-2 py-1.5 text-[var(--text-secondary)]">{l.ubicacion}</td>
                                              <td className="px-2 py-1.5">
                                                <Badge color={l.estado === "disponible" ? "green" : l.estado === "bajo" ? "amber" : "red"}>
                                                  {l.estado === "disponible" ? "Disponible" : l.estado === "bajo" ? "Stock bajo" : "Agotado"}
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
                                  <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Últimos requerimientos</h4>
                                  {row.reqsRelacionados.length === 0 ? (
                                    <p className="text-[13px] text-[var(--text-tertiary)]">Sin requerimientos previos.</p>
                                  ) : (
                                    <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-sm">
                                      <table className="w-full text-[12px]">
                                        <thead>
                                          <tr className="bg-[var(--surface-overlay)] text-left text-[var(--text-tertiary)]">
                                            <th className="px-2 py-1.5">N°</th>
                                            <th className="px-2 py-1.5">Fecha</th>
                                            <th className="px-2 py-1.5">Cantidad solicitada</th>
                                            <th className="px-2 py-1.5">Estado</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                          {row.reqsRelacionados.map((r) => {
                                            const ins = r.insumos.find((i) => i.insumo === row.nombre);
                                            return (
                                              <tr key={r.id}>
                                                <td className="px-2 py-1.5 font-medium text-[var(--text-primary)]">{r.numero}</td>
                                                <td className="px-2 py-1.5 text-[var(--text-secondary)]">{r.fechaSolicitud}</td>
                                                <td className="px-2 py-1.5 text-[var(--text-secondary)]">
                                                  {ins ? qty(ins.cantidad, ins.unidad) : "—"}
                                                </td>
                                                <td className="px-2 py-1.5">
                                                  <Badge color={r.estado === "atendido" ? "green" : r.estado === "parcial" ? "amber" : "blue"}>
                                                    {r.estado === "atendido" ? "Atendido" : r.estado === "parcial" ? "Parcial" : "Pendiente"}
                                                  </Badge>
                                                </td>
                                              </tr>
                                            );
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Movimientos recientes y Lotes próximos a vencer</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-[var(--border-subtle)] rounded-md">
              <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Movimientos recientes</h3>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {recentRequirements.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No hay requerimientos registrados.</p>
                ) : (
                  recentRequirements.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                      <div className="flex shrink-0 items-center gap-1.5">
                        {r.estado === "pendiente" && <PulseDot />}
                        <span className="font-medium text-[var(--text-primary)]">{r.numero}</span>
                      </div>
                      <span className="text-[var(--text-secondary)]">{r.fechaRegistro}</span>
                      <span className="text-[var(--text-secondary)]">{r.registradoPor}</span>
                      <span className="ml-auto text-[var(--text-secondary)]">{r.insumos.length} insumos</span>
                      <Badge color={r.estado === "atendido" ? "green" : r.estado === "parcial" ? "amber" : "blue"}>
                        {r.estado === "atendido" ? "Atendido" : r.estado === "parcial" ? "Parcial" : "Pendiente"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-[var(--border-subtle)] rounded-md">
              <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Lotes próximos a vencer</h3>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {!hasUrgentExpiring ? (
                  <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">Todos los lotes están dentro del rango seguro de vencimiento.</p>
                ) : (
                  expiringLotes.map((l) => {
                    const remaining = daysUntil(l.vencimiento);
                    let urgBadge = null;
                    if (remaining <= 7) {
                      urgBadge = <Badge color="red">Urgente</Badge>;
                    } else if (remaining <= 30) {
                      urgBadge = <Badge color="amber">Próximo</Badge>;
                    }
                    return (
                      <div key={l.id} className="flex items-center gap-3 px-3 py-2.5 text-[13px]">
                        <Calendar className="size-4 shrink-0 text-[var(--text-tertiary)]" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[var(--text-primary)]">{l.insumo}</div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{l.codigoLote} · {qty(l.cantidad, l.unidad)}</div>
                        </div>
                        <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">{l.vencimiento}</span>
                        {urgBadge}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Distribución de Stock por Insumo</h2>
          <div className="border border-[var(--border-subtle)] rounded-md p-4">
            {insumoStatusData.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No hay insumos registrados.</p>
            ) : (
              <div className="space-y-4">
                {insumoStatusData.map((row) => {
                  const pct = Math.min(100, (row.stockTotal / row.maxCapacidad) * 100);
                  const barColor = row.estadoColor === "green" ? "bg-[var(--success)]" : row.estadoColor === "amber" ? "bg-[var(--warning)]" : "bg-[var(--danger)]";
                  return (
                    <div key={row.nombre} className="flex items-center gap-4">
                      <span className="w-36 shrink-0 truncate text-[13px] font-medium text-[var(--text-primary)]" title={row.nombre}>{row.nombre}</span>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-sm bg-[var(--surface-overlay)]">
                          <div className={cn("h-full rounded-sm transition-all duration-600 ease-out", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-0.5 flex justify-between text-[11px] text-[var(--text-tertiary)]">
                          <span>{qty(row.stockTotal, row.unidad)}</span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Requerimientos Activos</h2>
          <div className="overflow-x-auto">
            {activeRequirements.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No hay requerimientos pendientes de atención.</p>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                    <th className="px-3 py-2">N° requerimiento</th>
                    <th className="px-3 py-2">Fecha solicitud</th>
                    <th className="px-3 py-2">Registrado por</th>
                    <th className="px-3 py-2">Insumos</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Días en espera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {activeRequirements.map((r) => {
                    const insumosText = r.insumos.slice(0, 2).map((i) => `${i.insumo} (${i.cantidad}${i.unidad})`).join(", ");
                    const hasMore = r.insumos.length > 2;
                    return (
                      <tr key={r.id} className="group hover:bg-[var(--surface-raised)]">
                        <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">{r.numero}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.fechaSolicitud}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.registradoPor}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                          {insumosText}{hasMore && <span className="text-[var(--text-tertiary)]">…</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge color={r.estado === "pendiente" ? "blue" : "amber"}>
                            {r.estado === "pendiente" ? "Pendiente" : "Parcial"}
                          </Badge>
                        </td>
                        <td className={cn("px-3 py-2.5 font-medium", r.diasEspera > 2 ? "text-[var(--danger)]" : "text-[var(--text-secondary)]")}>
                          {r.diasEspera} días
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {currentUser.role === "jefe" && (
          <section>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Resumen de Usuarios y Responsabilidades</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border border-[var(--border-subtle)] rounded-md">
                <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                  <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Actividad del equipo</h3>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {teamActivity.members.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No hay miembros activos en el equipo.</p>
                  ) : (
                    teamActivity.members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                        <InitialsAvatar name={m.nombre} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[var(--text-primary)]">{m.nombre}</div>
                          <Badge color={m.role === "supervisor" ? "amber" : "gray"}>
                            {m.role === "supervisor" ? "Supervisor" : "Operario"}
                          </Badge>
                        </div>
                        <div className="text-right text-[11px] text-[var(--text-secondary)]">
                          <div className={m.pendingCount > 2 ? "text-[var(--danger)] font-medium" : ""}>
                            Tareas pendientes: {m.pendingCount}
                          </div>
                          <div className="text-[var(--success)]">Completadas: {m.completedCount}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border border-[var(--border-subtle)] rounded-md">
                <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                  <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Últimas responsabilidades asignadas</h3>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {teamActivity.lastTasks.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No hay responsabilidades asignadas recientemente.</p>
                  ) : (
                    teamActivity.lastTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
                        <InitialsAvatar name={t.assigneeName} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] text-[var(--text-primary)]" title={t.description}>
                            {t.description.length > 60 ? `${t.description.slice(0, 60)}…` : t.description}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)]">{t.timestamp}</div>
                        </div>
                        <Badge color={t.status === "completada" ? "green" : "amber"}>
                          {t.status === "completada" ? "Completada" : "Pendiente"}
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
  );
}

function KpiCard({ value, label, valueColor }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
      <div className={`text-[28px] font-bold leading-none ${valueColor || "text-[var(--text-primary)]"}`}>
        {value}
      </div>
      <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{label}</p>
    </div>
  );
}
