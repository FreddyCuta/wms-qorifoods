-- ============================================================================
-- Esquema de Base de Datos — WMS Qori Foods
-- PostgreSQL 15+
-- ============================================================================

-- Eliminar tablas existentes (orden inverso a las dependencias)
DROP TABLE IF EXISTS alertas_atendidas CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS requerimiento_atenciones CASCADE;
DROP TABLE IF EXISTS requerimiento_insumos CASCADE;
DROP TABLE IF EXISTS requerimientos CASCADE;
DROP TABLE IF EXISTS lotes_inventario CASCADE;
DROP TABLE IF EXISTS ubicaciones CASCADE;
DROP TABLE IF EXISTS insumos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP SEQUENCE IF EXISTS lote_codigo_seq CASCADE;

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- 1. USUARIOS
CREATE TABLE usuarios (
  id              SERIAL PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(255) NOT NULL,
  rol             VARCHAR(20) NOT NULL CHECK (rol IN ('jefe', 'supervisor', 'operario')),
  activo          BOOLEAN NOT NULL DEFAULT true
);

-- 2. INSUMOS (catálogo de materias primas)
CREATE TABLE insumos (
  id              SERIAL PRIMARY KEY,
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
  id      SERIAL PRIMARY KEY,
  pasillo CHAR(1) NOT NULL CHECK (pasillo IN ('A', 'B', 'C', 'D')),
  rack    INTEGER NOT NULL CHECK (rack BETWEEN 1 AND 6),
  nivel   INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  UNIQUE (pasillo, rack, nivel)
);

-- 5. LOTES DE INVENTARIO
CREATE TABLE lotes_inventario (
  id                SERIAL PRIMARY KEY,
  insumo_id         INTEGER NOT NULL REFERENCES insumos(id),
  codigo_lote       VARCHAR(20) UNIQUE NOT NULL DEFAULT (
                      'LOT-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
                      || '-' || LPAD(NEXTVAL('lote_codigo_seq')::TEXT, 4, '0')
                    ),
  cantidad          NUMERIC(10,2) NOT NULL CHECK (cantidad >= 0),
  cantidad_inicial  NUMERIC(10,2) NOT NULL CHECK (cantidad_inicial > 0),
  vencimiento       DATE NOT NULL,
  ubicacion_id      INTEGER NOT NULL REFERENCES ubicaciones(id),
  proveedor         VARCHAR(200) NOT NULL,
  fecha_ingreso     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registrado_por_id INTEGER NOT NULL REFERENCES usuarios(id),
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
  id                SERIAL PRIMARY KEY,
  numero            VARCHAR(20) UNIQUE NOT NULL,
  fecha_solicitud   DATE NOT NULL,
  fecha_registro    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estado            VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'parcial', 'atendido')),
  registrado_por_id INTEGER NOT NULL REFERENCES usuarios(id)
);

