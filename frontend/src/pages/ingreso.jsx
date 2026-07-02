import { useMemo, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { X } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { ActionButton } from '../components/ui/action-button.jsx'
import { Field, SelectInput, TextInput } from '../components/ui/form-field.jsx'
import { cn } from '../lib/utils.js'
import { WarehouseScene } from '../components/warehouse-3d/warehouse-scene.jsx'

const PASILLOS = ['A', 'B', 'C', 'D', 'E']
const RACKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const NIVELES = [1, 2, 3, 4, 5, 6]

export default function IngresoPage() {
  const { addToast, addLot, currentUser, insumos, inventory } = useApp()
  const [insumo, setInsumo] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [pasillo, setPasillo] = useState('')
  const [rack, setRack] = useState('')
  const [nivel, setNivel] = useState('')
  const [errors, setErrors] = useState({})
  const [show3DPicker, setShow3DPicker] = useState(false)

  const handleSelectLocation3D = useCallback(({ pasillo: p, rack: r, nivel: n }) => {
    setPasillo(p)
    setRack(String(r))
    setNivel(String(n))
    setShow3DPicker(false)
  }, [])

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

  const ubicacion = pasillo && rack && nivel
    ? `Pasillo ${pasillo} – Rack ${rack} – Nivel ${nivel}`
    : ''

  const lotesEnNivel = ubicacion
    ? inventory.filter((lot) => lot.ubicacion === ubicacion).length
    : 0

  const nivelLleno = lotesEnNivel >= 5

  function reset() {
    setInsumo('')
    setCantidad('')
    setVencimiento('')
    setPasillo('')
    setRack('')
    setNivel('')
    setErrors({})
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!insumo) next.insumo = 'Este campo es obligatorio.'
    if (!cantidad || Number(cantidad) <= 0) next.cantidad = 'La cantidad debe ser mayor a cero.'
    if (!vencimiento) next.vencimiento = 'La fecha de vencimiento debe ser posterior a la fecha actual.'
    if (!ubicacion) next.ubicacion = 'Seleccione una ubicación.'
    else if (nivelLleno) next.ubicacion = `Este nivel ya tiene ${lotesEnNivel} lotes (máximo 5).`

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

          <div className="md:col-span-2">
            <Field label="Ubicación en almacén" error={errors.ubicacion}>
              <div className="grid grid-cols-3 gap-2">
                <SelectInput
                  value={pasillo}
                  invalid={!!errors.ubicacion}
                  onChange={(e) => setPasillo(e.target.value)}
                >
                  <option value="">Pasillo</option>
                  {PASILLOS.map((p) => (
                    <option key={p} value={p}>Pasillo {p}</option>
                  ))}
                </SelectInput>
                <SelectInput
                  value={rack}
                  invalid={!!errors.ubicacion}
                  onChange={(e) => setRack(e.target.value)}
                >
                  <option value="">Rack</option>
                  {RACKS.map((r) => (
                    <option key={r} value={r}>Rack {r}</option>
                  ))}
                </SelectInput>
                <SelectInput
                  value={nivel}
                  invalid={!!errors.ubicacion}
                  onChange={(e) => setNivel(e.target.value)}
                >
                  <option value="">Nivel</option>
                  {NIVELES.map((n) => (
                    <option key={n} value={n}>Nivel {n}</option>
                  ))}
                </SelectInput>
              </div>
              <ActionButton
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setShow3DPicker(true)}
              >
                Seleccionar en 3D
              </ActionButton>
              {ubicacion && (
                <div className={cn(
                  'mt-1.5 text-right text-xs',
                  nivelLleno ? 'text-critical font-medium' : 'text-muted-foreground',
                )}>
                  {lotesEnNivel}/5 lotes en este nivel
                  {nivelLleno && ' — lleno'}
                </div>
              )}
            </Field>
          </div>

          {show3DPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="relative flex h-[85vh] w-[90vw] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:h-[80vh] md:w-[80vw]">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">
                    Seleccionar ubicación — haz clic en un espacio vacío
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShow3DPicker(false)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <Canvas
                    shadows
                    camera={{ position: [30, 22, 30], fov: 40 }}
                    gl={{ antialias: true }}
                    dpr={[1, 1.5]}
                  >
                    <WarehouseScene onSelectLocation={handleSelectLocation3D} />
                  </Canvas>
                </div>
              </div>
            </div>
          )}

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
