import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { ROLE_LABEL } from '../lib/types.js'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { TextArea } from '../components/ui/form-field.jsx'

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

// Asignación de tareas/responsabilidades a operarios y supervisores — solo jefe
export default function ResponsabilidadesPage() {
  const { users, tasks, assignTask, addToast } = useApp()
  const [selectedUser, setSelectedUser] = useState(null)
  const [description, setDescription] = useState('')

  // Filtra solo personal activo que no sea jefe — el jefe no se asigna tareas a sí mismo
  const staffUsers = users.filter((u) => u.role !== 'jefe' && u.active)

  function pendingTasksFor(userId) {
    return tasks.filter((t) => t.assigneeId === userId && t.status === 'pendiente').length
  }

  function userTasks(userId) {
    return tasks.filter((t) => t.assigneeId === userId)
  }

  function handleAssign() {
    if (!selectedUser || !description.trim()) return
    assignTask(selectedUser.id, description.trim())
    setDescription('')
    addToast(`Responsabilidad asignada a ${selectedUser.name}`)
  }

  function getStatusBadge(status) {
    return status === 'pendiente' ? <Badge color="amber">Pendiente</Badge> : <Badge color="green">Completada</Badge>
  }

  return (
    <AppShell title="Asignar Responsabilidades" allowedRoles={['jefe']}>
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-base font-semibold text-foreground">Asignar tareas a Operarios y Supervisores</h2>

        <div className="grid gap-4">
          {staffUsers.map((user) => {
            const pending = pendingTasksFor(user.id)
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUser(user)}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40 hover:border-primary/50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-medium text-brand-foreground">
                    {initials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {ROLE_LABEL[user.role]} · {pending} responsabilidade{pending !== 1 ? 's' : ''} pendiente{pending !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-muted-foreground">→</div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedUser && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedUser(null)} aria-hidden="true" />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col overflow-hidden rounded-l-lg border-l border-border bg-card shadow-lg">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-medium text-brand-foreground">
                  {initials(selectedUser.name)}
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{selectedUser.name}</h2>
                  <div className="text-xs text-muted-foreground">{ROLE_LABEL[selectedUser.role]}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Cerrar"
                className="relative z-10 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Responsabilidades asignadas</h3>
              {userTasks(selectedUser.id).length === 0 ? (
                <p className="mb-4 text-xs text-muted-foreground">No hay responsabilidades asignadas.</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {userTasks(selectedUser.id).map((task) => (
                    <div key={task.id} className="rounded-md border border-border bg-muted/40 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex-1 text-xs text-foreground">{task.description}</p>
                        {getStatusBadge(task.status)}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">Asignada: {task.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-4 h-px bg-border" />

              <h3 className="mb-3 text-sm font-semibold text-foreground">Asignar nueva responsabilidad</h3>
              <div className="space-y-2">
                <div className="relative">
                  <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej: Verificar el ingreso del lote LOT-2026-0052 en Rack 4"
                    rows={3}
                    maxLength={300}
                    className="resize-none"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/300</p>
                </div>
                <ActionButton onClick={handleAssign} disabled={!description.trim()} fullWidth>
                  Asignar
                </ActionButton>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}
