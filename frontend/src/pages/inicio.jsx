import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store.jsx";
import { ROLE_LABEL } from "../lib/types.js";
import { AppShell } from "../components/app-shell.jsx";
import { TaskRow } from "../components/task-row.jsx";
import { Badge } from "../components/ui/status-badge.jsx";

export default function InicioPage() {
  const { currentUser } = useApp();
  if (!currentUser) return null;
  return (
    <AppShell title="Inicio">
      {currentUser.role === "operario" ? (
        <OperarioDashboard />
      ) : currentUser.role === "supervisor" ? (
        <SupervisorDashboard />
      ) : (
        <JefeDashboard />
      )}
    </AppShell>
  );
}

function MyPending() {
  const { currentUser, tasks } = useApp();
  const mine = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const pending = mine.filter((t) => t.status === "pendiente");

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Mis Pendientes</h2>
        <Badge color="amber">{pending.length}</Badge>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {mine.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No tienes más tareas pendientes.</p>
        ) : (
          <>
            {mine.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
            {pending.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[var(--text-tertiary)]">No tienes más tareas pendientes.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function OperarioDashboard() {
  const { currentUser } = useApp();
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Buenos días, {currentUser?.nombre}</h1>
        <Badge color="gray">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>
      <MyPending />
    </div>
  );
}

function SupervisorDashboard() {
  const { currentUser, activeAlertCount } = useApp();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Buenos días, {currentUser?.nombre}</h1>
        <Badge color="amber">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>

      <MyPending />

      <div className="mt-4">
        <KpiCard
          value={activeAlertCount}
          valueColor={activeAlertCount > 0 ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}
          label="Alertas de reabastecimiento activas"
          link={activeAlertCount > 0 ? "Ver alertas" : undefined}
          onClick={() => navigate("/alertas")}
        />
      </div>
    </div>
  );
}

function JefeDashboard() {
  const { currentUser, inventory } = useApp();
  const lotes = inventory.length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Buenos días, {currentUser?.nombre}</h1>
        <Badge color="gray">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>

      <div className="mt-4">
        <KpiCard
          value={lotes}
          label="Lotes registrados en inventario"
        />
      </div>
    </div>
  );
}

function KpiCard({ value, valueColor, label, link, onClick }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-4 max-w-sm">
      <div className={`text-[28px] font-bold leading-none ${valueColor || "text-[var(--text-primary)]"}`}>
        {value}
      </div>
      <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{label}</p>
      {link && (
        <button
          type="button"
          onClick={onClick}
          className="mt-1 text-[11px] font-medium text-[var(--accent)] hover:underline"
        >
          {link}
        </button>
      )}
    </div>
  );
}
