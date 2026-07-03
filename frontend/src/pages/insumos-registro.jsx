import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { ActionButton } from "../components/ui/action-button.jsx";
import { Field, SelectInput, TextInput } from "../components/ui/form-field.jsx";
import { cn } from "../lib/utils.js";

export default function InsumosRegistroPage() {
  const { addInsumo, updateInsumo, addToast, insumos } = useApp();
  const formRef = useRef(null);
  const [nombre, setNombre] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [unidad, setUnidad] = useState("kg");
  const [puntoReorden, setPuntoReorden] = useState("");
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);

  const isEditing = editing !== null;

  function startEdit(insumo) {
    setEditing(insumo);
    setNombre(insumo.nombre);
    setProveedor(insumo.proveedor);
    setUnidad(insumo.unidad);
    setPuntoReorden(String(insumo.puntoReorden));
    setErrors({});
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditing(null);
    setNombre(""); setProveedor(""); setUnidad("kg"); setPuntoReorden("");
    setErrors({});
  }

  function validateForm() {
    const next = {};
    if (!nombre.trim()) next.nombre = "Este campo es obligatorio.";
    if (!isEditing) {
      if (insumos.some((i) => i.nombre.toLowerCase() === nombre.toLowerCase())) next.nombre = "Este insumo ya existe en el sistema.";
    } else {
      const nombreCambio = nombre.trim().toLowerCase() !== editing.nombre.toLowerCase();
      if (nombreCambio && insumos.some((i) => i.nombre.toLowerCase() === nombre.toLowerCase())) next.nombre = "Este insumo ya existe en el sistema.";
    }
    if (!proveedor.trim()) next.proveedor = "Este campo es obligatorio.";
    if (puntoReorden === "" || Number(puntoReorden) < 0) next.puntoReorden = "Ingresa un número válido mayor o igual a 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    if (isEditing) {
      updateInsumo(editing.id, { nombre: nombre.trim(), proveedor: proveedor.trim(), unidad, puntoReorden: Number(puntoReorden) });
      addToast(`Insumo "${nombre}" actualizado exitosamente.`);
      cancelEdit();
    } else {
      addInsumo({ nombre: nombre.trim(), proveedor: proveedor.trim(), unidad, puntoReorden: Number(puntoReorden) });
      setNombre(""); setProveedor(""); setUnidad("kg"); setPuntoReorden("");
      setErrors({});
      addToast(`Insumo "${nombre}" registrado exitosamente.`);
    }
  }

  return (
    <AppShell title="Registrar Insumo" allowedRoles={["jefe"]}>
      <div className="flex gap-6 items-start">
        <div className="max-w-[480px] min-w-[360px]">
          <div ref={formRef}>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-3">
              {isEditing ? "Editar insumo" : "Agregar nuevo insumo"}
            </h2>

            {isEditing && (
              <div className="mb-3 flex items-center gap-2 rounded-sm border border-[var(--accent-subtle)] bg-[var(--accent-subtle)] px-3 py-1.5 text-[13px] text-[var(--accent-text)]">
                <Pencil className="size-3.5 shrink-0" />
                Editando: <span className="font-medium">{editing.nombre}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Field label="Nombre del insumo" error={errors.nombre}>
                <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Harina de trigo premium" invalid={!!errors.nombre} />
              </Field>

              <Field label="Proveedor" error={errors.proveedor}>
                <TextInput value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Ej: Molinos del Norte SAC" invalid={!!errors.proveedor} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Unidad de medida">
                  <SelectInput value={unidad} onChange={(e) => setUnidad(e.target.value)}>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="L">Litros (L)</option>
                  </SelectInput>
                </Field>

                <Field label="Punto de reorden (ROP)" error={errors.puntoReorden}>
                  <div className="relative">
                    <TextInput type="number" value={puntoReorden} onChange={(e) => setPuntoReorden(e.target.value)} placeholder="0" invalid={!!errors.puntoReorden} min="0" className="pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--text-tertiary)]">{unidad}</span>
                  </div>
                </Field>
              </div>

              <div className="flex gap-2 mt-1">
                {isEditing && <ActionButton variant="ghost" size="sm" type="button" onClick={cancelEdit}>Cancelar</ActionButton>}
                <ActionButton type="submit" fullWidth={!isEditing}>
                  {isEditing ? "Guardar cambios" : "Registrar insumo"}
                </ActionButton>
              </div>
            </form>
          </div>
        </div>

        {insumos.length > 0 && (
          <div className="flex-1">
            <h3 className="mb-3 text-[14px] font-semibold text-[var(--text-primary)]">Insumos registrados ({insumos.length})</h3>
            <div className="flex flex-col gap-1">
              {insumos.map((insumo, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between rounded-sm border px-3 py-2 text-[13px]",
                  isEditing && editing.nombre === insumo.nombre ? "border-[var(--accent)]/40 bg-[var(--accent-subtle)]" : "border-[var(--border-subtle)] bg-[var(--surface-raised)]",
                )}>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-[var(--text-primary)]">{insumo.nombre}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{insumo.proveedor}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 ml-4">
                    <div className="text-right">
                      <div className="text-[11px] font-medium text-[var(--text-primary)]">ROP: {insumo.puntoReorden} {insumo.unidad}</div>
                    </div>
                    <button type="button" aria-label="Editar insumo" onClick={() => startEdit(insumo)} className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]">
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
