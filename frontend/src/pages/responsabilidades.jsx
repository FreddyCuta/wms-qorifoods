import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { ROLE_LABEL } from "../lib/types.js";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { TextArea } from "../components/ui/form-field.jsx";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export default function ResponsabilidadesPage() {
  const { users, tasks, assignTask, addToast } = useApp();
  const [selectedUser, setSelectedUser] = useState(null);
  const [description, setDescription] = useState("");

  const staffUsers = users.filter((u) => u.role !== "jefe" && u.active);

  function pendingTasksFor(userId) { return tasks.filter((t) => t.assigneeId === userId && t.status === "pendiente").length; }
  function userTasks(userId) { return tasks.filter((t) => t.assigneeId === userId); }

  function handleAssign() {
    if (!selectedUser || !description.trim()) return;
    assignTask(selectedUser.id, description.trim());
    setDescription("");
    addToast(`Responsabilidad asignada a ${selectedUser.nombre}`);
  }

  function getStatusBadge(status) {
    return status === "pendiente" ? <Badge color="amber">Pendiente</Badge> : <Badge color="green">Completada</Badge>;
  }

  return (
    <AppShell title="Asignar Responsabilidades" allowedRoles={["jefe"]}>
      <div className="max-w-4xl">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Asignar tareas a Operarios y Supervisores</h2>

        <div className="grid gap-2">
          {staffUsers.map((user) => {
            const pending = pendingTasksFor(user.id);
            return (
              <button key={user.id} type="button" onClick={() => setSelectedUser(user)} className="flex items-center justify-between rounded-sm border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-raised)] text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--sidebar-accent)]/20 text-[11px] font-medium text-[var(--accent-text)]">
                    {initials(user.nombre)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--text-primary)] text-[13px]">{user.nombre}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{ROLE_LABEL[user.role]} · {pending} responsabilidad{pending !== 1 ? "es" : ""} pendiente{pending !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="shrink-0 text-[var(--text-tertiary)] text-[13px]">→</div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedUser(null)} aria-hidden="true" />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col overflow-hidden border-l border-[var(--border-default)] bg-white shadow-lg">
            <div className="flex items-start justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--sidebar-accent)]/20 text-[11px] font-medium text-[var(--accent-text)]">
                  {initials(selectedUser.nombre)}
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">{selectedUser.nombre}</h2>
                  <div className="text-[11px] text-[var(--text-secondary)]">{ROLE_LABEL[selectedUser.role]}</div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} aria-label="Cerrar" className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h3 className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Responsabilidades asignadas</h3>
              {userTasks(selectedUser.id).length === 0 ? (
                <p className="mb-4 text-[11px] text-[var(--text-tertiary)]">No hay responsabilidades asignadas.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {userTasks(selectedUser.id).map((task) => (
                    <div key={task.id} className="rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex-1 text-[12px] text-[var(--text-primary)]">{task.description}</p>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">Asignada: {task.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-4 h-px bg-[var(--border-subtle)]" />

              <h3 className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Asignar nueva responsabilidad</h3>
              <div className="space-y-2">
                <div className="relative">
                  <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Verificar el ingreso del lote LOT-2026-0052 en Rack 4" rows={3} maxLength={300} className="resize-none" />
                  <p className="mt-1 text-right text-[11px] text-[var(--text-tertiary)]">{description.length}/300</p>
                </div>
                <ActionButton onClick={handleAssign} disabled={!description.trim()} fullWidth>Asignar</ActionButton>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
