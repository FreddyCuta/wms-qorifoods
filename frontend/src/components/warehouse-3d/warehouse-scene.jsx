import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Edges, Html } from '@react-three/drei'
import { useApp } from '../../lib/store.jsx'

function parseLocation(loc) {
  const m = loc?.match(/Pasillo (\w+)\s*–\s*Rack (\d+)\s*–\s*Nivel (\d+)/)
  if (!m) return null
  return { pasillo: m[1], rack: parseInt(m[2]), nivel: parseInt(m[3]) }
}

const PASILLO_Z = { A: -6, B: -2, C: 2, D: 6 }

const BAY_X = {}
for (let i = 1; i <= 6; i++) BAY_X[i] = -10 + (i - 1) * 4

const SHELF_Y = [0.04, 0.54, 1.04, 1.54, 2.04]
const NIVEL_Y = { 1: 0.07, 2: 0.57, 3: 1.07, 4: 1.57, 5: 2.07 }

const INSUMO_COLOR = {
  'Sémola de trigo': '#c8922a',
  'Harina de trigo': '#f0e6d3',
  'Aceite vegetal': '#e67e22',
  'Sal yodada': '#d5d0c5',
  'Huevos deshidratados': '#f1c40f',
  'Quinua orgánica': '#8B4513',
}

const STATUS_COLOR = {
  disponible: '#27ae60',
  bajo: '#e67e22',
  agotado: '#c0392b',
}

const ROW_L = 28
const ROW_D = 2
const POST_H = 3.0
const BAY_W = 3.6
const UPRIGHT_X = []
for (let x = -12; x <= 12; x += 4) UPRIGHT_X.push(x)

function RackRow({ position, rowLetter }) {
  return (
    <group position={position}>
      {[-0.9, 0.9].map((zOff) =>
        UPRIGHT_X.map((ux, i) => (
          <mesh key={`up-${zOff}-${i}`} position={[ux, POST_H / 2, zOff]} castShadow>
            <boxGeometry args={[0.08, POST_H, 0.08]} />
            <meshStandardMaterial color="#5a4a3e" metalness={0.5} roughness={0.5} />
          </mesh>
        ))
      )}
      {SHELF_Y.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[ROW_L, 0.05, ROW_D]} />
          <meshStandardMaterial color="#7a6a5a" roughness={0.8} />
        </mesh>
      ))}
      {SHELF_Y.map((y, i) => (
        <mesh key={`lip-${i}`} position={[ROW_L / 2 - 0.2, y + 0.035, 0]}>
          <boxGeometry args={[0.04, 0.04, ROW_D - 0.3]} />
          <meshStandardMaterial color="#c8922a" roughness={0.6} />
        </mesh>
      ))}
      <Text
        position={[-15, 3.3, 0]}
        fontSize={0.35}
        color="#c8922a"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#2a1a0a"
      >
        {`PASILLO ${rowLetter}`}
      </Text>
    </group>
  )
}

function ControlsWithKeyboard() {
  const controlsRef = useRef()
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={3}
      maxDistance={50}
      maxPolarAngle={Math.PI / 1.5}
      minPolarAngle={0.05}
      target={[0, 1, 0]}
      enableDamping
      dampingFactor={0.15}
      rotateSpeed={1.2}
      zoomSpeed={1.2}
      enablePan
      panSpeed={1.5}
    />
  )
}

const GRID_PASILLOS = ['A', 'B', 'C', 'D']
const GRID_RACKS = [1, 2, 3, 4, 5, 6]
const GRID_NIVELES = [1, 2, 3, 4, 5]

