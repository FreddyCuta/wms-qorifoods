const { Router } = require("express");
const pool = require("../db");

const router = Router();

const LOTES_COLS = `
  l.id, l.insumo_id, l.codigo_lote, l.cantidad, l.cantidad_inicial,
  TO_CHAR(l.vencimiento, 'DD/MM/YYYY') AS vencimiento,
  l.ubicacion_id, l.proveedor,
  TO_CHAR(l.fecha_ingreso, 'DD/MM/YYYY HH24:MI') AS fecha_ingreso,
  l.registrado_por_id, l.estado
`;

// GET /api/lotes
router.get("/", async (req, res, next) => {
  try {
    const { insumo_id, pasillo, rack, nivel, estado } = req.query;
    let sql = `
      SELECT ${LOTES_COLS},
             u.pasillo, u.rack, u.nivel,
             i.nombre AS insumo, i.unidad,
             us.nombre AS registrado_por_nombre
      FROM lotes_inventario l
      JOIN ubicaciones u ON u.id = l.ubicacion_id
      JOIN insumos i ON i.id = l.insumo_id
      JOIN usuarios us ON us.id = l.registrado_por_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (insumo_id) { sql += ` AND l.insumo_id = $${idx++}`; params.push(insumo_id); }
    if (pasillo)   { sql += ` AND u.pasillo = $${idx++}`; params.push(pasillo); }
    if (rack)      { sql += ` AND u.rack = $${idx++}`; params.push(parseInt(rack)); }
    if (nivel)     { sql += ` AND u.nivel = $${idx++}`; params.push(parseInt(nivel)); }
    if (estado)    { sql += ` AND l.estado = $${idx++}`; params.push(estado); }
    sql += " ORDER BY l.fecha_ingreso DESC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/lotes
router.post("/", async (req, res, next) => {
  try {
    const { insumo_id, cantidad, vencimiento, ubicacion_id, proveedor, registrado_por_id } = req.body;
    const result = await pool.query(
      `INSERT INTO lotes_inventario (insumo_id, cantidad, cantidad_inicial, vencimiento, ubicacion_id, proveedor, registrado_por_id)
       VALUES ($1, $2, $2, $3, $4, $5, $6) RETURNING id`,
      [insumo_id, cantidad, vencimiento, ubicacion_id, proveedor, registrado_por_id]
    );
    const full = await pool.query(`
      SELECT ${LOTES_COLS},
             u.pasillo, u.rack, u.nivel,
             i.nombre AS insumo, i.unidad,
             us.nombre AS registrado_por_nombre
      FROM lotes_inventario l
      JOIN ubicaciones u ON u.id = l.ubicacion_id
      JOIN insumos i ON i.id = l.insumo_id
      JOIN usuarios us ON us.id = l.registrado_por_id
      WHERE l.id = $1
    `, [result.rows[0].id]);
    res.status(201).json(full.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
