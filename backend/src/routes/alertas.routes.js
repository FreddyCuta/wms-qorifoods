const { Router } = require("express");
const pool = require("../db");

const router = Router();

// GET /api/alertas — alertas computadas (stock < punto_reorden)
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id AS insumo_id,
        i.nombre AS insumo,
        i.unidad,
        i.punto_reorden,
        i.lead_time,
        COALESCE(SUM(l.cantidad), 0) AS stock_actual,
        a.id AS atendida_id,
        TO_CHAR(a.fecha, 'DD/MM/YYYY HH24:MI') AS atendida_fecha,
        au.nombre AS atendida_por
      FROM insumos i
      LEFT JOIN lotes_inventario l ON l.insumo_id = i.id
      LEFT JOIN alertas_atendidas a ON a.insumo_id = i.id
      LEFT JOIN usuarios au ON au.id = a.atendido_por_id
      GROUP BY i.id, a.id, au.nombre
      HAVING COALESCE(SUM(l.cantidad), 0) < i.punto_reorden
      ORDER BY i.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/alertas/atender
router.post("/atender", async (req, res, next) => {
  try {
    const { insumo_id, atendido_por_id } = req.body;
    const result = await pool.query(
      "INSERT INTO alertas_atendidas (insumo_id, atendido_por_id) VALUES ($1, $2) RETURNING id, insumo_id, TO_CHAR(fecha, 'DD/MM/YYYY HH24:MI') AS fecha, atendido_por_id",
      [insumo_id, atendido_por_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
