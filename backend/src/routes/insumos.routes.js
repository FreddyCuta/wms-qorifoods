const { Router } = require("express");
const pool = require("../db");

const router = Router();

// GET /api/insumos
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM insumos ORDER BY nombre");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/insumos
router.post("/", async (req, res, next) => {
  try {
    const { nombre, proveedor, unidad, punto_reorden, lead_time } = req.body;
    const result = await pool.query(
      "INSERT INTO insumos (nombre, proveedor, unidad, punto_reorden, lead_time) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, proveedor, unidad, punto_reorden, lead_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/insumos/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, proveedor, unidad, punto_reorden, lead_time } = req.body;
    const result = await pool.query(
      "UPDATE insumos SET nombre = $1, proveedor = $2, unidad = $3, punto_reorden = $4, lead_time = $5 WHERE id = $6 RETURNING *",
      [nombre, proveedor, unidad, punto_reorden, lead_time, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Insumo no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
