import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { Modal, ModalFooter } from '../components/ui/modal.jsx'
import { TextInput } from '../components/ui/form-field.jsx'
import { fmt, qty } from '../lib/utils.js'
import { cn } from '../lib/utils.js'

// Alertas de reabastecimiento — solo supervisores pueden ver y atender
// Se activan cuando el stock de un insumo está por debajo del punto de reorden
export default function AlertasPage() {
  const { alerts, currentUser, attendAlert, addToast, activeAlertCount } = useApp()
  const [filter, setFilter] = useState('')
  const [target, setTarget] = useState(null)

  const isSupervisor = currentUser?.role === 'supervisor'

  // Filtro local por nombre de insumo
  const filtered = useMemo(
    () => alerts.filter((a) => a.insumo.toLowerCase().includes(filter.toLowerCase())),
    [alerts, filter],
  )

  function confirmAttend() {
    if (!target) return
    attendAlert(target.id)
    setTarget(null)
    addToast('Requerimiento enviado al área de Compras correctamente.')
  }

  return (
    <AppShell title="Alertas y Monitoreo" allowedRoles={['supervisor']}>
      {/* Estado vacío — todo en orden, sin alertas activas */}
      {activeAlertCount === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-sm text-muted-foreground">
            No hay alertas de reabastecimiento activas en este momento.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Alertas activas:</span>
            <Badge color="red">{activeAlertCount}</Badge>
          </div>

          <div className="mb-5 max-w-sm">
            <TextInput
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por insumo…"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                isSupervisor={isSupervisor}
                onAttend={() => setTarget(alert)}
              />
            ))}
          </div>
        </>
      )}

      <Modal open={!!target} onClose={() => setTarget(null)} title="Confirmar atención de alerta">
        <p className="text-sm text-muted-foreground">
          Se registrará el envío de un requerimiento de reabastecimiento para{' '}
          <span className="font-medium text-foreground">{target?.insumo}</span>{' '}
          al área de Compras. Esta acción no puede deshacerse.
        </p>
        {target && (
          <div className="mt-4 rounded-md bg-muted px-3 py-2.5 text-sm text-foreground">
            Stock actual: {qty(target.stockActual, target.unidad)} · Punto de reorden:{' '}
            {qty(target.puntoReorden, target.unidad)} · Déficit:{' '}
            {qty(target.puntoReorden - target.stockActual, target.unidad)}
          </div>
        )}
        <ModalFooter>
          <ActionButton variant="ghost" onClick={() => setTarget(null)}>Cancelar</ActionButton>
          <ActionButton onClick={confirmAttend}>Confirmar</ActionButton>
        </ModalFooter>
      </Modal>
    </AppShell>
  )
}

function AlertRow({ alert, isSupervisor, onAttend }) {
  const attended = !!alert.atendida
  const deficit = alert.puntoReorden - alert.stockActual

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border border-border border-l-4 bg-card px-4 py-4',
        attended ? 'border-l-success' : 'border-l-critical',
      )}
    >
      {attended ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
      ) : (
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-critical" />
      )}

      <div className="min-w-0 flex-1">
        <div className={cn('text-base', attended ? 'font-normal text-muted-foreground' : 'font-bold text-foreground')}>
          {alert.insumo}
        </div>
        <p className={cn('mt-0.5 text-sm', attended ? 'text-muted-foreground/70' : 'text-muted-foreground')}>
          Stock actual: {qty(alert.stockActual, alert.unidad)} · Punto de reorden:{' '}
          {qty(alert.puntoReorden, alert.unidad)} · Déficit: {qty(deficit, alert.unidad)} · Lead time del proveedor:{' '}
          {fmt(alert.leadTime)} días
        </p>
        {attended && (
          <p className="mt-1 text-xs text-success">
            Atendida el {alert.atendida.fecha} por {alert.atendida.por}
          </p>
        )}
      </div>

      {!attended && (
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">Generada: {alert.generada}</span>
          {isSupervisor ? (
            <ActionButton className="h-8 px-3 text-xs" onClick={onAttend}>Atender alerta</ActionButton>
          ) : (
            <span className="text-xs text-muted-foreground">Solo el supervisor puede atender</span>
          )}
        </div>
      )}
    </div>
  )
}
