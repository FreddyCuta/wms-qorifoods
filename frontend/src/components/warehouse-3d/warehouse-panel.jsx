import { useCallback, useState, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { WarehouseScene } from './warehouse-scene.jsx'
import { RotateCcw, X, Package, MapPin, Calendar, User, AlertTriangle } from 'lucide-react'
import { cn, qty } from '../../lib/utils.js'

const STATUS_STYLE = {
  disponible: 'bg-success/10 text-success border-success/20',
  bajo: 'bg-warning/10 text-warning border-warning/20',
  agotado: 'bg-critical/10 text-critical border-critical/20',
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

function InfoPanel({ item, onClose }) {
  return (
    <div className="animate-in slide-in-from-right-2 rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-bold text-foreground">Detalle del Lote</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
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

function CameraReset({ onReset }) {
  const { camera } = useThree()
  const defaultPos = useRef(null)

  useEffect(() => {
    if (!defaultPos.current) {
      defaultPos.current = camera.position.clone()
    }
  }, [camera])

  useEffect(() => {
    if (onReset) {
      onReset.current = () => {
        if (defaultPos.current) {
          camera.position.copy(defaultPos.current)
          camera.lookAt(0, 1, 0)
        }
      }
    }
  }, [camera, onReset])

  return null
}

export function WarehousePanel({
  selectedItem,
  onSelectBox,
  onHoverItem,
  compact,
  showToolbar = true,
  showInfoPanel = true,
  height,
  className,
}) {
  const [resetKey, setResetKey] = useState(0)
  const resetFnRef = useRef(null)
  const [internalSelected, setInternalSelected] = useState(null)

  const item = selectedItem || internalSelected

  const handleSelectBox = useCallback((boxItem) => {
    if (onSelectBox) {
      onSelectBox(boxItem)
    } else {
      setInternalSelected((prev) => (prev?.id === boxItem?.id ? null : boxItem))
    }
  }, [onSelectBox])

  const handleResetCamera = useCallback(() => {
    if (resetFnRef.current) {
      resetFnRef.current()
    } else {
      setResetKey((k) => k + 1)
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'r' || e.key === 'R') {
      handleResetCamera()
    }
  }, [handleResetCamera])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const containerHeight = height || (compact ? 'h-64' : 'h-full')

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-card', containerHeight, className)}>
      <Canvas
        key={resetKey}
        shadows
        camera={{ position: compact ? [24, 16, 24] : [30, 22, 30], fov: compact ? 50 : 40 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <WarehouseScene
          onSelectBox={handleSelectBox}
          selectedItem={item}
        />
        {showToolbar && <CameraReset onReset={resetFnRef} />}
      </Canvas>

      {showInfoPanel && item && (
        <div className={cn(
          'absolute z-10',
          compact ? 'right-2 top-2 w-56' : 'right-4 top-4 w-72',
        )}>
          <InfoPanel item={item} onClose={() => {
            handleSelectBox({ id: null })
            setInternalSelected(null)
          }} />
        </div>
      )}

      {showToolbar && (
        <div className={cn(
          'absolute z-10',
          compact ? 'bottom-1.5 left-1.5' : 'bottom-4 left-1/2 -translate-x-1/2',
        )}>
          <div className={cn(
            'flex items-center gap-1 rounded-xl border border-border bg-card/90 px-2 py-1.5 shadow-lg backdrop-blur-sm',
            compact ? 'scale-75 origin-bottom-left' : '',
          )}>
            <button
              type="button"
              onClick={handleResetCamera}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Resetear vista (R)"
            >
              <RotateCcw className="size-3.5" />
              {!compact && 'Resetear'}
            </button>
            {!compact && (
              <>
                <div className="h-3 w-px bg-border" />
                <span className="text-[10px] text-muted-foreground px-1">
                  R para resetear
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