function GridCursor({ onSelect, onCursorChange }) {
  const [pi, setPi] = useState(1)
  const [ri, setRi] = useState(2)
  const [ni, setNi] = useState(2)

  const pasillo = GRID_PASILLOS[pi]
  const rack = GRID_RACKS[ri]
  const nivel = GRID_NIVELES[ni]

  useEffect(() => {
    onCursorChange?.({ pasillo, rack, nivel })
  }, [pi, ri, ni, pasillo, rack, nivel, onCursorChange])

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); setPi(p => Math.max(0, p - 1)); break
        case 'ArrowDown': e.preventDefault(); setPi(p => Math.min(3, p + 1)); break
        case 'ArrowLeft': e.preventDefault(); setRi(r => Math.max(0, r - 1)); break
        case 'ArrowRight': e.preventDefault(); setRi(r => Math.min(5, r + 1)); break
        case 'w': case 'W': e.preventDefault(); setNi(n => Math.min(4, n + 1)); break
        case 's': case 'S': e.preventDefault(); setNi(n => Math.max(0, n - 1)); break
        case 'Enter':
          if (onSelect) {
            e.preventDefault()
            onSelect({ pasillo, rack, nivel })
          }
          break
        default: return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pi, ri, ni, pasillo, rack, nivel, onSelect])

  const z = PASILLO_Z[pasillo]
  const x = BAY_X[rack]
  const y = NIVEL_Y[nivel]

  return (
    <group>
      <mesh position={[x, y + 0.005, z]}>
        <boxGeometry args={[BAY_W - 0.3, 0.01, 1.6]} />
        <meshBasicMaterial color="#e67e22" transparent opacity={0.35} />
        <Edges color="#e67e22" />
      </mesh>
      {[-0.7, 0.7].map((dz) => (
        <mesh key={dz} position={[x, y + 0.35, z + dz]}>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshBasicMaterial color="#e67e22" />
        </mesh>
      ))}
    </group>
  )
}

