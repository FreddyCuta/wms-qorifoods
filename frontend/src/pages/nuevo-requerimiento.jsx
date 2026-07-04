import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Field, SelectInput, TextInput } from "../components/ui/form-field.jsx";
import { qty } from "../lib/utils.js";

function newRow() {
  return { id: Math.random().toString(36).slice(2), insumo: "", insumoId: "", cantidad: "" };
}

function calcStock(inventory) {
  const map = {};
  inventory.forEach((lot) => { const key = lot.insumoId || lot.insumo; map[key] = (map[key] || 0) + lot.cantidad; });
  return map;
}

export default function NuevoRequerimientoPage() {
  const { addToast, addRequirement, currentUser, insumos, inventory, requirements } = useApp();
  const navigate = useNavigate();

  const reqNumero = useMemo(() => {
    const maxNum = requirements.reduce((max, r) => {
      const match = r.numero.match(/REQ-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `REQ-${String(maxNum + 1).padStart(3, "0")}`;
  }, [requirements]);

  const today = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(today);
  const rowDefaults = (ins) => ins.length >= 2
    ? [{ id: "r1", insumo: ins[0].nombre, insumoId: ins[0].id, cantidad: "" }, { id: "r2", insumo: ins[1].nombre, insumoId: ins[1].id, cantidad: "" }]
    : [];

  const [rows, setRows] = useState(() => rowDefaults(insumos));
  const [submitted, setSubmitted] = useState(false);

  const stockPorInsumo = calcStock(inventory);
  const insumoUnitMap = {};
  const insumoNameMap = {};
  insumos.forEach((i) => { insumoUnitMap[i.id] = i.unidad; insumoNameMap[i.id] = i.nombre; });

  const noItems = rows.length === 0;

  function updateRow(id, patch) { setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))); }

  function getStockError(row) {
    const key = row.insumoId || row.insumo;
    const stockVal = key ? (stockPorInsumo[key] ?? null) : null;
    return submitted && stockVal !== null && Number(row.cantidad) > stockVal
      ? `Stock insuficiente. Disponible: ${qty(stockVal, insumoUnitMap[row.insumoId] || "kg")}`
      : null;
  }

  const hasAnyError = submitted && (
    noItems || rows.some((r) => !r.cantidad || Number(r.cantidad) <= 0 || getStockError(r))
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (noItems || rows.some((r) => !r.cantidad || Number(r.cantidad) <= 0 || getStockError(r))) return;

    try {
      await addRequirement({
        numero: reqNumero, fechaSolicitud: fecha, registrado_por_id: currentUser.id,
        insumos: rows.map((r) => ({ insumo: r.insumo, insumoId: r.insumoId, cantidad: Number(r.cantidad), unidad: insumoUnitMap[r.insumoId] || "kg", stock: stockPorInsumo[r.insumoId || r.insumo] || 0 })),
      });
      addToast(`Requerimiento ${reqNumero} registrado correctamente.`);
      navigate("/requerimientos");
    } catch { addToast("Error al registrar el requerimiento", "error"); }
  }

  return (
    <AppShell title="Nuevo Requerimiento de Producción" allowedRoles={["supervisor"]}>
      <form onSubmit={handleSubmit} noValidate className="max-w-[480px]">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">Datos generales</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="N° de requerimiento">
              <TextInput value={reqNumero} readOnly disabled />
            </Field>
            <Field label="Fecha del pedido">
              <TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </Field>
          </div>

          <h3 className="text-[14px] font-semibold text-[var(--text-primary)] mt-1">Insumos solicitados</h3>
          <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-sm">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[var(--surface-overlay)] text-left text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                  <th className="px-2 py-1.5">Insumo</th>
                  <th className="px-2 py-1.5">Cantidad solicitada</th>
                  <th className="px-2 py-1.5">Stock actual disponible</th>
                  <th className="px-2 py-1.5 text-center">Eliminar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {rows.map((row) => {
                  const key = row.insumoId || row.insumo;
                  const stockVal = key ? (stockPorInsumo[key] ?? null) : null;
                  const qtyError = submitted && (!row.cantidad || Number(row.cantidad) <= 0);
                  const stockError = getStockError(row);
                  const noStock = stockVal !== null && stockVal === 0;
                  return (
                    <tr key={row.id} className="align-top">
                      <td className="px-2 py-1.5">
                        <SelectInput value={row.insumoId} onChange={(e) => { const id = e.target.value; updateRow(row.id, { insumo: insumoNameMap[id] || "", insumoId: id }); }}>
                          <option value="">Seleccione...</option>
                          {insumos.map((i) => (<option key={i.id} value={i.id}>{i.nombre}</option>))}
                        </SelectInput>
                      </td>
                      <td className="px-2 py-1.5">
                        <TextInput type="number" value={row.cantidad} invalid={!!(qtyError || stockError)} onChange={(e) => updateRow(row.id, { cantidad: e.target.value })} />
                        {qtyError && <p className="text-[11px] text-[var(--danger)]" style={{ marginTop: '3px' }}>La cantidad debe ser mayor a cero.</p>}
                        {stockError && <p className="text-[11px] text-[var(--danger)]" style={{ marginTop: '3px' }}>{stockError}</p>}
                      </td>
                      <td className="px-2 py-1.5">
                        {stockVal !== null ? (
                          <span className={noStock ? "inline-flex items-center gap-1 text-[var(--danger)]" : "text-[var(--text-secondary)]"}>
                            {qty(stockVal, insumoUnitMap[row.insumoId] || "kg")}
                            {noStock && <AlertTriangle className="size-3 text-[var(--warning)]" />}
                          </span>
                        ) : (
                          <span className="text-[var(--text-tertiary)]">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button type="button" aria-label="Eliminar insumo" onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))} className="rounded p-1 text-[var(--danger)] transition-colors hover:bg-[var(--danger-subtle)]">
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button type="button" onClick={() => setRows((rs) => [...rs, newRow()])} className="flex w-full items-center justify-center gap-2 border-t border-dashed border-[var(--border-subtle)] py-2 text-[13px] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]">
              <Plus className="size-3.5" /> Agregar insumo
            </button>
          </div>

          {submitted && noItems && <p className="text-[11px] text-[var(--danger)]">Debe agregar al menos un insumo al requerimiento.</p>}

          <div className="flex items-center justify-end gap-2 mt-1">
            <ActionButton variant="ghost" size="sm" type="button" onClick={() => navigate("/requerimientos")}>Cancelar</ActionButton>
            <ActionButton type="submit">Registrar Requerimiento</ActionButton>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
