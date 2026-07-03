import { useMemo, useState } from "react";
import { Search, Box, ChevronDown } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { SelectInput } from "../components/ui/form-field.jsx";
import { qty, daysUntil } from "../lib/utils.js";

const PASILLOS = ["A", "B", "C", "D"];
const RACKS = [1, 2, 3, 4, 5, 6];
const NIVELES = [1, 2, 3, 4, 5];

const TODAY = new Date(2026, 5, 6);

function parseUbicacion(u) {
  const m = u?.match(/Pasillo (\w+)\s*–\s*Rack (\d+)\s*–\s*Nivel (\d+)/);
  if (!m) return null;
  return { pasillo: m[1], rack: m[2], nivel: m[3] };
}

function groupByInsumo(lots) {
  const grouped = new Map();
  lots.forEach((lot) => {
    const key = lot.insumoId || lot.insumo;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(lot);
  });
  return Array.from(grouped.entries()).sort(([a], [b]) => String(a).localeCompare(String(b)));
}

export default function InventarioPage() {
  const { inventory, insumos } = useApp();
  const [query, setQuery] = useState("");
  const [filtroPasillo, setFiltroPasillo] = useState("");
  const [filtroRack, setFiltroRack] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [estado, setEstado] = useState("");
  const [applied, setApplied] = useState({
    query: "", pasillo: "", rack: "", nivel: "", estado: "",
  });
  const [selectedInsumo, setSelectedInsumo] = useState(null);

  const data = inventory;

  const insumosData = useMemo(() => {
    const grouped = groupByInsumo(data);
    return grouped.map(([key, lots]) => {
      const ins = insumos.find((i) => i.id === key || i.nombre === key);
      const insumo = ins?.nombre || key;
      const totalQty = lots.reduce((sum, l) => sum + l.cantidad, 0);
      const reorderPoint = ins?.puntoReorden || 0;
      const unidad = lots[0]?.unidad || "kg";
      let statusColor = "green";
      let statusText = "Normal";
      if (totalQty === 0) { statusColor = "red"; statusText = "Agotado"; }
      else if (totalQty <= reorderPoint) { statusColor = "amber"; statusText = "Stock bajo"; }
      return { insumo, lots, totalQty, unidad, reorderPoint, statusColor, statusText };
    });
  }, [data, insumos]);

  const filtered = useMemo(() => {
    return insumosData.filter((item) => {
      const q = applied.query.toLowerCase();
      const matchQuery = !q || item.insumo.toLowerCase().includes(q);
      const matchEstado = !applied.estado || (applied.estado === "disponible" && item.statusText === "Normal") || (applied.estado === "bajo" && item.statusText === "Stock bajo") || (applied.estado === "agotado" && item.statusText === "Agotado");
      const matchUbic = (!applied.pasillo || item.lots.some((l) => parseUbicacion(l.ubicacion)?.pasillo === applied.pasillo)) && (!applied.rack || item.lots.some((l) => parseUbicacion(l.ubicacion)?.rack === applied.rack)) && (!applied.nivel || item.lots.some((l) => parseUbicacion(l.ubicacion)?.nivel === applied.nivel));
      return matchQuery && matchEstado && matchUbic;
    });
  }, [insumosData, applied]);

  function clearFilters() {
    setQuery(""); setFiltroPasillo(""); setFiltroRack(""); setFiltroNivel(""); setEstado("");
    setApplied({ query: "", pasillo: "", rack: "", nivel: "", estado: "" });
  }

  const hasActiveFilters = applied.query || applied.pasillo || applied.rack || applied.nivel || applied.estado;

  function applyFilters() {
    setApplied({ query, pasillo: filtroPasillo, rack: filtroRack, nivel: filtroNivel, estado });
  }

  return (
    <AppShell title="Consulta de Inventario">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <SelectInput value={query} onChange={(e) => setQuery(e.target.value)} className="w-48">
          <option value="">Filtrar por insumo</option>
          {insumos.map((i) => (<option key={i.id} value={i.nombre}>{i.nombre}</option>))}
        </SelectInput>
        <SelectInput value={filtroPasillo} onChange={(e) => setFiltroPasillo(e.target.value)} className="w-28">
          <option value="">Pasillo</option>
          {PASILLOS.map((p) => (<option key={p} value={p}>Pasillo {p}</option>))}
        </SelectInput>
        <SelectInput value={filtroRack} onChange={(e) => setFiltroRack(e.target.value)} className="w-24">
          <option value="">Rack</option>
          {RACKS.map((r) => (<option key={r} value={String(r)}>Rack {r}</option>))}
        </SelectInput>
        <SelectInput value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="w-24">
          <option value="">Nivel</option>
          {NIVELES.map((n) => (<option key={n} value={String(n)}>Nivel {n}</option>))}
        </SelectInput>
        <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)} className="w-36">
          <option value="">Estado: Todos</option>
          <option value="disponible">Normal</option>
          <option value="bajo">Stock bajo</option>
          <option value="agotado">Agotado</option>
        </SelectInput>
        <ActionButton variant="ghost" size="sm" onClick={applyFilters}>Buscar</ActionButton>
        <button type="button" onClick={clearFilters} className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Limpiar</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
              <th className="px-3 py-2">Insumo</th>
              <th className="px-3 py-2">Cantidad total disponible</th>
              <th className="px-3 py-2">Punto de reorden</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Lotes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((item) => (
              <tr key={item.insumo} className="group hover:bg-[var(--surface-raised)]">
                <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">{item.insumo}</td>
                <td className="px-3 py-2.5 text-[var(--text-primary)]">{qty(item.totalQty, item.unidad)}</td>
                <td className="px-3 py-2.5 text-[var(--text-primary)]">{qty(item.reorderPoint, item.unidad)}</td>
                <td className="px-3 py-2.5"><Badge color={item.statusColor}>{item.statusText}</Badge></td>
                <td className="px-3 py-2.5 text-right">
                  <button onClick={() => setSelectedInsumo(item.insumo)} className="font-medium text-[var(--accent)] hover:underline text-[13px]">
                    Ver lotes ({item.lots.length})
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-[13px] text-[var(--text-tertiary)]">
              No se encontraron resultados para los filtros aplicados.
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-2 text-[13px] font-medium text-[var(--accent)] hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <LotesDrawer insumo={selectedInsumo} lots={data.filter((l) => (l.insumoId || l.insumo) === selectedInsumo || l.insumo === selectedInsumo)} onClose={() => setSelectedInsumo(null)} />
    </AppShell>
  );
}

