import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ClipboardList, Boxes } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { ROLE_LABEL } from '../lib/types.js'
import { AppShell } from '../components/app-shell.jsx'
import { TaskRow } from '../components/task-row.jsx'
import { Badge } from '../components/ui/status-badge.jsx'

export default function InicioPage() {
  const { currentUser } = useApp()
  if (!currentUser) return null
  return (
    <AppShell title="Inicio">
      {currentUser.role === 'operario' ? (
        <OperarioDashboard />
      ) : currentUser.role === 'supervisor' ? (
        <SupervisorDashboard />
      ) : (
        <JefeDashboard />
      )}
    </AppShell>
  )
}

function MyPending() {
  const { currentUser, tasks } = useApp()
  const mine = tasks.filter((t) => t.assigneeId === currentUser?.id)
  const pending = mine.filter((t) => t.status === 'pendiente')

  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Mis Pendientes</h2>
        <Badge color="amber">{pending.length}</Badge>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-card px-4">
        {mine.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tienes más tareas pendientes.
          </p>
        ) : (
          <>
            {mine.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
            {pending.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No tienes más tareas pendientes.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function OperarioDashboard() {
  const { currentUser } = useApp()
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Buenos días, {currentUser?.name}</h1>
        <Badge color="gray">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>
      <MyPending />
    </div>
  )
}

function SupervisorDashboard() {
  const { currentUser, activeAlertCount, pendingReqCount } = useApp()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Buenos días, {currentUser?.name}</h1>
        <Badge color="amber">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>

      <MyPending />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <KpiWidget
          icon={<AlertTriangle className="size-5 text-critical" />}
          value={activeAlertCount}
          valueColor="text-critical"
          label="Alertas de reabastecimiento activas"
          link="Ver alertas →"
          onClick={() => navigate('/alertas')}
        />
        <KpiWidget
          icon={<ClipboardList className="size-5 text-warning" />}
          value={pendingReqCount}
          valueColor="text-warning"
          label="Requerimientos pendientes de atención"
          link="Ver requerimientos →"
          onClick={() => navigate('/requerimientos')}
        />
      </div>
    </div>
  )
}

function JefeDashboard() {
  const { currentUser, inventory } = useApp()
  const lotes = inventory.length + 141

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Buenos días, {currentUser?.name}</h1>
        <Badge color="navy">{ROLE_LABEL[currentUser.role]}</Badge>
      </div>

      <div className="mt-8">
        <KpiWidget
          icon={<Boxes className="size-5 text-success" />}
          value={lotes}
          valueColor="text-success"
          label="Lotes registrados en inventario"
        />
      </div>
    </div>
  )
}

function KpiWidget({ icon, value, valueColor, label, link, onClick }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-2xl font-bold leading-none ${valueColor}`}>{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        {link && (
          <button
            type="button"
            onClick={onClick}
            className="mt-1 text-xs font-medium text-primary hover:underline"
          >
            {link}
          </button>
        )}
      </div>
    </div>
  )
}
