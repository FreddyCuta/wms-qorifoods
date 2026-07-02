import { useMemo, useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Edges, Html } from '@react-three/drei'
import { useApp } from '../../lib/store.jsx'

function parseLocation(loc) {
  const m = loc?.match(/Pasillo (\w+)\s*–\s*Rack (\d+)\s*–\s*Nivel (\d+)/)
  if (!m) return null
  return { pasillo: m[1], rack: parseInt(m[2]), nivel: parseInt(m[3]) }
}

const PASILLO_Z = { A: -8, B: -4, C: 0, D: 4, E: 8 }

const BAY_X = {}
for (let i = 1; i <= 10; i++) BAY_X[i] = -18 + (i - 1) * 4

const SHELF_Y = [0.04, 0.54, 1.04, 1.54, 2.04, 2.54]
const NIVEL_Y = { 1: 0.07, 2: 0.57, 3: 1.07, 4: 1.57, 5: 2.07, 6: 2.57 }

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

const ROW_L = 40
const ROW_D = 2
const POST_H = 3.0
const BAY_W = 3.6
const UPRIGHT_X = []
for (let x = -20; x <= 20; x += 4) UPRIGHT_X.push(x)

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
        position={[-21.5, 3.3, 0]}
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
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const step = 2
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
    const B = { xMin: -22, xMax: 22, zMin: -10, zMax: 10 }
    const handler = (e) => {
      let dx = 0, dz = 0
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); dz = -step; break
        case 'ArrowDown': e.preventDefault(); dz = step; break
        case 'ArrowLeft': e.preventDefault(); dx = -step; break
        case 'ArrowRight': e.preventDefault(); dx = step; break
        default: return
      }
      const c = controls
      const oldZ = c.target.z
      const oldX = c.target.x
      c.target.z = clamp(c.target.z + dz, B.zMin, B.zMax)
      c.target.x = clamp(c.target.x + dx, B.xMin, B.xMax)
      c.object.position.z += c.target.z - oldZ
      c.object.position.x += c.target.x - oldX
      c.update()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={4}
      maxDistance={80}
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
      <boxGeometry args={[40, 0.005, 0.06]} />
      <meshStandardMaterial color="#c8a050" transparent opacity={0.25} />
    </mesh>
  )
}

function WarehouseWalls() {
  return (
    <group>
      <mesh position={[0, 0.25, -10.55]} receiveShadow>
        <boxGeometry args={[46, 0.5, 0.15]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
      <mesh position={[-23.05, 0.25, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.5, 21]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
      <mesh position={[23.05, 0.25, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.5, 21]} />
        <meshStandardMaterial color="#d4d0c8" roughness={0.9} />
      </mesh>
    </group>
  )
}

function LoadingDock() {
  return (
    <group>
      <mesh position={[0, 0.05, 10]} receiveShadow>
        <boxGeometry args={[14, 0.1, 2]} />
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

export function WarehouseScene({ onSelectBox, selectedItem, onSelectLocation }) {
  const { inventory } = useApp()

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
    for (const pasillo of ['A', 'B', 'C', 'D', 'E']) {
      const bayNiveles = []
      for (const rack of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        for (const nivel of [1, 2, 3, 4, 5, 6]) {
          const key = `${pasillo}-${rack}-${nivel}`
          bayNiveles.push({ rack, nivel, key, items: itemsByLoc[key] || [] })
        }
      }
      result.push({ pasillo, key: pasillo, bayNiveles })
    }
    return result
  }, [inventory])

  const aisleZs = [-6, -2, 2, 6]

  return (
    <>
      <color args={['#f3f0eb']} attach="background" />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 30, 15]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight args={['#f5f0e1', '#d4c8b0', 0.25]} />

      <ControlsWithKeyboard />

      <Grid
        position={[0, -0.005, 0]}
        args={[52, 24]}
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

    </>
  )
}
