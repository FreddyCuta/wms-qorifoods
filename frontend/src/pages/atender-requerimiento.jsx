import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { Modal, ModalFooter } from '../components/ui/modal.jsx'
import { Field, TextInput } from '../components/ui/form-field.jsx'
import { qty } from '../lib/utils.js'

function sugerirLoteFefo(inventory, insumo) {
  const lots = inventory
    .filter((l) => l.insumo === insumo && l.cantidad > 0)
    .sort((a, b) => {
      const [da, ma, ya] = a.vencimiento.split('/').map(Number)
      const [db, mb, yb] = b.vencimiento.split('/').map(Number)
      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db)
    })
  if (lots.length === 0) return null
  const l = lots[0]
  return { lote: l.codigoLote, vence: l.vencimiento, ubicacion: l.ubicacion }
}

export default function AtenderRequerimientoPage() {
  const { id } = useParams()
  const { requirements, inventory, currentUser, attendRequirement, addToast } = useApp()
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

  const stockDisponible = {}
  inventory.forEach((lot) => {
    if (lot.cantidad > 0) {
      stockDisponible[lot.insumo] = (stockDisponible[lot.insumo] || 0) + lot.cantidad
    }
  })

  const salidas = req.insumos.map((item) => {
    const yaAtendido = item.atendido || 0
    const pendiente = Math.max(0, item.cantidad - yaAtendido)
    const cantidad = Number(salidaQtys[item.insumo] || 0)
    const esCompleto = (yaAtendido + cantidad) >= item.cantidad
    const esInsuficiente = cantidad > 0 && (yaAtendido + cantidad) < item.cantidad
    const completadoPrevio = yaAtendido >= item.cantidad
    return { ...item, pendiente, salidaQty: cantidad, yaAtendido, esCompleto, esInsuficiente, completadoPrevio }
  })

  const todasComplete = salidas.every((s) => (s.yaAtendido + s.salidaQty) >= s.cantidad)
  const algunaFaltante = salidas.some((s) => s.salidaQty > 0 && (s.yaAtendido + s.salidaQty) < s.cantidad)
  const hayAlgoParaAtender = salidas.some((s) => s.salidaQty > 0)

  function handleSalidaChange(insumo, valor) {
    const q = Math.max(0, Number(valor) || 0)
    const item = req.insumos.find((i) => i.insumo === insumo)
    const yaAtendido = item?.atendido || 0
    const pendiente = Math.max(0, (item?.cantidad || 0) - yaAtendido)
    const maxStock = stockDisponible[insumo] || 0
    const maximo = Math.min(pendiente, maxStock)
    setSalidaQtys({ ...salidaQtys, [insumo]: Math.min(q, maximo) })
  }

  function handleComplete() {
    if (salidas.some((s) => s.salidaQty > 0)) setConfirmOpen(true)
  }

  function confirmSalida() {
    const salidaMap = {}
    salidas.forEach((s) => {
      if (s.salidaQty > 0) salidaMap[s.insumo] = s.salidaQty
    })
    attendRequirement(req.id, salidaMap, currentUser)
    setConfirmOpen(false)
    const completoAhora = Object.entries(salidaMap).every(([insumo, qty]) => {
      const item = req.insumos.find((i) => i.insumo === insumo)
      return item && ((item.atendido || 0) + qty) >= item.cantidad
    })
    const status = completoAhora ? 'completado' : 'parcialmente atendido'
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

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Registrar salidas para {req.numero}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>Registrado por: {req.registradoPor}</span>
            <span aria-hidden>·</span>
            <span>Fecha: {req.fechaSolicitud}</span>
          </div>
        </div>
        {req.atenciones?.length > 0 && (
          <Badge color="amber">{req.atenciones.length} atención(es) previa(s)</Badge>
        )}
      </div>

      {req.atenciones?.length > 0 && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-foreground">
          <p className="font-medium">Atenciones previas:</p>
          {req.atenciones.map((a, i) => (
            <p key={i} className="mt-1 text-xs text-muted-foreground">
              {a.fecha} por {a.por}: {Object.entries(a.insumos).map(([ins, q]) => `${q} ${ins}`).join(', ')}
            </p>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Insumos solicitados para producción</h2>
        <div className="flex flex-col gap-4">
          {salidas.map((item) => {
            const fefo = sugerirLoteFefo(inventory, item.insumo) || { lote: 'N/A', vence: 'N/A', ubicacion: 'N/A' }
            const hayStock = stockDisponible[item.insumo] > 0
            return (
              <div key={item.insumo} className={`rounded-lg border ${item.completadoPrevio ? 'border-success/40 bg-success/5' : 'border-border bg-muted'} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">{item.insumo}</h3>
                    <p className="text-xs text-muted-foreground">
                      Lote sugerido (FEFO): {fefo.lote} | Vence: {fefo.vence} | {fefo.ubicacion}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{qty(stockDisponible[item.insumo] || 0, item.unidad)}</div>
                    <div className="text-xs text-muted-foreground">Stock disponible</div>
                  </div>
                </div>

                {item.yaAtendido > 0 && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    Ya atendido: <span className="font-medium text-foreground">{qty(item.yaAtendido, item.unidad)}</span>
                    {item.pendiente > 0 && (
                      <span>· Pendiente: <span className="font-medium text-warning">{qty(item.pendiente, item.unidad)}</span></span>
                    )}
                  </div>
                )}

                {item.completadoPrevio ? (
                  <div className="flex items-center gap-2 rounded bg-success/10 px-3 py-2 text-xs text-success font-medium">
                    <CheckCircle2 className="size-4" />
                    Completado — este insumo ya fue despachado en su totalidad
                  </div>
                ) : (
                  <>
                    {!hayStock && (
                      <div className="mb-3 flex items-center gap-2 rounded bg-critical/10 px-3 py-2 text-xs text-critical">
                        <AlertTriangle className="size-3.5" />
                        Sin stock disponible
                      </div>
                    )}

                    <Field label={`Cantidad a despachar ahora (máx: ${qty(item.pendiente, item.unidad)})`}>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                          <TextInput
                            type="number"
                            min="0"
                            max={item.pendiente}
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
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {algunaFaltante && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="text-sm text-warning">
            <p className="font-medium">Stock insuficiente para completar todo</p>
            <p className="text-xs mt-1">Se despachará lo disponible. El requerimiento quedará como parcial hasta que llegue más stock y se complete la atención.</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <ActionButton variant="ghost" onClick={() => navigate('/requerimientos')}>Cancelar</ActionButton>
        <ActionButton onClick={handleComplete} disabled={!hayAlgoParaAtender}>
          Registrar salidas
        </ActionButton>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar registro de salidas">
        <div className="space-y-4">
          {todasComplete ? (
            <p className="text-sm text-foreground">
              Todas las cantidades solicitadas serán despachadas. El requerimiento se marcará como completado.
            </p>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/8 px-3 py-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">Este requerimiento quedará como parcialmente atendido. Podrá completarse cuando haya más stock disponible.</p>
            </div>
          )}
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-foreground">Resumen de esta atención:</h4>
            {salidas.filter((s) => s.salidaQty > 0).map((item) => (
              <div key={item.insumo} className="flex justify-between text-muted-foreground">
                <span>{item.insumo}</span>
                <span className="font-medium">{qty(item.salidaQty, item.unidad)}</span>
              </div>
            ))}
          </div>
          {salidas.some((s) => s.yaAtendido > 0) && (
            <div className="space-y-2 text-sm">
              <h4 className="font-medium text-foreground">Acumulado total (previa + esta):</h4>
              {salidas.filter((s) => s.yaAtendido + s.salidaQty > 0).map((item) => {
                const total = item.yaAtendido + item.salidaQty
                return (
                  <div key={item.insumo} className="flex justify-between text-muted-foreground">
                    <span>{item.insumo}</span>
                    <span className="font-medium">{qty(total, item.unidad)} / {qty(item.cantidad, item.unidad)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <ModalFooter>
          <ActionButton variant="ghost" onClick={() => setConfirmOpen(false)}>Cancelar</ActionButton>
          <ActionButton onClick={confirmSalida}>Confirmar salidas</ActionButton>
        </ModalFooter>
      </Modal>
    </AppShell>
  )
}
