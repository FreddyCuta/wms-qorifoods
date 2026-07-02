import { useMemo, useState } from 'react'
import { Search, Box, ChevronDown } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Badge } from '../components/ui/status-badge.jsx'
import { SelectInput } from '../components/ui/form-field.jsx'
import { qty, daysUntil } from '../lib/utils.js'

const PASILLOS = ['A', 'B', 'C', 'D']
const RACKS = [1, 2, 3, 4, 5, 6]
const NIVELES = [1, 2, 3, 4, 5]

const TODAY = new Date(2026, 5, 6)

function parseUbicacion(u) {
  const m = u?.match(/Pasillo (\w+)\s*–\s*Rack (\d+)\s*–\s*Nivel (\d+)/)
  if (!m) return null
  return { pasillo: m[1], rack: m[2], nivel: m[3] }
}

function vencColor(d) {
  const days = daysUntil(d, TODAY)
  if (days <= 7) return 'text-critical'
  if (days <= 30) return 'text-warning'
  return 'text-foreground'
}

function groupByInsumo(lots) {
  const grouped = new Map()
  lots.forEach((lot) => {
    const key = lot.insumoId || lot.insumo
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(lot)
  })
  return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export default function InventarioPage() {
  const { inventory, insumos } = useApp()
  const [query, setQuery] = useState('')
  const [filtroPasillo, setFiltroPasillo] = useState('')
  const [filtroRack, setFiltroRack] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [estado, setEstado] = useState('')
  const [applied, setApplied] = useState({ query: '', pasillo: '', rack: '', nivel: '', estado: '' })
  const [selectedInsumo, setSelectedInsumo] = useState(null)
  const [emptyDb, setEmptyDb] = useState(false)

  const data = emptyDb ? [] : inventory

  const insumosData = useMemo(() => {
    const grouped = groupByInsumo(data)
    return grouped.map(([key, lots]) => {
      const ins = insumos.find((i) => i.id === key || i.nombre === key)
      const insumo = ins?.nombre || key
      const totalQty = lots.reduce((sum, l) => sum + l.cantidad, 0)
      const reorderPoint = ins?.puntoReorden || 0
      const unidad = lots[0]?.unidad || 'kg'

      let statusColor = 'green'
      let statusText = 'Normal'
      if (totalQty === 0) { statusColor = 'red'; statusText = 'Agotado' }
      else if (totalQty <= reorderPoint) { statusColor = 'amber'; statusText = 'Stock bajo' }

      return { insumo, lots, totalQty, unidad, reorderPoint, statusColor, statusText }
    })
  }, [data, insumos])

  const filtered = useMemo(() => {
    return insumosData.filter((item) => {
      const q = applied.query.toLowerCase()
      const matchQuery = !q || item.insumo.toLowerCase().includes(q)
      const matchEstado =
        !applied.estado ||
        (applied.estado === 'disponible' && item.statusText === 'Normal') ||
        (applied.estado === 'bajo' && item.statusText === 'Stock bajo') ||
        (applied.estado === 'agotado' && item.statusText === 'Agotado')
      const matchUbic =
        (!applied.pasillo || item.lots.some((l) => parseUbicacion(l.ubicacion)?.pasillo === applied.pasillo)) &&
        (!applied.rack || item.lots.some((l) => parseUbicacion(l.ubicacion)?.rack === applied.rack)) &&
        (!applied.nivel || item.lots.some((l) => parseUbicacion(l.ubicacion)?.nivel === applied.nivel))
      return matchQuery && matchEstado && matchUbic
    })
  }, [insumosData, applied])

  function clearFilters() {
    setQuery(''); setFiltroPasillo(''); setFiltroRack(''); setFiltroNivel(''); setEstado('')
    setApplied({ query: '', pasillo: '', rack: '', nivel: '', estado: '' })
  }

  const hasActiveFilters = applied.query || applied.pasillo || applied.rack || applied.nivel || applied.estado

  return (
    <AppShell title="Consulta de Inventario">
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <SelectInput value={query} onChange={(e) => setQuery(e.target.value)} className="w-56">
          <option value="">Filtrar por insumo</option>
          {insumos.map((i) => (
            <option key={i.id} value={i.nombre}>{i.nombre}</option>
          ))}
        </SelectInput>
        <SelectInput value={filtroPasillo} onChange={(e) => setFiltroPasillo(e.target.value)} className="w-32">
          <option value="">Pasillo</option>
          {PASILLOS.map((p) => <option key={p} value={p}>Pasillo {p}</option>)}
        </SelectInput>
        <SelectInput value={filtroRack} onChange={(e) => setFiltroRack(e.target.value)} className="w-28">
          <option value="">Rack</option>
          {RACKS.map((r) => <option key={r} value={String(r)}>Rack {r}</option>)}
        </SelectInput>
        <SelectInput value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="w-28">
          <option value="">Nivel</option>
          {NIVELES.map((n) => <option key={n} value={String(n)}>Nivel {n}</option>)}
        </SelectInput>
        <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)} className="w-44">
          <option value="">Estado del stock: Todos</option>
          <option value="disponible">Normal</option>
          <option value="bajo">Stock bajo</option>
          <option value="agotado">Agotado</option>
        </SelectInput>
        <ActionButton onClick={() => setApplied({ query, pasillo: filtroPasillo, rack: filtroRack, nivel: filtroNivel, estado })}>Buscar</ActionButton>
        <button type="button" onClick={clearFilters} className="px-2 text-sm text-muted-foreground hover:text-foreground">
          Limpiar filtros
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setEmptyDb((v) => !v)}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {emptyDb ? 'Cargar datos de ejemplo' : 'Ver estado vacío (demo)'}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Insumo</th>
              <th className="px-4 py-3">Cantidad total disponible</th>
              <th className="px-4 py-3">Punto de reorden</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Lotes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => (
              <tr key={item.insumo} className="transition-colors hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{item.insumo}</td>
                <td className="px-4 py-3 text-foreground">{qty(item.totalQty, item.unidad)}</td>
                <td className="px-4 py-3 text-foreground">{qty(item.reorderPoint, item.unidad)}</td>
                <td className="px-4 py-3"><Badge color={item.statusColor}>{item.statusText}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedInsumo(item.insumo)}
                    className="font-medium text-primary hover:underline"
                  >
                    Ver lotes ({item.lots.length})
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            {emptyDb ? (
              <>
                <Box className="size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No hay insumos registrados en el inventario actualmente.</p>
              </>
            ) : (
              <>
                <Search className="size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No se encontraron resultados para los filtros aplicados.</p>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
                    Limpiar filtros
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <LotesDrawer
        insumo={selectedInsumo}
        lots={data.filter((l) => (l.insumoId || l.insumo) === selectedInsumo || l.insumo === selectedInsumo)}
        onClose={() => setSelectedInsumo(null)}
      />
    </AppShell>
  )
}

function LotesDrawer({ insumo, lots, onClose }) {
  if (!insumo) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col overflow-hidden rounded-l-lg border-l border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Lotes de {insumo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="relative z-10 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className="size-5 rotate-180" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay lotes registrados para este insumo.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted text-left font-medium text-muted-foreground">
                    <th className="px-3 py-2">Código de lote</th>
                    <th className="px-3 py-2">Cantidad actual</th>
                    <th className="px-3 py-2">Fecha de vencimiento</th>
                    <th className="px-3 py-2">Ubicación</th>
                    <th className="px-3 py-2">Fecha de ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lots.map((lot) => (
                    <tr key={lot.codigoLote} className="hover:bg-accent/40">
                      <td className="px-3 py-2 font-medium text-foreground">{lot.codigoLote}</td>
                      <td className="px-3 py-2 text-foreground">{qty(lot.cantidad, lot.unidad)}</td>
                      <td className={`px-3 py-2 ${vencColor(lot.vencimiento)}`}>{lot.vencimiento}</td>
                      <td className="px-3 py-2 text-foreground">{lot.ubicacion}</td>
                      <td className="px-3 py-2 text-muted-foreground">{lot.fechaIngreso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
