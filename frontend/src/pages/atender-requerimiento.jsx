import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Badge } from "../components/ui/status-badge.jsx";
import { Modal, ModalFooter } from "../components/ui/modal.jsx";
import { Field, TextInput } from "../components/ui/form-field.jsx";
import { qty } from "../lib/utils.js";

function sugerirLoteFefo(inventory, insumoKey) {
  const lots = inventory.filter((l) => (l.insumoId || l.insumo) === insumoKey && l.cantidad > 0)
    .sort((a, b) => {
      const parseDate = (v) => {
        if (!v) return new Date(0);
        const parts = v.includes("/") ? v.split("/") : v.split("-");
        return new Date(...(v.includes("/") ? [parts[2], parts[1] - 1, parts[0]] : v.includes("-") ? [parts[0], parts[1] - 1, parts[2]] : [0]));
      };
      return parseDate(a.vencimiento) - parseDate(b.vencimiento);
    });
  if (lots.length === 0) return null;
  const l = lots[0];
  return { lote: l.codigoLote, vence: l.vencimiento, ubicacion: l.ubicacion };
}

export default function AtenderRequerimientoPage() {
  const { id } = useParams();
  const { requirements, inventory, currentUser, attendRequirement, addToast } = useApp();
  const navigate = useNavigate();
  const [salidaQtys, setSalidaQtys] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const req = requirements.find((r) => r.id === Number(id));

  if (!req) {
    return (
      <AppShell title="Atender Requerimiento" allowedRoles={["operario"]}>
        <p className="text-[13px] text-[var(--text-tertiary)]">Requerimiento no encontrado.</p>
      </AppShell>
    );
  }

  const stockDisponible = {};
  inventory.forEach((lot) => { if (lot.cantidad > 0) { const key = lot.insumoId || lot.insumo; stockDisponible[key] = (stockDisponible[key] || 0) + lot.cantidad; } });

  const salidas = req.insumos.map((item) => {
    const key = item.insumoId || item.insumo;
    const yaAtendido = item.atendido || 0;
    const pendiente = Math.max(0, item.cantidad - yaAtendido);
    const cantidad = Number(salidaQtys[key] || 0);
    const esCompleto = yaAtendido + cantidad >= item.cantidad;
    const esInsuficiente = cantidad > 0 && yaAtendido + cantidad < item.cantidad;
    const completadoPrevio = yaAtendido >= item.cantidad;
    return { ...item, key, pendiente, salidaQty: cantidad, yaAtendido, esCompleto, esInsuficiente, completadoPrevio };
  });

  const todasComplete = salidas.every((s) => s.yaAtendido + s.salidaQty >= s.cantidad);
  const algunaFaltante = salidas.some((s) => s.salidaQty > 0 && s.yaAtendido + s.salidaQty < s.cantidad);
  const hayAlgoParaAtender = salidas.some((s) => s.salidaQty > 0);

  function handleSalidaChange(key, valor) {
    const q = Math.max(0, Number(valor) || 0);
    const item = req.insumos.find((i) => (i.insumoId || i.insumo) === key);
    const yaAtendido = item?.atendido || 0;
    const pendiente = Math.max(0, (item?.cantidad || 0) - yaAtendido);
    const maxStock = stockDisponible[key] || 0;
    const maximo = Math.min(pendiente, maxStock);
    setSalidaQtys({ ...salidaQtys, [key]: Math.min(q, maximo) });
  }

  function handleComplete() { if (salidas.some((s) => s.salidaQty > 0)) setConfirmOpen(true); }

  function confirmSalida() {
    const salidaMap = {};
    salidas.forEach((s) => { if (s.salidaQty > 0) salidaMap[s.key] = s.salidaQty; });
    attendRequirement(req.id, salidaMap, currentUser);
    setConfirmOpen(false);
    const completoAhora = Object.entries(salidaMap).every(([key, qty]) => { const item = req.insumos.find((i) => (i.insumoId || i.insumo) === key); return item && (item.atendido || 0) + qty >= item.cantidad; });
    const status = completoAhora ? "completado" : "parcialmente atendido";
    addToast(`Requerimiento ${req.numero} ${status}. Salidas de insumos registradas.`);
    navigate("/requerimientos");
  }

  return (
    <AppShell title="Atender Requerimiento" allowedRoles={["operario"]}>
      <button type="button" onClick={() => navigate("/requerimientos")} className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline">
        <ArrowLeft className="size-3" /> Requerimientos
      </button>

      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Registrar salidas para {req.numero}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--text-secondary)]">
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
        <div className="mb-3 rounded-sm border border-[var(--accent-subtle)] bg-[var(--accent-subtle)] px-3 py-2 text-[13px] text-[var(--accent-text)]">
          <p className="font-medium">Atenciones previas:</p>
          {req.atenciones.map((a, i) => (
            <p key={i} className="mt-1 text-[11px] text-[var(--text-secondary)]">
              {a.fecha} por {a.por}: {Object.entries(a.insumos || a.detalle || {}).map(([ins, q]) => `${q} ${ins}`).join(", ")}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        {salidas.map((item) => {
          const fefo = sugerirLoteFefo(inventory, item.key) || { lote: "N/A", vence: "N/A", ubicacion: "N/A" };
          const hayStock = stockDisponible[item.key] > 0;
          return (
            <div key={item.key} className={`rounded-sm border ${item.completadoPrevio ? "border-[var(--success)]/40 bg-[var(--success-subtle)]" : "border-[var(--border-subtle)] bg-[var(--surface-raised)]"} p-3 grid grid-cols-[1fr_220px_100px] gap-4 ${item.completadoPrevio ? 'items-center' : 'items-start'}`}>
              <div>
                <h3 className="font-medium text-[var(--text-primary)] text-[13px]">{item.insumo}</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Lote sugerido (FEFO): {fefo.lote} | Vence: {fefo.vence} | {fefo.ubicacion}</p>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Stock disponible: <span className="font-medium text-[var(--text-primary)]">{qty(stockDisponible[item.key] || 0, item.unidad)}</span>
                </div>
                {item.yaAtendido > 0 && (
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                    <CheckCircle2 className="size-3 text-[var(--success)]" />
                    Ya atendido: <span className="font-medium text-[var(--text-primary)]">{qty(item.yaAtendido, item.unidad)}</span>
                    {item.pendiente > 0 && <span>· Pendiente: <span className="font-medium text-[var(--warning)]">{qty(item.pendiente, item.unidad)}</span></span>}
                  </div>
                )}
              </div>

              {item.completadoPrevio ? (
                <div className="col-span-2 flex items-center gap-2 rounded-sm bg-[var(--success-subtle)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--success)]">
                  <CheckCircle2 className="size-3.5" /> Completado — este insumo ya fue despachado en su totalidad
                </div>
              ) : (
                <>
                  <div>
                    {!hayStock && (
                      <div className="mb-2 flex items-center gap-2 rounded-sm bg-[var(--danger-subtle)] px-2.5 py-1.5 text-[11px] text-[var(--danger)]">
                        <AlertTriangle className="size-3" /> Sin stock disponible
                      </div>
                    )}
                    <Field label={`Cantidad (máx: ${qty(item.pendiente, item.unidad)})`}>
                      <div className="relative">
                        <TextInput type="number" min="0" max={item.pendiente} value={salidaQtys[item.key] || ""} onChange={(e) => handleSalidaChange(item.key, e.target.value)} placeholder="0" className="pr-8" />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-tertiary)]">{item.unidad}</span>
                      </div>
                    </Field>
                  </div>
                  <div className="pt-6 text-right">
                    <Badge color={item.salidaQty === 0 ? "gray" : item.esCompleto ? "green" : "amber"}>
                      {item.salidaQty === 0 ? "Pendiente" : item.esCompleto ? "Completo" : "Parcial"}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {algunaFaltante && (
        <div className="mt-3 flex items-start gap-2 rounded-sm border border-[var(--warning-subtle)] bg-[var(--warning-subtle)] px-3 py-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
          <div className="text-[13px] text-[var(--warning)]">
            <p className="font-medium">Stock insuficiente para completar todo</p>
            <p className="text-[11px] mt-1">Se despachará lo disponible. El requerimiento quedará como parcial hasta que llegue más stock.</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <ActionButton variant="ghost" size="sm" onClick={() => navigate("/requerimientos")}>Cancelar</ActionButton>
        <ActionButton onClick={handleComplete} disabled={!hayAlgoParaAtender}>Registrar salidas</ActionButton>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar registro de salidas"
        footer={
          <>
            <ActionButton variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>Cancelar</ActionButton>
            <ActionButton onClick={confirmSalida}>Confirmar salidas</ActionButton>
          </>
        }
      >
        <div className="space-y-4">
          {todasComplete ? (
            <p className="text-[13px] text-[var(--text-primary)]">Todas las cantidades solicitadas serán despachadas. El requerimiento se marcará como completado.</p>
          ) : (
            <div className="flex items-start gap-2 rounded-sm border border-[var(--warning-subtle)] bg-[var(--warning-subtle)] px-3 py-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
              <p className="text-[11px] text-[var(--warning)]">Este requerimiento quedará como parcialmente atendido. Podrá completarse cuando haya más stock disponible.</p>
            </div>
          )}
          <div className="space-y-1 text-[13px]">
            <h4 className="font-medium text-[var(--text-primary)]">Resumen de esta atención:</h4>
            {salidas.filter((s) => s.salidaQty > 0).map((item) => (
              <div key={item.key} className="flex justify-between text-[var(--text-secondary)]">
                <span>{item.insumo}</span>
                <span className="font-medium">{qty(item.salidaQty, item.unidad)}</span>
              </div>
            ))}
          </div>
          {salidas.some((s) => s.yaAtendido > 0) && (
            <div className="space-y-1 text-[13px]">
              <h4 className="font-medium text-[var(--text-primary)]">Acumulado total (previa + esta):</h4>
              {salidas.filter((s) => s.yaAtendido + s.salidaQty > 0).map((item) => {
                const total = item.yaAtendido + item.salidaQty;
                return (
                  <div key={item.insumo} className="flex justify-between text-[var(--text-secondary)]">
                    <span>{item.insumo}</span>
                    <span className="font-medium">{qty(total, item.unidad)} / {qty(item.cantidad, item.unidad)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