function vencColor(d) {
  const days = daysUntil(d, TODAY);
  if (days <= 7) return "text-[var(--danger)]";
  if (days <= 30) return "text-[var(--warning)]";
  return "text-[var(--text-primary)]";
}

function LotesDrawer({ insumo, lots, onClose }) {
  if (!insumo) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col overflow-hidden border-l border-[var(--border-default)] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Lotes de {insumo}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]">
            <ChevronDown className="size-4 rotate-180" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {lots.length === 0 ? (
            <p className="text-[13px] text-[var(--text-tertiary)]">No hay lotes registrados para este insumo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium text-[var(--text-tertiary)]">
                    <th className="px-2 py-1.5">Código de lote</th>
                    <th className="px-2 py-1.5">Cantidad actual</th>
                    <th className="px-2 py-1.5">Fecha de vencimiento</th>
                    <th className="px-2 py-1.5">Ubicación</th>
                    <th className="px-2 py-1.5">Fecha de ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {lots.map((lot) => (
                    <tr key={lot.codigoLote} className="hover:bg-[var(--surface-raised)]">
                      <td className="px-2 py-1.5 font-medium text-[var(--text-primary)]">{lot.codigoLote}</td>
                      <td className="px-2 py-1.5 text-[var(--text-primary)]">{qty(lot.cantidad, lot.unidad)}</td>
                      <td className={`px-2 py-1.5 ${vencColor(lot.vencimiento)}`}>{lot.vencimiento}</td>
                      <td className="px-2 py-1.5 text-[var(--text-primary)]">{lot.ubicacion}</td>
                      <td className="px-2 py-1.5 text-[var(--text-secondary)]">{lot.fechaIngreso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
