import { useMemo, useState } from 'react'
import { useApp } from '../lib/store.jsx'
import { UBICACIONES } from '../lib/data.js'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Field, SelectInput, TextInput } from '../components/ui/form-field.jsx'

export default function IngresoPage() {
  const { addToast, addLot, currentUser, insumos, inventory } = useApp()
  const [insumo, setInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [errors, setErrors] = useState({})

  const ahora = useMemo(() => {
    const d = new Date()
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const anio = d.getFullYear()
    const hora = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${dia}/${mes}/${anio} ${hora}:${min}`
  }, [])

  const fechaInput = ahora.split(' ')[0].split('/').reverse().join('-')

  const nextLotNumber = useMemo(() => {
    const maxNum = inventory.reduce((max, lot) => {
      const match = lot.codigoLote.match(/\d+$/)
      return match ? Math.max(max, parseInt(match[0], 10)) : max
    }, 0)
    return `LOT-2026-${String(maxNum + 1).padStart(4, '0')}`
  }, [inventory])

  const proveedor = insumos.find((i) => i.nombre === insumo)?.proveedor ?? ''
  const unidad = insumos.find((i) => i.nombre === insumo)?.unidad ?? 'kg'

  function reset() {
    setInsumo('')
    setCantidad('')
    setVencimiento('')
    setUbicacion('')
    setErrors({})
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!insumo) next.insumo = 'Este campo es obligatorio.'
    if (!cantidad || Number(cantidad) <= 0) next.cantidad = 'La cantidad debe ser mayor a cero.'
    if (!vencimiento) next.vencimiento = 'La fecha de vencimiento debe ser posterior a la fecha actual.'
    if (!ubicacion) next.ubicacion = 'Seleccione una ubicación.'

    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    addLot({
      id: Math.random().toString(36).slice(2),
      insumo,
      codigoLote: nextLotNumber,
      cantidad: Number(cantidad),
      unidad,
      cantidadInicial: Number(cantidad),
      vencimiento: vencimiento.split('-').reverse().join('/'),
      ubicacion,
      proveedor,
      estado: Number(cantidad) > 0 ? 'disponible' : 'agotado',
      fechaIngreso: ahora,
      registradoPor: currentUser?.name ?? 'Operario',
    })

    reset()
    addToast('Lote registrado correctamente.')
  }

  return (
    <AppShell title="Registrar Ingreso de Lote" allowedRoles={['operario']}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-[720px] rounded-lg border border-border bg-card p-6"
      >
        <h2 className="mb-5 text-base font-bold text-foreground">Datos del lote</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Insumo" error={errors.insumo}>
            <SelectInput
              value={insumo}
              invalid={!!errors.insumo}
              onChange={(e) => setInsumo(e.target.value)}
            >
              <option value="">Seleccione un insumo...</option>
              {insumos.map((i) => (
                <option key={i.nombre} value={i.nombre}>
                  {i.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Fecha y hora de ingreso">
            <TextInput type="text" value={ahora} readOnly disabled />
          </Field>

          <Field label="Proveedor">
            <TextInput
              readOnly
              value={proveedor}
              placeholder="Se autocompleta al seleccionar el insumo"
            />
          </Field>

          <Field label="Número de lote">
            <TextInput type="text" value={nextLotNumber} readOnly disabled />
          </Field>

          <Field label="Cantidad" error={errors.cantidad}>
            <div className="relative">
              <TextInput
                type="number"
                value={cantidad}
                invalid={!!errors.cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {unidad}
              </span>
            </div>
          </Field>

          <Field label="Fecha de vencimiento" error={errors.vencimiento}>
            <TextInput
              type="date"
              value={vencimiento}
              invalid={!!errors.vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
            />
          </Field>

          <Field label="Ubicación en almacén" error={errors.ubicacion}>
            <SelectInput
              value={ubicacion}
              invalid={!!errors.ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            >
              <option value="">Seleccione una ubicación...</option>
              {UBICACIONES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Registrado por">
            <TextInput readOnly value={currentUser?.name ?? 'Operario'} />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <ActionButton variant="ghost" type="button" onClick={reset}>
            Cancelar
          </ActionButton>
          <ActionButton type="submit">Registrar Ingreso</ActionButton>
        </div>
      </form>
    </AppShell>
  )
}
