import { useState } from 'react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Field, SelectInput, TextInput } from '../components/ui/form-field.jsx'

export default function InsumosRegistroPage() {
  const { addInsumo, addToast, insumos } = useApp()
  const [nombre, setNombre] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [unidad, setUnidad] = useState('kg')
  const [puntoReorden, setPuntoReorden] = useState('')
  const [errors, setErrors] = useState({})

  function validateForm() {
    const next = {}
    if (!nombre.trim()) next.nombre = 'Este campo es obligatorio.'
    if (insumos.some((i) => i.nombre.toLowerCase() === nombre.toLowerCase())) {
      next.nombre = 'Este insumo ya existe en el sistema.'
    }
    if (!proveedor.trim()) next.proveedor = 'Este campo es obligatorio.'
    if (!puntoReorden || Number(puntoReorden) < 0) {
      next.puntoReorden = 'Ingresa un número válido mayor o igual a 0.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return
    addInsumo({ nombre: nombre.trim(), proveedor: proveedor.trim(), unidad, puntoReorden: Number(puntoReorden) })
    setNombre(''); setProveedor(''); setUnidad('kg'); setPuntoReorden(''); setErrors({})
    addToast(`Insumo "${nombre}" registrado exitosamente.`)
  }

  return (
    <AppShell title="Registrar Insumo" allowedRoles={['jefe']}>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">Agregar nuevo insumo al sistema</h2>

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
              <ActionButton type="submit" fullWidth>Registrar insumo</ActionButton>
            </div>
          </form>

          {insumos.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Insumos registrados ({insumos.length})
              </h3>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {insumos.map((insumo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-border/50 bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground">{insumo.nombre}</div>
                      <div className="text-xs text-muted-foreground">{insumo.proveedor}</div>
                    </div>
                    <div className="shrink-0 ml-4 text-right">
                      <div className="text-xs font-medium text-foreground">
                        ROP: {insumo.puntoReorden} {insumo.unidad}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
