const { Router } = require("express");
const pool = require("../db");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, pasillo, rack, nivel FROM ubicaciones ORDER BY pasillo, rack, nivel"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
