import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Field, SelectInput, TextInput } from "../components/ui/form-field.jsx";
import { qty } from "../lib/utils.js";

function newRow() {
  return { id: Math.random().toString(36).slice(2), insumo: "", cantidad: "" };
}

function calcStock(inventory) {
  const map = {};
  inventory.forEach((lot) => {
    map[lot.insumo] = (map[lot.insumo] || 0) + lot.cantidad;
  });
  return map;
}

export default function NuevoRequerimientoPage() {
  const { addToast, addRequirement, currentUser, insumos, inventory } =
    useApp();
  const navigate = useNavigate();
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [rows, setRows] = useState([
    { id: "r1", insumo: "Sémola de trigo", cantidad: "500" },
    { id: "r2", insumo: "Harina de trigo", cantidad: "300" },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const stockPorInsumo = calcStock(inventory);
  const insumoUnitMap = {};
  insumos.forEach((i) => {
    insumoUnitMap[i.nombre] = i.unidad;
  });

  const duplicateNumero = numero.trim() === "REQ-047";
  const noItems = rows.length === 0;
  const numeroError = submitted
    ? duplicateNumero
      ? "Ya existe un requerimiento registrado con ese número. Verifique el documento físico."
      : !numero.trim()
        ? "Este campo es obligatorio."
        : undefined
    : undefined;

  function updateRow(id, patch) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const hasQtyError = rows.some(
      (r) => !r.cantidad || Number(r.cantidad) <= 0,
    );
    if (!numero.trim() || duplicateNumero || noItems || hasQtyError) return;

    addRequirement({
      id: Math.random().toString(36).slice(2),
      numero: numero.trim(),
      fechaSolicitud: fecha || new Date().toLocaleDateString("es-PE"),
      fechaRegistro: new Date().toLocaleString("es-PE"),
      registradoPor: currentUser?.name || "Supervisor",
      estado: "pendiente",
      atenciones: [],
      insumos: rows.map((r) => ({
        insumo: r.insumo,
        cantidad: Number(r.cantidad),
        unidad: insumoUnitMap[r.insumo] || "kg",
        stock: stockPorInsumo[r.insumo] || 0,
        atendido: 0,
      })),
    });
    addToast("Requerimiento registrado correctamente.");
    navigate("/requerimientos");
  }

  return (
    <AppShell
      title="Nuevo Requerimiento de Producción"
      allowedRoles={["supervisor"]}
    >
      <p className="mb-4 text-xs text-muted-foreground">
        Requerimientos → Nuevo Requerimiento
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-lg border border-border bg-card p-6"
      >
        <h2 className="mb-5 text-base font-bold text-foreground">
          Datos generales
        </h2>
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
            <TextInput
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              placeholder="DD/MM/YYYY"
            />
          </Field>
        </div>

        <h2 className="mb-3 mt-7 text-base font-bold text-foreground">
          Insumos solicitados
        </h2>
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
                const stockVal = stockPorInsumo[row.insumo] ?? null;
                const qtyError =
                  submitted && (!row.cantidad || Number(row.cantidad) <= 0);
                const noStock = stockVal !== null && stockVal === 0;
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-3 py-2.5">
                      <SelectInput
                        value={row.insumo}
                        onChange={(e) =>
                          updateRow(row.id, { insumo: e.target.value })
                        }
                      >
                        <option value="">Seleccione...</option>
                        {insumos.map((i) => (
                          <option key={i.nombre} value={i.nombre}>
                            {i.nombre}
                          </option>
                        ))}
                      </SelectInput>
                    </td>
                    <td className="px-3 py-2.5">
                      <TextInput
                        type="number"
                        value={row.cantidad}
                        invalid={qtyError}
                        onChange={(e) =>
                          updateRow(row.id, { cantidad: e.target.value })
                        }
                      />
                      {qtyError && (
                        <p className="mt-1 text-xs text-critical">
                          La cantidad debe ser mayor a cero.
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {stockVal !== null ? (
                        <span
                          className={
                            noStock
                              ? "inline-flex items-center gap-1 text-critical"
                              : "text-muted-foreground"
                          }
                        >
                          {qty(stockVal, insumoUnitMap[row.insumo] || "kg")}
                          {noStock && (
                            <span
                              title="Sin stock disponible actualmente"
                              className="inline-flex"
                            >
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
                        onClick={() =>
                          setRows((rs) => rs.filter((r) => r.id !== row.id))
                        }
                        className="rounded-md p-1.5 text-critical transition-colors hover:bg-critical/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
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
          <p className="mt-2 text-xs text-critical">
            Debe agregar al menos un insumo al requerimiento.
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <ActionButton
            variant="ghost"
            type="button"
            onClick={() => navigate("/requerimientos")}
          >
            Cancelar
          </ActionButton>
          <ActionButton type="submit">Registrar Requerimiento</ActionButton>
        </div>
      </form>
    </AppShell>
  );
}
