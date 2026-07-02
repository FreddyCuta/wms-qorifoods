const { Router } = require("express");
const pool = require("../db");

const router = Router();

// GET /api/usuarios
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/usuarios
router.post("/", async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, activo",
      [nombre, email, password, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    next(err);
  }
});

// PUT /api/usuarios/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, password, rol } = req.body;
    let sql = "UPDATE usuarios SET nombre = $1, rol = $2";
    const params = [nombre, rol];
    let idx = 3;
    if (password) {
      sql += `, password = $${idx++}`;
      params.push(password);
    }
    sql += ` WHERE id = $${idx++} RETURNING id, nombre, email, rol, activo`;
    params.push(id);
    const result = await pool.query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/usuarios/:id/toggle-active
router.patch("/:id/toggle-active", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE usuarios SET activo = NOT activo WHERE id = $1 RETURNING id, nombre, email, rol, activo",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
