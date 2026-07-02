const { Router } = require("express");
const pool = require("../db");

const router = Router();

const REQ_COLS = `
  r.id, r.numero,
  TO_CHAR(r.fecha_solicitud, 'DD/MM/YYYY') AS fecha_solicitud,
  TO_CHAR(r.fecha_registro, 'DD/MM/YYYY HH24:MI') AS fecha_registro,
  r.estado, r.registrado_por_id
`;

const INSUMOS_SUBQUERY = `(
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', ri.id,
    'insumo_id', ri.insumo_id,
    'insumo', i.nombre,
    'unidad', ri.unidad,
    'cantidad', ri.cantidad,
    'atendido', ri.atendido,
    'stock_snapshot', ri.stock_snapshot
  ) ORDER BY ri.id), '[]'::jsonb)
  FROM requerimiento_insumos ri
  JOIN insumos i ON i.id = ri.insumo_id
  WHERE ri.requerimiento_id = r.id
) AS insumos`;

const ATENCIONES_SUBQUERY = `(
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', ra.id,
    'fecha', TO_CHAR(ra.fecha, 'DD/MM/YYYY HH24:MI'),
    'atendido_por_id', ra.atendido_por_id,
    'por', au.nombre,
    'detalle', ra.detalle
  ) ORDER BY ra.fecha), '[]'::jsonb)
  FROM requerimiento_atenciones ra
  JOIN usuarios au ON au.id = ra.atendido_por_id
  WHERE ra.requerimiento_id = r.id
) AS atenciones`;

// GET /api/requerimientos
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT ${REQ_COLS},
             u.nombre AS registrado_por_nombre,
             ${INSUMOS_SUBQUERY},
             ${ATENCIONES_SUBQUERY}
      FROM requerimientos r
      JOIN usuarios u ON u.id = r.registrado_por_id
      ORDER BY r.fecha_registro DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/requerimientos/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqResult = await pool.query(`
      SELECT ${REQ_COLS},
             u.nombre AS registrado_por_nombre
      FROM requerimientos r
      JOIN usuarios u ON u.id = r.registrado_por_id
      WHERE r.id = $1
    `, [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: "Requerimiento no encontrado" });
    }
    const insumosResult = await pool.query(`
      SELECT ri.*, i.nombre AS insumo
      FROM requerimiento_insumos ri
      JOIN insumos i ON i.id = ri.insumo_id
      WHERE ri.requerimiento_id = $1
      ORDER BY ri.id
    `, [id]);
    const atencionesResult = await pool.query(`
      SELECT ra.id, ra.requerimiento_id, TO_CHAR(ra.fecha, 'DD/MM/YYYY HH24:MI') AS fecha,
             ra.atendido_por_id, ra.detalle, u.nombre AS por
      FROM requerimiento_atenciones ra
      JOIN usuarios u ON u.id = ra.atendido_por_id
      WHERE ra.requerimiento_id = $1
      ORDER BY ra.fecha
    `, [id]);
    res.json({ ...reqResult.rows[0], insumos: insumosResult.rows, atenciones: atencionesResult.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/requerimientos
router.post("/", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { numero, fecha_solicitud, registrado_por_id, insumos } = req.body;
    await client.query("BEGIN");
    const reqResult = await client.query(
      "INSERT INTO requerimientos (numero, fecha_solicitud, registrado_por_id) VALUES ($1, $2, $3) RETURNING id",
      [numero, fecha_solicitud, registrado_por_id]
    );
    const requerimientoId = reqResult.rows[0].id;
    for (const item of insumos) {
      await client.query(
        "INSERT INTO requerimiento_insumos (requerimiento_id, insumo_id, cantidad, unidad, stock_snapshot) VALUES ($1, $2, $3, $4, $5)",
        [requerimientoId, item.insumo_id, item.cantidad, item.unidad, item.stock_snapshot || 0]
      );
    }
    await client.query("COMMIT");
    const full = await pool.query(`
      SELECT ${REQ_COLS},
             u.nombre AS registrado_por_nombre,
             ${INSUMOS_SUBQUERY},
             '[]'::jsonb AS atenciones
      FROM requerimientos r
      JOIN usuarios u ON u.id = r.registrado_por_id
      WHERE r.id = $1
    `, [requerimientoId]);
    res.status(201).json(full.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/requerimientos/:id/atender
router.post("/:id/atender", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { salidas, atendido_por_id } = req.body;

    await client.query("BEGIN");

    const reqActual = await client.query(
      "SELECT * FROM requerimientos WHERE id = $1 FOR UPDATE", [id]
    );
    if (reqActual.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Requerimiento no encontrado" });
    }

    const detalle = {};
    for (const salida of salidas) {
      const { insumo_id, cantidad } = salida;

      const ins = await client.query("SELECT nombre FROM insumos WHERE id = $1", [insumo_id]);
      const insumoNombre = ins.rows[0]?.nombre || insumo_id;

      const lotes = await client.query(`
        SELECT id, cantidad FROM lotes_inventario
        WHERE insumo_id = $1 AND cantidad > 0
        ORDER BY vencimiento ASC
        FOR UPDATE
      `, [insumo_id]);

      let pendiente = cantidad;
      for (const lote of lotes.rows) {
        if (pendiente <= 0) break;
        const tomar = Math.min(lote.cantidad, pendiente);
        await client.query(
          "UPDATE lotes_inventario SET cantidad = cantidad - $1 WHERE id = $2",
          [tomar, lote.id]
        );
        pendiente -= tomar;
      }

      await client.query(
        "UPDATE requerimiento_insumos SET atendido = atendido + $1 WHERE requerimiento_id = $2 AND insumo_id = $3",
        [cantidad, id, insumo_id]
      );

      detalle[insumoNombre] = cantidad;
    }

    await client.query(
      "INSERT INTO requerimiento_atenciones (requerimiento_id, atendido_por_id, detalle) VALUES ($1, $2, $3)",
      [id, atendido_por_id, JSON.stringify(detalle)]
    );

    const insumosReq = await client.query(
      "SELECT cantidad, atendido FROM requerimiento_insumos WHERE requerimiento_id = $1",
      [id]
    );
    const allComplete = insumosReq.rows.every(r => Number(r.atendido) >= Number(r.cantidad));
    const anyProgress = insumosReq.rows.some(r => Number(r.atendido) > 0);
    const nuevoEstado = allComplete ? "atendido" : anyProgress ? "parcial" : "pendiente";
    await client.query(
      "UPDATE requerimientos SET estado = $1 WHERE id = $2",
      [nuevoEstado, id]
    );

    await client.query("COMMIT");
    res.json({ mensaje: "Salidas registradas", estado: nuevoEstado });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
