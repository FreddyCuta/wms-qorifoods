import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";

function statusBadge(estado) {
  if (estado === "pendiente") return <Badge color="amber">Pendiente</Badge>;
  if (estado === "parcial") return <Badge color="blue">Parcial</Badge>;
  return <Badge color="green">Atendido</Badge>;
}

export default function RequerimientosPage() {
  const { currentUser, requirements, pendingReqCount } = useApp();
  const navigate = useNavigate();
  const isSupervisor = currentUser?.role === "supervisor";
  const isOperario = currentUser?.role === "operario";

  return (
    <AppShell title="Requerimientos de Producción" allowedRoles={["supervisor", "operario"]}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Listado de Requerimientos</h2>
          <Badge color="amber">{pendingReqCount} pendientes</Badge>
        </div>
        {isSupervisor && (
          <ActionButton onClick={() => navigate("/requerimientos/nuevo")} size="sm">
            <Plus className="size-4" />
            Nuevo Requerimiento
          </ActionButton>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
              <th className="px-3 py-2">N° Requerimiento</th>
              <th className="px-3 py-2">Fecha de solicitud</th>
              <th className="px-3 py-2">Fecha de registro</th>
              <th className="px-3 py-2">Registrado por</th>
              <th className="px-3 py-2">N° de insumos</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {requirements.map((r) => (
              <tr key={r.id} className="group hover:bg-[var(--surface-raised)]">
                <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">{r.numero}</td>
                <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.fechaSolicitud}</td>
                <td className="px-3 py-2.5 text-[var(--text-secondary)]">{r.fechaRegistro}</td>
                <td className="px-3 py-2.5 text-[var(--text-primary)]">{r.registradoPorNombre}</td>
                <td className="px-3 py-2.5 text-[var(--text-primary)]">{r.insumos.length} {r.insumos.length === 1 ? "insumo" : "insumos"}</td>
                <td className="px-3 py-2.5">{statusBadge(r.estado)}</td>
                <td className="px-3 py-2.5 text-right">
                  {r.estado === "atendido" ? (
                    <span className="text-[11px] text-[var(--text-tertiary)]">Completado</span>
                  ) : isOperario && r.estado !== "atendido" ? (
                    <ActionButton size="sm" variant="ghost" onClick={() => navigate(`/requerimientos/${r.id}/atender`)}>
                      Atender
                    </ActionButton>
                  ) : (
                    <span className="text-[11px] text-[var(--text-tertiary)]">Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
