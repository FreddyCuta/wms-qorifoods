const { Router } = require("express");
const pool = require("../db");

const router = Router();

// GET /api/dashboard
router.get("/", async (req, res, next) => {
  try {
    const insumosCount = await pool.query("SELECT COUNT(*)::int AS count FROM insumos");
    const lotesActivos = await pool.query("SELECT COUNT(*)::int AS count FROM lotes_inventario WHERE cantidad > 0");
    const stockCritico = await pool.query(`
      SELECT COUNT(*)::int AS count FROM (
        SELECT i.id
        FROM insumos i
        LEFT JOIN lotes_inventario l ON l.insumo_id = i.id
        GROUP BY i.id
        HAVING COALESCE(SUM(l.cantidad), 0) < i.punto_reorden
      ) sub
    `);
    const reqsPendientes = await pool.query("SELECT COUNT(*)::int AS count FROM requerimientos WHERE estado = 'pendiente'");
    const alertasActivas = await pool.query(`
      SELECT COUNT(*)::int AS count FROM (
        SELECT i.id
        FROM insumos i
        LEFT JOIN lotes_inventario l ON l.insumo_id = i.id
        LEFT JOIN alertas_atendidas a ON a.insumo_id = i.id
        GROUP BY i.id
        HAVING COALESCE(SUM(l.cantidad), 0) < i.punto_reorden AND COUNT(a.id) = 0
      ) sub
    `);

    res.json({
      insumosRegistrados: insumosCount.rows[0].count,
      lotesActivosCount: lotesActivos.rows[0].count,
      stockCritico: stockCritico.rows[0].count,
      reqsPendientes: reqsPendientes.rows[0].count,
      alertasActivas: alertasActivas.rows[0].count,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
