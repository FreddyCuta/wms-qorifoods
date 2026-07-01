import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { X, Package, MapPin, Calendar, User, AlertTriangle, RotateCcw } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { AppShell } from '../components/app-shell.jsx'
import { WarehouseScene } from '../components/warehouse-3d/warehouse-scene.jsx'
import { cn, qty } from '../lib/utils.js'

const STATUS_STYLE = {
  disponible: 'bg-success/10 text-success border-success/20',
  bajo: 'bg-warning/10 text-warning border-warning/20',
  agotado: 'bg-critical/10 text-critical border-critical/20',
}

function InfoPanel({ item, onClose }) {
  return (
    <div className="absolute right-4 top-4 w-72 animate-in slide-in-from-right-2 rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Detalle del Lote</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <div className="text-base font-bold text-foreground">{item.insumo}</div>
          <div className="text-xs text-muted-foreground">{item.codigoLote}</div>
        </div>

        <div className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          STATUS_STYLE[item.estado] || '',
        )}>
          <AlertTriangle className="size-3" />
          {item.estado === 'disponible' ? 'Disponible' : item.estado === 'bajo' ? 'Stock bajo' : 'Agotado'}
        </div>

        <div className="space-y-2">
          <DetailRow icon={<Package className="size-3.5" />} label="Cantidad">
            <span className="font-semibold">{qty(item.cantidad, item.unidad)}</span>
            <span className="text-xs text-muted-foreground">
              {' '}/ {qty(item.cantidadInicial, item.unidad)}
            </span>
          </DetailRow>

          <DetailRow icon={<MapPin className="size-3.5" />} label="Ubicación">
            {item.ubicacion}
          </DetailRow>

          <DetailRow icon={<Calendar className="size-3.5" />} label="Vencimiento">
            {item.vencimiento}
          </DetailRow>

          <DetailRow icon={<User className="size-3.5" />} label="Registrado por">
            {item.registradoPor}
          </DetailRow>

          <DetailRow label="Proveedor">
            {item.proveedor}
          </DetailRow>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {icon && <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>}
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground">{children}</span>
      </div>
    </div>
  )
}

function Toolbar({ onResetCamera }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onResetCamera}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <RotateCcw className="size-3.5" />
        Resetear vista
      </button>
      <div className="h-4 w-px bg-border" />
      <span className="text-xs text-muted-foreground">
        Arrastra para rotar · Scroll para zoom
      </span>
    </div>
  )
}

export default function Almacen3dPage() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [resetKey, setResetKey] = useState(0)
  const { activeAlertCount, pendingReqCount } = useApp()

  const handleSelectBox = useCallback((item) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item))
  }, [])

  const handleResetCamera = useCallback(() => {
    setResetKey((k) => k + 1)
  }, [])

  return (
    <AppShell title="Visualización 3D del Almacén">
      <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-xl border border-border bg-card">
        <Canvas
          key={resetKey}
          shadows
          camera={{ position: [26, 18, 26], fov: 45 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
        >
          <WarehouseScene
            onSelectBox={handleSelectBox}
            selectedItem={selectedItem}
          />
        </Canvas>

        {selectedItem && (
          <InfoPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}

        <Toolbar onResetCamera={handleResetCamera} />

        <div className="absolute left-4 top-4 flex gap-3">
          <MiniStat value={activeAlertCount} label="Alertas" color="text-warning" />
          <MiniStat value={pendingReqCount} label="Req. pendientes" color="text-info" />
        </div>
      </div>
    </AppShell>
  )
}

function MiniStat({ value, label, color }) {
  return (
    <div className="rounded-lg border border-border bg-card/80 px-3 py-1.5 shadow backdrop-blur-sm">
      <div className={cn('text-lg font-bold leading-none', color)}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}
