import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";

function statusBadge(estado) {
  if (estado === "pendiente") return <Badge color="amber">Pendiente</Badge>;
  if (estado === "parcial")
    return <Badge color="blue">Atendido parcialmente</Badge>;
  return <Badge color="green">Atendido</Badge>;
}

// Listado de requerimientos de producción — solo supervisores y operarios
// Los supervisores pueden crear nuevos; los operarios solo atenden los pendientes
export default function RequerimientosPage() {
  const { currentUser, requirements, pendingReqCount } = useApp();
  const navigate = useNavigate();
  const isSupervisor = currentUser?.role === "supervisor";
  const isOperario = currentUser?.role === "operario";

  return (
    <AppShell
      title="Requerimientos de Producción"
      allowedRoles={["supervisor", "operario"]}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Listado de Requerimientos
          </h2>
          <Badge color="amber">{pendingReqCount} pendientes</Badge>
        </div>
        {/* Botón "Nuevo Requerimiento" solo visible para supervisores */}
        {isSupervisor && (
          <ActionButton onClick={() => navigate("/requerimientos/nuevo")}>
            <Plus className="size-4" />
            Nuevo Requerimiento
          </ActionButton>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">N° Requerimiento</th>
              <th className="px-4 py-3">Fecha de solicitud</th>
              <th className="px-4 py-3">Fecha de registro</th>
              <th className="px-4 py-3">Registrado por</th>
              <th className="px-4 py-3">N° de insumos</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requirements.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">
                  {r.numero}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.fechaSolicitud}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.fechaRegistro}
                </td>
                <td className="px-4 py-3 text-foreground">{r.registradoPor}</td>
                <td className="px-4 py-3 text-foreground">
                  {r.insumos.length}{" "}
                  {r.insumos.length === 1 ? "insumo" : "insumos"}
                </td>
                <td className="px-4 py-3">{statusBadge(r.estado)}</td>
                <td className="px-4 py-3 text-right">
                  {r.estado === "atendido" ? (
                    <span className="text-xs text-muted-foreground">
                      Completado
                    </span>
                  ) : isOperario && r.estado !== "atendido" ? (
                    <ActionButton
                      className="h-8 px-3 text-xs"
                      onClick={() =>
                        navigate(`/requerimientos/${r.id}/atender`)
                      }
                    >
                      Atender
                    </ActionButton>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Pendiente
                    </span>
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
