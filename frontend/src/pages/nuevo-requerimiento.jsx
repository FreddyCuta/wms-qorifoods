import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, AlertTriangle } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { INSUMOS } from '../lib/data.js'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Field, SelectInput, TextInput } from '../components/ui/form-field.jsx'
import { qty } from '../lib/utils.js'

const STOCK = {
  'Sémola de trigo': { value: 1200, unit: 'kg' },
  'Harina de trigo': { value: 0, unit: 'kg' },
  'Aceite vegetal': { value: 30, unit: 'L' },
  'Sal yodada': { value: 0, unit: 'kg' },
  'Huevos deshidratados': { value: 850, unit: 'kg' },
  'Quinua orgánica': { value: 500, unit: 'kg' },
}

function newRow() {
  return { id: Math.random().toString(36).slice(2), insumo: '', cantidad: '' }
}

export default function NuevoRequerimientoPage() {
  const { addToast } = useApp()
  const navigate = useNavigate()
  const [numero, setNumero] = useState('')
  const [fecha, setFecha] = useState('')
  const [rows, setRows] = useState([
    { id: 'r1', insumo: 'Sémola de trigo', cantidad: '500' },
    { id: 'r2', insumo: 'Harina de trigo', cantidad: '300' },
  ])
  const [submitted, setSubmitted] = useState(false)

  const duplicateNumero = numero.trim() === 'REQ-047'
  const noItems = rows.length === 0
  const numeroError = submitted
    ? duplicateNumero
      ? 'Ya existe un requerimiento registrado con ese número. Verifique el documento físico.'
      : !numero.trim()
      ? 'Este campo es obligatorio.'
      : undefined
    : undefined

  function updateRow(id, patch) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    const hasQtyError = rows.some((r) => !r.cantidad || Number(r.cantidad) <= 0)
    if (!numero.trim() || duplicateNumero || noItems || hasQtyError) return
    addToast('Requerimiento registrado correctamente.')
    navigate('/requerimientos')
  }

  return (
    <AppShell title="Nuevo Requerimiento de Producción" allowedRoles={['supervisor']}>
      <p className="mb-4 text-xs text-muted-foreground">Requerimientos → Nuevo Requerimiento</p>

      <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-5 text-base font-bold text-foreground">Datos generales</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="N° de requerimiento" error={numeroError}>
            <TextInput
              value={numero}
              invalid={!!numeroError}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej: REQ-048, según documento físico"
            />
          </Field>
          <Field label="Fecha del pedido">
            <TextInput value={fecha} onChange={(e) => setFecha(e.target.value)} placeholder="DD/MM/YYYY" />
          </Field>
        </div>

        <h2 className="mb-3 mt-7 text-base font-bold text-foreground">Insumos solicitados</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground">
                <th className="px-3 py-2.5">Insumo</th>
                <th className="px-3 py-2.5">Cantidad solicitada</th>
                <th className="px-3 py-2.5">Stock actual disponible</th>
                <th className="px-3 py-2.5 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const stock = STOCK[row.insumo]
                const qtyError = submitted && (!row.cantidad || Number(row.cantidad) <= 0)
                const noStock = stock && stock.value === 0
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-3 py-2.5">
                      <SelectInput
                        value={row.insumo}
                        onChange={(e) => updateRow(row.id, { insumo: e.target.value })}
                      >
                        <option value="">Seleccione...</option>
                        {INSUMOS.map((i) => (
                          <option key={i.nombre} value={i.nombre}>{i.nombre}</option>
                        ))}
                      </SelectInput>
                    </td>
                    <td className="px-3 py-2.5">
                      <TextInput
                        type="number"
                        value={row.cantidad}
                        invalid={qtyError}
                        onChange={(e) => updateRow(row.id, { cantidad: e.target.value })}
                      />
                      {qtyError && (
                        <p className="mt-1 text-xs text-critical">La cantidad debe ser mayor a cero.</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {stock ? (
                        <span className={noStock ? 'inline-flex items-center gap-1 text-critical' : 'text-muted-foreground'}>
                          {qty(stock.value, stock.unit)}
                          {noStock && (
                            <span title="Sin stock disponible actualmente" className="inline-flex">
                              <AlertTriangle className="size-3.5 text-warning" />
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        aria-label="Eliminar insumo"
                        onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                        className="rounded-md p-1.5 text-critical transition-colors hover:bg-critical/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow()])}
            className="flex w-full items-center justify-center gap-2 border-t-2 border-dashed border-border py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent/40"
          >
            <Plus className="size-4" />
            Agregar insumo
          </button>
        </div>

        {submitted && noItems && (
          <p className="mt-2 text-xs text-critical">Debe agregar al menos un insumo al requerimiento.</p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <ActionButton variant="ghost" type="button" onClick={() => navigate('/requerimientos')}>
            Cancelar
          </ActionButton>
          <ActionButton type="submit">Registrar Requerimiento</ActionButton>
        </div>
      </form>
    </AppShell>
  )
}
