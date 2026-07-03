import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { Modal, ModalFooter } from "../components/ui/modal.jsx";
import { TextInput } from "../components/ui/form-field.jsx";
import { fmt, qty } from "../lib/utils.js";
import { cn } from "../lib/utils.js";

export default function AlertasPage() {
  const { alerts, currentUser, attendAlert, addToast, activeAlertCount } = useApp();
  const [filter, setFilter] = useState("");
  const [target, setTarget] = useState(null);

  const isSupervisor = currentUser?.role === "supervisor";

  const filtered = useMemo(() => alerts.filter((a) => a.insumo.toLowerCase().includes(filter.toLowerCase())), [alerts, filter]);

  function confirmAttend() {
    if (!target) return;
    attendAlert(target.insumoId, currentUser.id);
    setTarget(null);
    addToast("Requerimiento enviado al área de Compras correctamente.");
  }

  return (
    <AppShell title="Alertas y Monitoreo" allowedRoles={["supervisor"]}>
      {activeAlertCount === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[13px] text-[var(--text-tertiary)]">No hay alertas de reabastecimiento activas en este momento.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[18px] font-semibold text-[var(--text-primary)]">Alertas activas:</span>
            <Badge color="red">{activeAlertCount}</Badge>
          </div>

          <div className="mb-3 max-w-sm">
            <TextInput value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por insumo…" />
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map((alert) => (
              <AlertRow key={alert.id} alert={alert} isSupervisor={isSupervisor} onAttend={() => setTarget(alert)} />
            ))}
          </div>
        </>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Confirmar atención de alerta"
        footer={
          <>
            <ActionButton variant="ghost" size="sm" onClick={() => setTarget(null)}>Cancelar</ActionButton>
            <ActionButton onClick={confirmAttend}>Confirmar</ActionButton>
          </>
        }
      >
        <p className="text-[13px] text-[var(--text-secondary)]">
          Se registrará el envío de un requerimiento de reabastecimiento para <span className="font-medium text-[var(--text-primary)]">{target?.insumo}</span> al área de Compras. Esta acción no puede deshacerse.
        </p>
        {target && (
          <div className="mt-4 rounded-sm bg-[var(--surface-overlay)] px-3 py-2.5 text-[13px] text-[var(--text-primary)]">
            Stock actual: {qty(target.stockActual, target.unidad)} · Punto de reorden: {qty(target.puntoReorden, target.unidad)} · Déficit: {qty(target.puntoReorden - target.stockActual, target.unidad)}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

function AlertRow({ alert, isSupervisor, onAttend }) {
  const attended = !!alert.atendidaId;
  const deficit = alert.puntoReorden - alert.stockActual;

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-sm border border-[var(--border-subtle)] bg-[var(--surface)] p-3 border-l-[3px]",
      attended ? "border-l-[var(--success)]" : "border-l-[var(--danger)]",
    )}>
      {attended ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
      ) : (
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--danger)]" />
      )}

      <div className="min-w-0 flex-1">
        <div className={cn("text-[14px]", attended ? "font-normal text-[var(--text-secondary)]" : "font-semibold text-[var(--text-primary)]")}>
          {alert.insumo}
        </div>
        <p className={cn("mt-0.5 text-[13px]", attended ? "text-[var(--text-tertiary)]" : "text-[var(--text-secondary)]")}>
          Stock actual: {qty(alert.stockActual, alert.unidad)} · Punto de reorden: {qty(alert.puntoReorden, alert.unidad)} · Déficit: {qty(deficit, alert.unidad)} · Lead time del proveedor: {fmt(alert.leadTime)} días
        </p>
        {attended && <p className="mt-1 text-[11px] text-[var(--success)]">Atendida el {alert.atendidaFecha} por {alert.atendidaPor}</p>}
      </div>

      {!attended && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          {isSupervisor ? (
            <ActionButton size="sm" variant="ghost" onClick={onAttend}>Atender alerta</ActionButton>
          ) : (
            <span className="text-[11px] text-[var(--text-tertiary)]">Solo el supervisor puede atender</span>
          )}
        </div>
      )}
    </div>
  );
}