-- 7. INSUMOS SOLICITADOS EN CADA REQUERIMIENTO
CREATE TABLE requerimiento_insumos (
  id                SERIAL PRIMARY KEY,
  requerimiento_id  INTEGER NOT NULL REFERENCES requerimientos(id) ON DELETE CASCADE,
  insumo_id         INTEGER NOT NULL REFERENCES insumos(id),
  cantidad          NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
  unidad            VARCHAR(10) NOT NULL,
  atendido          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (atendido >= 0),
  stock_snapshot    NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_req_insumos_requerimiento ON requerimiento_insumos(requerimiento_id);

-- 8. HISTORIAL DE ATENCIONES (despachos parciales)
CREATE TABLE requerimiento_atenciones (
  id                SERIAL PRIMARY KEY,
  requerimiento_id  INTEGER NOT NULL REFERENCES requerimientos(id) ON DELETE CASCADE,
  fecha             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_por_id   INTEGER NOT NULL REFERENCES usuarios(id),
  detalle           JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_req_atenciones_requerimiento ON requerimiento_atenciones(requerimiento_id);

-- 9. TAREAS ASIGNADAS
CREATE TABLE tareas (
  id              SERIAL PRIMARY KEY,
  asignado_a_id   INTEGER NOT NULL REFERENCES usuarios(id),
  descripcion     VARCHAR(300) NOT NULL,
  estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'completada')),
  creada_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tareas_asignado ON tareas(asignado_a_id);

-- 10. ALERTAS ATENDIDAS (stock por debajo del punto de reorden)
CREATE TABLE alertas_atendidas (
  id              SERIAL PRIMARY KEY,
  insumo_id       INTEGER NOT NULL REFERENCES insumos(id),
  fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atendido_por_id INTEGER NOT NULL REFERENCES usuarios(id)
);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- 3 usuarios (uno por rol)
INSERT INTO usuarios (id, nombre, email, password, rol, activo) VALUES
(1, 'María Flores', 'maria@qorifoods.com', 'jefe123', 'jefe', true),
(2, 'Pedro Salas', 'pedro@qorifoods.com', 'super123', 'supervisor', true),
(3, 'Carlos Quispe', 'carlos@qorifoods.com', 'operario123', 'operario', true);

-- 10 insumos del catálogo
INSERT INTO insumos (id, nombre, proveedor, unidad, punto_reorden, lead_time) VALUES
(1, 'Sémola de trigo',      'Molinos del Norte SAC',    'kg', 100, 5),
(2, 'Harina de trigo',      'Industrias Unidas SAC',    'kg',  80, 3),
(3, 'Aceite vegetal',       'Distribuidora Lima SAC',   'L',   20, 7),
(4, 'Sal yodada',           'Salinera Perú SAC',        'kg',  50, 5),
(5, 'Huevos deshidratados', 'Avícola Andina SAC',       'kg', 200, 6),
(6, 'Quinua orgánica',      'Andes Orgánicos SAC',      'kg', 150, 7),
(7, 'Azúcar refinada',      'Azucarera del Centro SAC', 'kg', 100, 4),
(8, 'Leche en polvo',       'Gloria SA',                'kg',  50, 7),
(9, 'Manteca vegetal',      'Industrias Unidas SAC',    'kg',  30, 5),
(10,'Cacao en polvo',       'Cacao del Perú SAC',       'kg',  40, 6);

-- 120 ubicaciones (4 pasillos × 6 racks × 5 niveles)
INSERT INTO ubicaciones (pasillo, rack, nivel)
SELECT p, r, n
FROM (VALUES ('A'), ('B'), ('C'), ('D')) AS pas(p)
CROSS JOIN generate_series(1, 6) AS ra(r)
CROSS JOIN generate_series(1, 5) AS ni(n);

-- Lotes de inventario (20 lotes con distintos estados y fechas de vencimiento)
INSERT INTO lotes_inventario (insumo_id, codigo_lote, cantidad, cantidad_inicial, vencimiento, ubicacion_id, proveedor, fecha_ingreso, registrado_por_id)
SELECT
  i.id,
  datos.codigo,
  datos.cantidad,
  datos.cantidad_inicial,
  datos.vencimiento::date,
  u.id,
  datos.proveedor,
  datos.fecha_ingreso::timestamptz,
  datos.registrado_por_id
FROM (
  VALUES
    ('Sémola de trigo',      'LOT-2026-0018', 700,  1200, '2026-08-15', 'A', 2, 1, 'Molinos del Norte SAC',    '2026-02-10 08:00:00', 2),
    ('Harina de trigo',      'LOT-2026-0021', 120,   500, '2026-07-10', 'B', 1, 3, 'Industrias Unidas SAC',    '2026-03-05 09:30:00', 2),
    ('Aceite vegetal',       'LOT-2026-0009',  30,    80, '2026-06-22', 'C', 3, 2, 'Distribuidora Lima SAC',   '2026-01-15 10:00:00', 2),
    ('Sal yodada',           'LOT-2026-0031',   0,   300, '2026-12-30', 'A', 1, 1, 'Salinera Perú SAC',        '2026-01-20 11:15:00', 2),
    ('Huevos deshidratados', 'LOT-2026-0027', 850,  1000, '2026-09-20', 'D', 2, 1, 'Avícola Andina SAC',       '2026-02-28 07:45:00', 3),
    ('Sémola de trigo',      'LOT-2026-0015', 200,   600, '2026-06-09', 'A', 3, 2, 'Molinos del Norte SAC',    '2026-01-02 08:20:00', 2),
    ('Quinua orgánica',      'LOT-2026-0035', 400,   800, '2026-11-20', 'D', 1, 1, 'Andes Orgánicos SAC',      '2026-04-15 09:00:00', 3),
    ('Harina de trigo',      'LOT-2026-0038', 250,   400, '2026-08-05', 'B', 2, 2, 'Industrias Unidas SAC',    '2026-04-20 10:30:00', 2),
    ('Sémola de trigo',      'LOT-2026-0042', 500,   500, '2026-10-10', 'C', 1, 1, 'Molinos del Norte SAC',    '2026-05-01 08:00:00', 3),
    ('Aceite vegetal',       'LOT-2026-0045',  15,    40, '2026-07-18', 'D', 3, 2, 'Distribuidora Lima SAC',   '2026-05-10 09:00:00', 2),
    ('Huevos deshidratados', 'LOT-2026-0048', 600,   600, '2026-12-25', 'D', 6, 1, 'Avícola Andina SAC',       '2026-05-12 11:00:00', 3),
    ('Sal yodada',           'LOT-2026-0050',  80,   200, '2026-09-30', 'D', 6, 3, 'Salinera Perú SAC',        '2026-05-18 08:30:00', 2),
    ('Quinua orgánica',      'LOT-2026-0053', 120,   300, '2026-11-15', 'D', 5, 2, 'Andes Orgánicos SAC',      '2026-05-25 09:15:00', 3),
    ('Sémola de trigo',      'LOT-2026-0056', 350,   350, '2026-12-22', 'D', 4, 1, 'Molinos del Norte SAC',    '2026-06-01 07:45:00', 2),
    ('Sémola de trigo',      'LOT-2026-0059', 280,   400, '2026-12-28', 'D', 6, 2, 'Molinos del Norte SAC',    '2026-06-05 08:00:00', 3),
    ('Harina de trigo',      'LOT-2026-0062', 180,   300, '2026-09-15', 'D', 2, 3, 'Industrias Unidas SAC',    '2026-06-08 09:30:00', 2),
    ('Aceite vegetal',       'LOT-2026-0065',  25,    50, '2026-08-10', 'A', 5, 2, 'Distribuidora Lima SAC',   '2026-06-10 10:00:00', 3),
    ('Sal yodada',           'LOT-2026-0068', 100,   250, '2027-01-05', 'C', 5, 1, 'Salinera Perú SAC',        '2026-06-12 08:15:00', 2),
    ('Huevos deshidratados', 'LOT-2026-0071', 450,   500, '2027-01-30', 'B', 4, 4, 'Avícola Andina SAC',       '2026-06-15 11:00:00', 3),
    ('Quinua orgánica',      'LOT-2026-0074', 200,   350, '2026-12-20', 'D', 3, 5, 'Andes Orgánicos SAC',      '2026-06-18 08:30:00', 2),
    ('Azúcar refinada',      'LOT-2026-0077', 600,   600, '2026-11-30', 'A', 4, 3, 'Azucarera del Centro SAC', '2026-06-20 08:00:00', 3),
    ('Leche en polvo',       'LOT-2026-0080', 350,   350, '2026-10-15', 'B', 5, 2, 'Gloria SA',                '2026-06-22 09:00:00', 2),
    ('Manteca vegetal',      'LOT-2026-0083',  80,   200, '2026-12-10', 'C', 4, 1, 'Industrias Unidas SAC',    '2026-06-25 10:30:00', 3),
    ('Cacao en polvo',       'LOT-2026-0086', 120,   120, '2027-02-28', 'D', 4, 2, 'Cacao del Perú SAC',       '2026-06-28 07:45:00', 2),
    ('Azúcar refinada',      'LOT-2026-0089', 250,   500, '2027-01-15', 'A', 5, 1, 'Azucarera del Centro SAC', '2026-07-01 08:15:00', 3),
    ('Leche en polvo',       'LOT-2026-0092', 180,   180, '2026-12-01', 'B', 3, 4, 'Gloria SA',                '2026-07-02 09:30:00', 2),
    ('Sémola de trigo',      'LOT-2026-0095', 150,   300, '2026-11-20', 'D', 5, 1, 'Molinos del Norte SAC',    '2026-07-03 08:00:00', 3),
    ('Aceite vegetal',       'LOT-2026-0098',  40,    60, '2026-09-10', 'C', 6, 3, 'Distribuidora Lima SAC',   '2026-07-04 10:00:00', 2),
    ('Quinua orgánica',      'LOT-2026-0101', 300,   300, '2027-03-15', 'A', 3, 5, 'Andes Orgánicos SAC',      '2026-07-05 07:30:00', 3),
    ('Harina de trigo',      'LOT-2026-0104', 100,   100, '2026-10-30', 'B', 6, 1, 'Industrias Unidas SAC',    '2026-07-06 09:00:00', 2)
) AS datos(nombre, codigo, cantidad, cantidad_inicial, vencimiento, pasillo, rack, nivel, proveedor, fecha_ingreso, registrado_por_id)
JOIN insumos i ON i.nombre = datos.nombre
JOIN ubicaciones u ON u.pasillo = datos.pasillo AND u.rack = datos.rack AND u.nivel = datos.nivel;

-- Requerimientos de producción
INSERT INTO requerimientos (numero, fecha_solicitud, fecha_registro, estado, registrado_por_id)
SELECT datos.numero, datos.fecha_solicitud, datos.fecha_registro, datos.estado, u.id
FROM (
  VALUES
    ('REQ-047', '2026-06-05'::date, '2026-06-05 08:30:00'::timestamptz, 'pendiente', 3),
    ('REQ-046', '2026-06-04'::date, '2026-06-04 14:15:00'::timestamptz, 'parcial',   3),
    ('REQ-045', '2026-06-03'::date, '2026-06-03 09:00:00'::timestamptz, 'atendido',  2),
    ('REQ-044', '2026-06-02'::date, '2026-06-02 11:20:00'::timestamptz, 'atendido',  3),
    ('REQ-048', '2026-06-28'::date, '2026-06-28 10:00:00'::timestamptz, 'pendiente', 2),
    ('REQ-049', '2026-07-01'::date, '2026-07-01 08:45:00'::timestamptz, 'pendiente', 3),
    ('REQ-050', '2026-07-02'::date, '2026-07-02 07:30:00'::timestamptz, 'atendido',  2)
) AS datos(numero, fecha_solicitud, fecha_registro, estado, registrado_por_id)
JOIN usuarios u ON u.id = datos.registrado_por_id;

-- Insumos solicitados en cada requerimiento
INSERT INTO requerimiento_insumos (requerimiento_id, insumo_id, cantidad, unidad, atendido, stock_snapshot)
SELECT r.id, i.id, datos.cantidad, datos.unidad, datos.atendido, datos.stock
FROM (
  VALUES
    ('REQ-047', 1, 500, 'kg',   0,   900),
    ('REQ-047', 2, 300, 'kg',   0,   120),
    ('REQ-047', 3,  50, 'L',    0,    30),
    ('REQ-046', 6, 200, 'kg',  50,     0),
    ('REQ-046', 4,  80, 'kg',   0,     0),
    ('REQ-045', 1, 300, 'kg', 300,   900),
    ('REQ-045', 2, 150, 'kg', 150,   120),
    ('REQ-045', 5, 100, 'kg', 100,   850),
    ('REQ-045', 3,  20, 'L',   20,    30),
    ('REQ-044', 4,  40, 'kg',  40,     0),
    ('REQ-048', 7, 400, 'kg',   0,   850),
    ('REQ-048', 8, 150, 'kg',   0,   530),
    ('REQ-048', 9,  80, 'kg',   0,    80),
    ('REQ-049', 1, 200, 'kg',   0,  1050),
    ('REQ-049', 3,  30, 'L',    0,    55),
    ('REQ-049', 6, 100, 'kg',   0,   600),
    ('REQ-050', 7, 200, 'kg', 200,   850),
    ('REQ-050', 2, 250, 'kg', 250,   250),
    ('REQ-050', 5, 150, 'kg', 150,  1050)
) AS datos(numero, insumo_id, cantidad, unidad, atendido, stock)
JOIN requerimientos r ON r.numero = datos.numero
JOIN insumos i ON i.id = datos.insumo_id;

-- Atenciones realizadas en requerimientos
INSERT INTO requerimiento_atenciones (requerimiento_id, fecha, atendido_por_id, detalle)
SELECT r.id, datos.fecha, datos.atendido_por_id, datos.detalle::jsonb
FROM (
  VALUES
    ('REQ-046', '2026-06-05 10:15:00'::timestamptz, 3, '{"Quinua orgánica": 50}'::jsonb),
    ('REQ-045', '2026-06-03 11:30:00'::timestamptz, 2, '{"Sémola de trigo": 300, "Harina de trigo": 150, "Huevos deshidratados": 100, "Aceite vegetal": 20}'::jsonb),
    ('REQ-044', '2026-06-02 14:00:00'::timestamptz, 3, '{"Sal yodada": 40}'::jsonb),
    ('REQ-050', '2026-07-02 10:30:00'::timestamptz, 3, '{"Azúcar refinada": 200, "Harina de trigo": 250, "Huevos deshidratados": 150}'::jsonb)
) AS datos(numero, fecha, atendido_por_id, detalle)
JOIN requerimientos r ON r.numero = datos.numero;

-- Alertas atendidas (historial de reabastecimiento)
INSERT INTO alertas_atendidas (insumo_id, fecha, atendido_por_id)
SELECT datos.insumo_id, datos.fecha, datos.atendido_por_id
FROM (
  VALUES
    (4, '2026-06-20 09:00:00'::timestamptz, 2),
    (6, '2026-06-25 14:30:00'::timestamptz, 2)
) AS datos(insumo_id, fecha, atendido_por_id);

-- Tareas asignadas
INSERT INTO tareas (asignado_a_id, descripcion, estado, creada_en)
SELECT datos.asignado_a_id, datos.descripcion, datos.estado, datos.creada_en
FROM (
  VALUES
    (3, 'Verificar el ingreso del lote LOT-2026-0041 en Rack 3 – Nivel 2', 'pendiente',  '2026-07-02 09:15:00'::timestamptz),
    (3, 'Registrar el ingreso del lote LOT-2026-0048 en Rack 2',            'pendiente',  '2026-07-02 09:15:00'::timestamptz),
    (3, 'Reubicar el lote LOT-2026-0033 al Pasillo B',                      'completada', '2026-07-01 16:40:00'::timestamptz),
    (1, 'Revisar el inventario de insumos próximos a vencer',                'pendiente',  '2026-07-02 08:00:00'::timestamptz),
    (2, 'Supervisar el despacho del requerimiento REQ-046',                  'completada', '2026-07-01 16:30:00'::timestamptz),
    (3, 'Despachar insumos del requerimiento REQ-048',                       'pendiente',  '2026-07-02 10:00:00'::timestamptz),
    (1, 'Aprobar compra de insumos críticos',                                'pendiente',  '2026-07-02 10:30:00'::timestamptz),
    (2, 'Realizar conteo cíclico del pasillo D',                             'pendiente',  '2026-07-02 11:00:00'::timestamptz),
    (3, 'Etiquetar lotes próximos a vencer (julio 2026)',                    'pendiente',  '2026-07-02 11:30:00'::timestamptz),
    (2, 'Generar reporte semanal de inventario',                             'completada', '2026-07-01 17:00:00'::timestamptz)
) AS datos(asignado_a_id, descripcion, estado, creada_en);
