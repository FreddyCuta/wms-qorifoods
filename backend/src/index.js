const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const errorHandler = require("./middleware/error-handler");

// Rutas
const authRoutes = require("./routes/auth.routes");
const insumosRoutes = require("./routes/insumos.routes");
const lotesRoutes = require("./routes/lotes.routes");
const requerimientosRoutes = require("./routes/requerimientos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const tareasRoutes = require("./routes/tareas.routes");
const alertasRoutes = require("./routes/alertas.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const ubicacionesRoutes = require("./routes/ubicaciones.routes");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/i.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({
      message: "WMS Qori Foods API funcionando",
      db: "conectada",
      serverTime: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      message: "WMS Qori Foods API funcionando",
      db: "error de conexión",
      error: err.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/insumos", insumosRoutes);
app.use("/api/lotes", lotesRoutes);
app.use("/api/requerimientos", requerimientosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
