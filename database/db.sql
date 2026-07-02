-- ============================================================================
-- Esquema de Base de Datos — WMS Qori Foods
-- PostgreSQL 15+
-- ============================================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- 1. USUARIOS
CREATE TABLE usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  rol             VARCHAR(20) NOT NULL CHECK (rol IN ('jefe', 'supervisor', 'operario')),
  activo          BOOLEAN NOT NULL DEFAULT true
);

-- 2. INSUMOS (catálogo de materias primas)
CREATE TABLE insumos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(100) UNIQUE NOT NULL,
  proveedor       VARCHAR(200) NOT NULL,
  unidad          VARCHAR(10) NOT NULL CHECK (unidad IN ('kg', 'L')),
  punto_reorden   NUMERIC(10,2) NOT NULL DEFAULT 0,
  lead_time       INTEGER NOT NULL DEFAULT 0
);

-- 3. SECUENCIA para código de lote auto-incremental
CREATE SEQUENCE lote_codigo_seq START 1;

-- 4. UBICACIONES (todas las combinaciones pasillo / rack / nivel)
CREATE TABLE ubicaciones (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pasillo CHAR(1) NOT NULL CHECK (pasillo IN ('A', 'B', 'C', 'D')),
  rack    INTEGER NOT NULL CHECK (rack BETWEEN 1 AND 6),
  nivel   INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  UNIQUE (pasillo, rack, nivel)
);

-- 5. LOTES DE INVENTARIO
CREATE TABLE lotes_inventario (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id         UUID NOT NULL REFERENCES insumos(id),
  codigo_lote       VARCHAR(20) UNIQUE NOT NULL DEFAULT (
                      'LOT-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
                      || '-' || LPAD(NEXTVAL('lote_codigo_seq')::TEXT, 4, '0')
                    ),
  cantidad          NUMERIC(10,2) NOT NULL CHECK (cantidad >= 0),
  cantidad_inicial  NUMERIC(10,2) NOT NULL CHECK (cantidad_inicial > 0),
  vencimiento       DATE NOT NULL,
  ubicacion_id      UUID NOT NULL REFERENCES ubicaciones(id),
  proveedor         VARCHAR(200) NOT NULL,
  fecha_ingreso     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registrado_por_id UUID NOT NULL REFERENCES usuarios(id),
  estado            VARCHAR(20) GENERATED ALWAYS AS (
                      CASE
                        WHEN cantidad = 0 THEN 'agotado'
                        WHEN cantidad <= cantidad_inicial * 0.3 THEN 'bajo'
                        ELSE 'disponible'
                      END
                    ) STORED
);

CREATE INDEX idx_lotes_insumo     ON lotes_inventario(insumo_id);
CREATE INDEX idx_lotes_ubicacion  ON lotes_inventario(ubicacion_id);
CREATE INDEX idx_lotes_vencimiento ON lotes_inventario(vencimiento);

-- 6. REQUERIMIENTOS (pedidos de producción)
CREATE TABLE requerimientos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero            VARCHAR(20) UNIQUE NOT NULL,
  fecha_solicitud   DATE NOT NULL,
  fecha_registro    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estado            VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'parcial', 'atendido')),
  registrado_por_id UUID NOT NULL REFERENCES usuarios(id)
);

-- 7. INSUMOS SOLICITADOS EN CADA REQUERIMIENTO
CREATE TABLE requerimiento_insumos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requerimiento_id  UUID NOT NULL REFERENCES requerimientos(id) ON DELETE CASCADE,
  insumo_id         UUID NOT NULL REFERENCES insumos(id),
  cantidad          NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
  unidad            VARCHAR(10) NOT NULL,
  atendido          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (atendido >= 0),
  stock_snapshot    NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_req_insumos_requerimiento ON requerimiento_insumos(requerimiento_id);

-- 8. HISTORIAL DE ATENCIONES (despachos parciales)
CREATE TABLE requerimiento_atenciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requerimiento_id  UUID NOT NULL REFERENCES requerimientos(id) ON DELETE CASCADE,
  fecha             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_por_id   UUID NOT NULL REFERENCES usuarios(id),
  detalle           JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_req_atenciones_requerimiento ON requerimiento_atenciones(requerimiento_id);

-- 9. TAREAS ASIGNADAS
CREATE TABLE tareas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asignado_a_id   UUID NOT NULL REFERENCES usuarios(id),
  descripcion     VARCHAR(300) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'completada')),
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tareas_asignado ON tareas(asignado_a_id);

-- 10. ALERTAS ATENDIDAS (stock por debajo del punto de reorden)
CREATE TABLE alertas_atendidas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id       UUID NOT NULL REFERENCES insumos(id),
  fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_por_id UUID NOT NULL REFERENCES usuarios(id)
);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- 120 ubicaciones (4 pasillos × 6 racks × 5 niveles)
INSERT INTO ubicaciones (pasillo, rack, nivel)
SELECT p, r, n
FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS pas(p)
CROSS JOIN generate_series(1, 6) AS ra(r)
CROSS JOIN generate_series(1, 5) AS ni(n);
