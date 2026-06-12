import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { Modal, ModalFooter } from '../components/ui/modal.jsx'
import { Field, TextInput } from '../components/ui/form-field.jsx'
import { qty } from '../lib/utils.js'

const FEFO = {
  'Sémola de trigo': { lote: 'LOT-2026-0018', vence: '15/08/2026', ubicacion: 'Pasillo A – Rack 2 – Nivel 1' },
  'Harina de trigo': { lote: 'LOT-2026-0021', vence: '10/07/2026', ubicacion: 'Pasillo B – Rack 1 – Nivel 3' },
  'Aceite vegetal': { lote: 'LOT-2026-0009', vence: '22/06/2026', ubicacion: 'Pasillo C – Rack 3 – Nivel 2' },
  'Quinua orgánica': { lote: 'LOT-2026-0035', vence: '01/10/2026', ubicacion: 'Pasillo D – Rack 1 – Nivel 2' },
  'Sal yodada': { lote: 'LOT-2026-0031', vence: '30/12/2026', ubicacion: 'Pasillo A – Rack 1 – Nivel 1' },
}

export default function AtenderRequerimientoPage() {
  const { id } = useParams()
  const { requirements, attendRequirement, addToast } = useApp()
  const navigate = useNavigate()
  const [salidaQtys, setSalidaQtys] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const req = requirements.find((r) => r.id === id)

  if (!req) {
    return (
      <AppShell title="Atender Requerimiento" allowedRoles={['operario']}>
        <p className="text-sm text-muted-foreground">Requerimiento no encontrado.</p>
      </AppShell>
    )
  }

  const salidas = req.insumos.map((item) => {
    const cantidad = Number(salidaQtys[item.insumo] || 0)
    const esCompleto = cantidad === item.cantidad
    const esInsuficiente = cantidad < item.cantidad && cantidad > 0
    return { ...item, salidaQty: cantidad, esCompleto, esInsuficiente }
  })

  const todasComplete = salidas.every((s) => s.salidaQty === s.cantidad)
  const algunaFaltante = salidas.some((s) => s.salidaQty > 0 && s.salidaQty < s.cantidad)

  function handleSalidaChange(insumo, valor) {
    const q = Math.max(0, Number(valor) || 0)
    const maxQty = req.insumos.find((i) => i.insumo === insumo)?.cantidad || 0
    setSalidaQtys({ ...salidaQtys, [insumo]: Math.min(q, maxQty) })
  }

  function handleComplete() {
    if (salidas.every((s) => s.salidaQty > 0)) setConfirmOpen(true)
  }

  function confirmSalida() {
    attendRequirement(req.id)
    setConfirmOpen(false)
    const status = todasComplete ? 'completado' : 'parcialmente atendido'
    addToast(`Requerimiento ${req.numero} ${status}. Salidas de insumos registradas.`)
    navigate('/requerimientos')
  }

  return (
    <AppShell title="Atender Requerimiento" allowedRoles={['operario']}>
      <button
        type="button"
        onClick={() => navigate('/requerimientos')}
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Requerimientos
      </button>

      <h1 className="text-xl font-bold text-foreground">
        Registrar salidas para REQ-{req.numero}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>Registrado por: {req.registradoPor}</span>
        <span aria-hidden>·</span>
        <span>Fecha: {req.fechaSolicitud}</span>
      </div>

      <div className="mt-5 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Insumos solicitados para producción</h2>
        <div className="flex flex-col gap-4">
          {salidas.map((item) => {
            const fefo = FEFO[item.insumo] || { lote: 'N/A', vence: 'N/A', ubicacion: 'N/A' }
            const hayStock = item.stock > 0
            return (
              <div key={item.insumo} className="rounded-lg border border-border bg-muted p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{item.insumo}</h3>
                    <p className="text-xs text-muted-foreground">
                      Lote: {fefo.lote} | Vence: {fefo.vence} | {fefo.ubicacion}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{qty(item.stock, item.unidad)}</div>
                    <div className="text-xs text-muted-foreground">Stock disponible</div>
                  </div>
                </div>

                {!hayStock && (
                  <div className="mb-3 flex items-center gap-2 rounded bg-critical/10 px-3 py-2 text-xs text-critical">
                    <AlertTriangle className="size-3.5" />
                    Sin stock disponible
                  </div>
                )}

                <Field label={`Cantidad a registrar para salida (máximo: ${qty(item.cantidad, item.unidad)})`}>
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <TextInput
                        type="number"
                        min="0"
                        max={item.cantidad}
                        value={salidaQtys[item.insumo] || ''}
                        onChange={(e) => handleSalidaChange(item.insumo, e.target.value)}
                        placeholder="0"
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {item.unidad}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        color={
                          item.salidaQty === 0 ? 'gray'
                          : item.esCompleto ? 'green'
                          : item.esInsuficiente ? 'amber'
                          : 'gray'
                        }
                      >
                        {item.salidaQty === 0 ? 'Pendiente' : item.esCompleto ? 'Completo' : 'Parcial'}
                      </Badge>
                    </div>
                  </div>
                </Field>
              </div>
            )
          })}
        </div>
      </div>

      {algunaFaltante && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm text-warning">
            <p className="font-medium">Stock insuficiente</p>
            <p className="text-xs mt-1">Algunas cantidades son inferiores a lo solicitado. Se registrará como atención parcial.</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <ActionButton variant="ghost" onClick={() => navigate('/requerimientos')}>Cancelar</ActionButton>
        <ActionButton onClick={handleComplete} disabled={!salidas.every((s) => s.salidaQty > 0)}>
          Registrar salidas
        </ActionButton>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar registro de salidas">
        <div className="space-y-4">
          {todasComplete ? (
            <p className="text-sm text-foreground">
              Todas las cantidades serán despachadas. El requerimiento se marcará como completado.
            </p>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">Este requerimiento se marcará como parcialmente atendido.</p>
            </div>
          )}
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-foreground">Resumen de salidas:</h4>
            {salidas.map((item) => (
              <div key={item.insumo} className="flex justify-between text-muted-foreground">
                <span>{item.insumo}</span>
                <span className="font-medium">{qty(item.salidaQty, item.unidad)}</span>
              </div>
            ))}
          </div>
        </div>
        <ModalFooter>
          <ActionButton variant="ghost" onClick={() => setConfirmOpen(false)}>Cancelar</ActionButton>
          <ActionButton onClick={confirmSalida}>Confirmar salidas</ActionButton>
        </ModalFooter>
      </Modal>
    </AppShell>
  )
}
