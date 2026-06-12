import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, ContactShadows, Edges, Html } from '@react-three/drei'
import { useApp } from '../../lib/store.jsx'

function parseLocation(loc) {
  const m = loc?.match(/Pasillo (\w+)\s*–\s*Rack (\d+)\s*–\s*Nivel (\d+)/)
  if (!m) return null
  return { pasillo: m[1], rack: parseInt(m[2]), nivel: parseInt(m[3]) }
}

const PASILLO_X = { A: -9, B: -3, C: 3, D: 9 }
const RACK_Z = { 1: -4, 2: 0, 3: 4 }
const NIVEL_Y = { 1: 0.4, 2: 1.2, 3: 2.0 }

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

function RackFrame({ position, pasilloLetter, rackNum }) {
  const w = 2.2
  const d = 0.9
  const postH = 2.5
  const shelfY = [0.04, 0.84, 1.64]
  const postPositions = [
    [-w / 2 + 0.06, postH / 2, -d / 2 + 0.06],
    [w / 2 - 0.06, postH / 2, -d / 2 + 0.06],
    [-w / 2 + 0.06, postH / 2, d / 2 - 0.06],
    [w / 2 - 0.06, postH / 2, d / 2 - 0.06],
  ]

  return (
    <group position={position}>
      {postPositions.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.06, postH, 0.06]} />
          <meshStandardMaterial color="#5a4a3e" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {shelfY.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[w, 0.06, d]} />
          <meshStandardMaterial color="#7a6a5a" roughness={0.8} />
        </mesh>
      ))}
      <Text
        position={[0, 2.9, 0]}
        fontSize={0.22}
        color="#c8922a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#2a1a0a"
      >
        {`P-${pasilloLetter} R${rackNum}`}
      </Text>
    </group>
  )
}

function StockBox({ item, position, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()
  const color = INSUMO_COLOR[item.insumo] || '#888'
  const ratio = item.cantidadInicial > 0 ? item.cantidad / item.cantidadInicial : 0.5
  const boxH = Math.max(0.15, Math.min(0.5, ratio * 0.55))

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
        <boxGeometry args={[0.55, boxH, 0.45]} />
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
          position={[position[0], position[1] + boxH + 0.25, position[2]]}
          center
          distanceFactor={8}
        >
          <div className="pointer-events-none rounded-md bg-black/80 px-2.5 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm">
            <div className="font-semibold">{item.insumo}</div>
            <div className="text-white/70">{item.cantidad} {item.unidad} · {item.codigoLote}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function EmptySlot({ position }) {
  return (
    <mesh position={[position[0], position[1] + 0.04, position[2]]} receiveShadow>
      <boxGeometry args={[0.55, 0.04, 0.45]} />
      <meshStandardMaterial color="#3a2a1a" transparent opacity={0.15} roughness={0.9} />
    </mesh>
  )
}

function PasilloSign({ letter, x }) {
  return (
    <group position={[x, 0.01, -5.8]}>
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[1.6, 0.5]} />
        <meshBasicMaterial color="#6b2d1f" />
      </mesh>
      <Text
        position={[0, 0.8, 0.01]}
        fontSize={0.3}
        color="#c8922a"
        anchorX="center"
        anchorY="middle"
      >
        {`PASILLO ${letter}`}
      </Text>
    </group>
  )
}

function Legend() {
  const legendItems = [
    { color: '#27ae60', label: 'Disponible' },
    { color: '#e67e22', label: 'Stock bajo' },
    { color: '#c0392b', label: 'Agotado' },
  ]
  return (
    <Html position={[-9, 3.5, -5.8]} center distanceFactor={10}>
      <div className="rounded-lg border border-border bg-card/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
        <div className="mb-1 font-semibold text-foreground">Estado</div>
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </Html>
  )
}

export function WarehouseScene({ onSelectBox, selectedItem }) {
  const { inventory } = useApp()

  const racks = useMemo(() => {
    const itemsByKey = {}
    inventory.forEach((item) => {
      const loc = parseLocation(item.ubicacion)
      if (!loc) return
      const key = `${loc.pasillo}-${loc.rack}`
      if (!itemsByKey[key]) itemsByKey[key] = []
      itemsByKey[key].push({ ...item, location: loc })
    })

    const result = []
    for (const pasillo of ['A', 'B', 'C', 'D']) {
      for (const rack of [1, 2, 3]) {
        const key = `${pasillo}-${rack}`
        result.push({ pasillo, rack, key, items: itemsByKey[key] || [] })
      }
    }
    return result
  }, [inventory])

  const occupiedLevels = useMemo(() => {
    const set = new Set()
    inventory.forEach((item) => {
      const loc = parseLocation(item.ubicacion)
      if (loc) set.add(`${loc.pasillo}-${loc.rack}-${loc.nivel}`)
    })
    return set
  }, [inventory])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={['#f5f0e1', '#6b2d1f', 0.25]} />

      <OrbitControls
        makeDefault
        minDistance={4}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1, 0]}
        enableDamping
        dampingFactor={0.08}
      />

      <Grid
        position={[0, -0.005, 0]}
        args={[35, 28]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#c8b8a5"
        sectionSize={3}
        sectionThickness={0.8}
        sectionColor="#8B7355"
        fadeStrength={0.15}
        followCamera={false}
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={28}
        blur={3}
        far={6}
      />

      {racks.map(({ pasillo, rack, key, items }) => {
        const x = PASILLO_X[pasillo]
        const z = RACK_Z[rack]
        return (
          <group key={key}>
            <RackFrame
              position={[x, 0, z]}
              pasilloLetter={pasillo}
              rackNum={rack}
            />
            {items.map((item) => {
              const pos = [x, NIVEL_Y[item.location.nivel] || 0.4, z]
              return (
                <StockBox
                  key={item.id}
                  item={item}
                  position={pos}
                  onClick={onSelectBox}
                  isSelected={selectedItem?.id === item.id}
                />
              )
            })}
            {[1, 2, 3].map((nivel) => {
              const key_ = `${pasillo}-${rack}-${nivel}`
              if (!occupiedLevels.has(key_)) {
                return (
                  <EmptySlot
                    key={`empty-${key_}`}
                    position={[x, NIVEL_Y[nivel] || 0.4, z]}
                  />
                )
              }
              return null
            })}
          </group>
        )
      })}

      {Object.entries(PASILLO_X).map(([letter, x]) => (
        <PasilloSign key={letter} letter={letter} x={x} />
      ))}

      <Legend />
    </>
  )
}