function StockBox({ item, position, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()
  const color = INSUMO_COLOR[item.insumo] || '#888'
  const ratio = item.cantidadInicial > 0 ? item.cantidad / item.cantidadInicial : 0.5
  const boxH = Math.max(0.12, Math.min(0.35, ratio * 0.4))

  useFrame(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onClick?.(item) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        ref={meshRef}
        position={[position[0], position[1] + boxH / 2, position[2]]}
        castShadow
      >
        <boxGeometry args={[0.5, boxH, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#c8922a' : STATUS_COLOR[item.estado]}
          emissiveIntensity={isSelected ? 0.4 : 0.08}
          roughness={0.4}
          metalness={0.1}
        />
        <Edges color={hovered || isSelected ? '#c8922a' : '#3a2a1a'} />
      </mesh>
      {hovered && (
        <Html
          position={[position[0], position[1] + boxH + 0.35, position[2]]}
          center
          distanceFactor={6}
        >
          <div className="pointer-events-none max-w-[180px] rounded-lg border border-border/50 bg-white px-3 py-2 text-xs shadow-lg">
            <div className="font-semibold text-foreground">{item.insumo}</div>
            <div className="mt-0.5 text-muted-foreground">
              <span className="font-medium text-foreground">{item.cantidad}</span>
              {' '}{item.unidad}
              <span className="mx-1">·</span>
              {item.codigoLote}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

function EmptySlot({ position, pasillo, rack, nivel, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const clickable = !!onSelect
  return (
    <mesh
      position={[position[0], position[1] + 0.02, position[2]]}
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onSelect?.({ pasillo, rack, nivel }) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <boxGeometry args={[BAY_W, 0.02, 1.8]} />
      <meshStandardMaterial
        color={clickable && hovered ? '#c8922a' : '#3a2a1a'}
        transparent
        opacity={clickable && hovered ? 0.5 : 0.08}
        roughness={0.9}
      />
    </mesh>
  )
}

function AisleLine({ z }) {
  return (
    <mesh position={[0, 0.005, z]} receiveShadow>
      <boxGeometry args={[30, 0.005, 0.06]} />
      <meshStandardMaterial color="#c8a050" transparent opacity={0.25} />
    </mesh>
  )
}

function WarehouseWalls() {
  return (
    <group>
      <mesh position={[0, 0.25, -7.55]} receiveShadow>
        <boxGeometry args={[32, 0.5, 0.15]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
      <mesh position={[-16.05, 0.25, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.5, 16]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
      <mesh position={[16.05, 0.25, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.5, 16]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
    </group>
  )
}

function LoadingDock() {
  return (
    <group>
      <mesh position={[0, 0.05, 7.5]} receiveShadow>
        <boxGeometry args={[10, 0.1, 2]} />
        <meshStandardMaterial color="#666" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.01, 10]} receiveShadow>
        <boxGeometry args={[12, 0.02, 1.5]} />
        <meshStandardMaterial color="#c8a050" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function distributeItems(items, bayCenterX, nivelY, rowZ) {
  const N = Math.min(items.length, 5)
  if (N === 0) return []
  const spacing = BAY_W / N
  const result = []
  for (let i = 0; i < N; i++) {
    const offsetX = -BAY_W / 2 + spacing / 2 + i * spacing
    result.push({ item: items[i], pos: [bayCenterX + offsetX, nivelY, rowZ] })
  }
  return result
}

export function WarehouseScene({ onSelectBox, selectedItem, onSelectLocation, onCursorChange }) {
  const { inventory } = useApp()

  const handleCursorChange = useCallback(({ pasillo, rack, nivel }) => {
    const ubicacion = `Pasillo ${pasillo} – Rack ${rack} – Nivel ${nivel}`
    const count = inventory.filter(i => i.ubicacion === ubicacion).length
    onCursorChange?.({ pasillo, rack, nivel, ocupados: count, libres: 5 - count })
  }, [inventory, onCursorChange])

  const rows = useMemo(() => {
    const itemsByLoc = {}
    inventory.forEach((item) => {
      const loc = parseLocation(item.ubicacion)
      if (!loc) return
      const key = `${loc.pasillo}-${loc.rack}-${loc.nivel}`
      if (!itemsByLoc[key]) itemsByLoc[key] = []
      itemsByLoc[key].push({ ...item, location: loc })
    })

    const result = []
    for (const pasillo of ['A', 'B', 'C', 'D']) {
      const bayNiveles = []
      for (const rack of [1, 2, 3, 4, 5, 6]) {
        for (const nivel of [1, 2, 3, 4, 5]) {
          const key = `${pasillo}-${rack}-${nivel}`
          bayNiveles.push({ rack, nivel, key, items: itemsByLoc[key] || [] })
        }
      }
      result.push({ pasillo, key: pasillo, bayNiveles })
    }
    return result
  }, [inventory])

  const aisleZs = [-4, 0, 4]

  return (
    <>
      <color args={['#f3f0eb']} attach="background" />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 30, 15]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={['#f5f0e1', '#d4c8b0', 0.25]} />

      <ControlsWithKeyboard />

      <Grid
        position={[0, -0.005, 0]}
        args={[36, 18]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#c8b8a5"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#8B7355"
        fadeStrength={0.1}
        followCamera={false}
      />

      <WarehouseWalls />
      <LoadingDock />

      {aisleZs.map((z) => (
        <AisleLine key={`aisle-${z}`} z={z} />
      ))}

      {rows.map(({ pasillo, bayNiveles }) => {
        const z = PASILLO_Z[pasillo]
        return (
          <group key={pasillo}>
            <RackRow position={[0, 0, z]} rowLetter={pasillo} />
            {bayNiveles.map(({ rack, nivel, key, items }) => {
              const bayX = BAY_X[rack]
              const nivelY = NIVEL_Y[nivel]
              const isSelectMode = !!onSelectLocation
              return (
                <group key={key}>
                  {items.length === 0 ? (
                    <EmptySlot
                      position={[bayX, nivelY, z]}
                      pasillo={pasillo}
                      rack={rack}
                      nivel={nivel}
                      onSelect={onSelectLocation}
                    />
                  ) : (
                    distributeItems(items, bayX, nivelY, z).map(({ item, pos }) => (
                      <StockBox
                        key={item.id}
                        item={item}
                        position={pos}
                        onClick={onSelectBox}
                        isSelected={selectedItem?.id === item.id}
                      />
                    ))
                  )}
                  {isSelectMode && items.length > 0 && (
                    <mesh
                      position={[bayX, nivelY + 0.02, z]}
                      onClick={(e) => { e.stopPropagation(); onSelectLocation({ pasillo, rack, nivel }) }}
                      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
                      onPointerOut={() => { document.body.style.cursor = 'default' }}
                    >
                      <boxGeometry args={[BAY_W, 0.02, 1.8]} />
                      <meshStandardMaterial transparent opacity={0} />
                    </mesh>
                  )}
                </group>
              )
            })}
          </group>
        )
      })}

      <GridCursor onSelect={onSelectLocation} onCursorChange={handleCursorChange} />
    </>
  )
}
