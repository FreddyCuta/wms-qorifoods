import { useRef, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Field, SelectInput, TextInput } from '../components/ui/form-field.jsx'
import { cn } from '../lib/utils.js'

export default function InsumosRegistroPage() {
  const { addInsumo, updateInsumo, addToast, insumos } = useApp()
  const formRef = useRef(null)
  const [nombre, setNombre] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [unidad, setUnidad] = useState('kg')
  const [puntoReorden, setPuntoReorden] = useState('')
  const [errors, setErrors] = useState({})
  const [editing, setEditing] = useState(null)

  const isEditing = editing !== null

  function startEdit(insumo) {
    setEditing(insumo)
    setNombre(insumo.nombre)
    setProveedor(insumo.proveedor)
    setUnidad(insumo.unidad)
    setPuntoReorden(String(insumo.puntoReorden))
    setErrors({})
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function cancelEdit() {
    setEditing(null)
    setNombre('')
    setProveedor('')
    setUnidad('kg')
    setPuntoReorden('')
    setErrors({})
  }

  function validateForm() {
    const next = {}
    if (!nombre.trim()) next.nombre = 'Este campo es obligatorio.'
    if (!isEditing) {
      if (insumos.some((i) => i.nombre.toLowerCase() === nombre.toLowerCase())) {
        next.nombre = 'Este insumo ya existe en el sistema.'
      }
    } else {
      const nombreCambio = nombre.trim().toLowerCase() !== editing.nombre.toLowerCase()
      if (nombreCambio && insumos.some((i) => i.nombre.toLowerCase() === nombre.toLowerCase())) {
        next.nombre = 'Este insumo ya existe en el sistema.'
      }
    }
    if (!proveedor.trim()) next.proveedor = 'Este campo es obligatorio.'
    if (puntoReorden === '' || Number(puntoReorden) < 0) {
      next.puntoReorden = 'Ingresa un número válido mayor o igual a 0.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    if (isEditing) {
      updateInsumo(editing.nombre, {
        nombre: nombre.trim(),
        proveedor: proveedor.trim(),
        unidad,
        puntoReorden: Number(puntoReorden),
      })
      addToast(`Insumo "${nombre}" actualizado exitosamente.`)
      cancelEdit()
    } else {
      addInsumo({
        nombre: nombre.trim(),
        proveedor: proveedor.trim(),
        unidad,
        puntoReorden: Number(puntoReorden),
      })
      setNombre(''); setProveedor(''); setUnidad('kg'); setPuntoReorden(''); setErrors({})
      addToast(`Insumo "${nombre}" registrado exitosamente.`)
    }
  }

  return (
    <AppShell title="Registrar Insumo" allowedRoles={['jefe']}>
      <div className="mx-auto max-w-2xl">
        <div ref={formRef} className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            {isEditing ? 'Editar insumo' : 'Agregar nuevo insumo al sistema'}
          </h2>

          {isEditing && (
            <div className="mb-5 flex items-center gap-2 rounded-md border border-accent/50 bg-accent/30 px-3 py-2 text-sm text-accent-foreground">
              <Pencil className="size-4 shrink-0" />
              Editando: <span className="font-medium">{editing.nombre}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nombre del insumo" error={errors.nombre}>
              <TextInput
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Harina de trigo premium"
                invalid={!!errors.nombre}
              />
            </Field>

            <Field label="Proveedor" error={errors.proveedor}>
              <TextInput
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Ej: Molinos del Norte SAC"
                invalid={!!errors.proveedor}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Unidad de medida">
                <SelectInput value={unidad} onChange={(e) => setUnidad(e.target.value)}>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="L">Litros (L)</option>
                </SelectInput>
              </Field>

              <Field label="Punto de reorden (ROP)" error={errors.puntoReorden}>
                <div className="relative">
                  <TextInput
                    type="number"
                    value={puntoReorden}
                    onChange={(e) => setPuntoReorden(e.target.value)}
                    placeholder="0"
                    invalid={!!errors.puntoReorden}
                    min="0"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {unidad}
                  </span>
                </div>
              </Field>
            </div>

            <div className="mt-6 flex gap-2">
              {isEditing && (
                <ActionButton variant="ghost" type="button" onClick={cancelEdit}>
                  Cancelar
                </ActionButton>
              )}
              <ActionButton type="submit" fullWidth={!isEditing}>
                {isEditing ? 'Guardar cambios' : 'Registrar insumo'}
              </ActionButton>
            </div>
          </form>
        </div>

        {insumos.length > 0 && (
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Insumos registrados ({insumos.length})
            </h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {insumos.map((insumo, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
                    isEditing && editing.nombre === insumo.nombre
                      ? 'border-primary/40 bg-accent/30'
                      : 'border-border/50 bg-muted/40',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{insumo.nombre}</div>
                    <div className="text-xs text-muted-foreground">{insumo.proveedor}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 ml-4">
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground">
                        ROP: {insumo.puntoReorden} {insumo.unidad}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Editar insumo"
                      onClick={() => startEdit(insumo)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
