const { Router } = require("express");
const pool = require("../db");

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const user = result.rows[0];
    if (!user.activo) {
      return res.status(403).json({ error: "Usuario inactivo" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
