const { Router } = require("express");
const pool = require("../db");

const router = Router();

const TAREA_COLS = `
  t.id, t.asignado_a_id, t.descripcion, t.estado,
  TO_CHAR(t.creada_en, 'DD/MM/YYYY HH24:MI') AS creada_en
`;

// GET /api/tareas
router.get("/", async (req, res, next) => {
  try {
    const { asignado_a_id } = req.query;
    let sql = `SELECT ${TAREA_COLS}, u.nombre AS asignado_a_nombre FROM tareas t JOIN usuarios u ON u.id = t.asignado_a_id`;
    const params = [];
    if (asignado_a_id) {
      sql += " WHERE t.asignado_a_id = $1";
      params.push(asignado_a_id);
    }
    sql += " ORDER BY t.creada_en DESC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/tareas
router.post("/", async (req, res, next) => {
  try {
    const { asignado_a_id, descripcion } = req.body;
    const result = await pool.query(
      "INSERT INTO tareas (asignado_a_id, descripcion) VALUES ($1, $2) RETURNING id",
      [asignado_a_id, descripcion]
    );
    const full = await pool.query(
      `SELECT ${TAREA_COLS}, u.nombre AS asignado_a_nombre FROM tareas t JOIN usuarios u ON u.id = t.asignado_a_id WHERE t.id = $1`,
      [result.rows[0].id]
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tareas/:id/toggle
router.patch("/:id/toggle", async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE tareas SET estado = CASE WHEN estado = 'pendiente' THEN 'completada' ELSE 'pendiente' END WHERE id = $1",
      [id]
    );
    const full = await pool.query(
      `SELECT ${TAREA_COLS}, u.nombre AS asignado_a_nombre FROM tareas t JOIN usuarios u ON u.id = t.asignado_a_id WHERE t.id = $1`,
      [id]
    );
    if (full.rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    res.json(full.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
