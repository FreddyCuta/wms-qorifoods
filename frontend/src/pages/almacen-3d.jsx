import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { X, Package, MapPin, Calendar, User, AlertTriangle, RotateCcw } from "lucide-react";
import { useApp } from "../lib/store.jsx";
import { AppShell } from "../components/app-shell.jsx";
import { WarehouseScene } from "../components/warehouse-3d/warehouse-scene.jsx";
import { cn, qty } from "../lib/utils.js";

const STATUS_STYLE = {
  disponible: "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/20",
  bajo: "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/20",
  agotado: "bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/20",
};

function InfoPanel({ item, onClose }) {
  return (
    <div className="absolute right-4 top-4 w-64 rounded-md border border-[var(--border-default)] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2.5">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)]">Detalle del Lote</h3>
        <button type="button" onClick={onClose} className="rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"><X className="size-3.5" /></button>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <div className="text-[14px] font-semibold text-[var(--text-primary)]">{item.insumo}</div>
          <div className="text-[11px] text-[var(--text-secondary)]">{item.codigoLote}</div>
        </div>

        <div className={cn("inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[item.estado] || "")}>
          <AlertTriangle className="size-2.5" />
          {item.estado === "disponible" ? "Disponible" : item.estado === "bajo" ? "Stock bajo" : "Agotado"}
        </div>

        <div className="space-y-1.5">
          <DetailRow icon={<Package className="size-3" />} label="Cantidad">
            <span className="font-medium">{qty(item.cantidad, item.unidad)}</span>
            <span className="text-[var(--text-tertiary)]"> / {qty(item.cantidadInicial, item.unidad)}</span>
          </DetailRow>
          <DetailRow icon={<MapPin className="size-3" />} label="Ubicación">{item.ubicacion}</DetailRow>
          <DetailRow icon={<Calendar className="size-3" />} label="Vencimiento">{item.vencimiento}</DetailRow>
          <DetailRow icon={<User className="size-3" />} label="Registrado por">{item.registradoPor}</DetailRow>
          <DetailRow label="Proveedor">{item.proveedor}</DetailRow>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      {icon && <span className="mt-0.5 shrink-0 text-[var(--text-tertiary)]">{icon}</span>}
      <div className="min-w-0 flex-1">
        <span className="text-[var(--text-secondary)]">{label}: </span>
        <span className="text-[var(--text-primary)]">{children}</span>
      </div>
    </div>
  );
}

function Toolbar({ onResetCamera }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md border border-[var(--border-default)] bg-white/90 px-2.5 py-1.5 shadow-sm">
      <button type="button" onClick={onResetCamera} className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]">
        <RotateCcw className="size-3" /> Resetear vista
      </button>
      <div className="h-3 w-px bg-[var(--border-subtle)]" />
      <span className="text-[11px] text-[var(--text-tertiary)]">Arrastra para rotar · Scroll para zoom</span>
    </div>
  );
}

export default function Almacen3dPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const { activeAlertCount, pendingReqCount } = useApp();
  const [cursorInfo, setCursorInfo] = useState({ pasillo: "B", rack: 3, nivel: 3, ocupados: 0, libres: 5 });

  const handleSelectBox = useCallback((item) => { setSelectedItem((prev) => (prev?.id === item.id ? null : item)); }, []);
  const handleCursorChange = useCallback((info) => { setCursorInfo(info); }, []);
  const handleResetCamera = useCallback(() => { setResetKey((k) => k + 1); }, []);

  return (
    <AppShell title="Visualización 3D del Almacén">
      <div className="relative h-[calc(100vh-10rem)] w-full overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]">
        <Canvas key={resetKey} shadows camera={{ position: [18, 14, 18], fov: 40 }} gl={{ antialias: true }} dpr={[1, 1.5]}>
          <WarehouseScene onSelectBox={handleSelectBox} selectedItem={selectedItem} onCursorChange={handleCursorChange} />
        </Canvas>

        {selectedItem && <InfoPanel item={selectedItem} onClose={() => setSelectedItem(null)} />}

        <Toolbar onResetCamera={handleResetCamera} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-sm border border-[var(--border-subtle)] bg-white/90 px-2.5 py-1 text-[11px] shadow-sm">
            <span className="font-medium text-[var(--text-primary)]">
              {cursorInfo.pasillo} <span className="text-[var(--text-tertiary)]">/</span> Rack {cursorInfo.rack} <span className="text-[var(--text-tertiary)]">/</span> Nivel {cursorInfo.nivel}
            </span>
            <span className="text-[var(--text-tertiary)]">·</span>
            <span className={cursorInfo.libres === 0 ? "text-[var(--danger)] font-medium" : "text-[var(--text-tertiary)]"}>
              {cursorInfo.ocupados}/5 ocupados · {cursorInfo.libres} libre{cursorInfo.libres !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="absolute left-4 top-4 flex gap-2">
          <MiniStat value={activeAlertCount} label="Alertas" color={activeAlertCount > 0 ? "text-[var(--danger)]" : "text-[var(--text-primary)]"} />
          <MiniStat value={pendingReqCount} label="Req. pendientes" color={pendingReqCount > 0 ? "text-[var(--warning)]" : "text-[var(--text-primary)]"} />
        </div>
      </div>
    </AppShell>
  );
}

function MiniStat({ value, label, color }) {
  return (
    <div className="rounded-sm border border-[var(--border-subtle)] bg-white/80 px-2.5 py-1 shadow-sm">
      <div className={cn("text-[16px] font-bold leading-none", color)}>{value}</div>
      <div className="text-[10px] text-[var(--text-tertiary)]">{label}</div>
    </div>
  );
}
