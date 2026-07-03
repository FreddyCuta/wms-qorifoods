# Manual Técnico del Sistema

## WMS Qori Foods — Sistema de Gestión de Almacén de Insumos

| | |
|---|---|
| **Nombre del sistema** | WMS Qori Foods — Almacén de Insumos |
| **Versión** | 1.0.0 |
| **Fecha** | Julio 2026 |
| **Equipo desarrollador** | [Nombre del equipo] |

---

## 1. Introducción

### Objetivo del manual

Este manual técnico está dirigido a desarrolladores, administradores de sistemas y personal de TI encargado de la instalación, configuración, mantenimiento y evolución del sistema WMS Qori Foods. Describe la arquitectura, las tecnologías empleadas, la estructura del código, la base de datos, la API REST y los procedimientos operativos.

### Audiencia técnica

- Desarrolladores frontend y backend.
- Administradores de bases de datos.
- DevOps y personal de infraestructura.
- Estudiantes de ingeniería de software.

### Alcance del sistema

WMS Qori Foods es un sistema web de gestión de almacenes (WMS) para el control de materias primas. Sus funciones principales son:

- Registro de ingreso de lotes de insumos.
- Gestión de requerimientos de producción (alta, atención parcial con FEFO, historial).
- Consulta de inventario en tiempo real con filtros multidimensionales.
- Visualización 3D del almacén con navegación por teclado y ratón.
- Dashboard ejecutivo con indicadores KPI calculados desde la BD.
- Gestión de usuarios, roles y permisos.
- Asignación de tareas al personal.
- Alertas automáticas de stock bajo (cálculo dinámico contra punto de reorden).

---

## 2. Arquitectura del Sistema

### Diagrama de arquitectura general

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador Web)                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                  Frontend (React + Vite)                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │  Pages   │ │Components│ │  3D      │ │  State (Context) │  │  │
│  │  │(Router)  │ │  (UI)    │ │(Three.js)│ │  + Store         │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │  │
│  │                     │                                           │  │
│  │              ┌──────▼──────┐                                    │  │
│  │              │  Axios HTTP │── ── ── ── ── ── ── ── ── ─┐     │  │
│  │              └─────────────┘                               │     │  │
│  └────────────────────────────────────────────────────────────┘     │  │
└──────────────────────────────────────────────────────────────────┼──┘  │
                                                                   │     │
┌──────────────────────────────────────────────────────────────────▼──┐  │
│                    SERVIDOR (Express + Node.js)                      │  │
│  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │              Backend (API REST — 9 módulos de rutas)           │  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐     │  │  │
│  │  │  Auth    │ │ Insumos  │ │  Lotes   │ │ Requerimientos│     │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘     │  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐     │  │  │
│  │  │Usuarios  │ │  Tareas  │ │ Alertas  │ │ Dashboard     │     │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────┘     │  │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │  │
│  │  │              Ubicaciones                               │   │  │  │
│  │  └────────────────────────────────────────────────────────┘   │  │  │
│  │                     │                                           │  │  │
│  │              ┌──────▼──────┐                                    │  │  │
│  │              │  PostgreSQL  │──────── DATABASE_URL ────────────│  │  │
│  │              │  (pg Pool)   │                                    │  │  │
│  │              └─────────────┘                                    │  │  │
│  └────────────────────────────────────────────────────────────────┘  │  │
└──────────────────────────────────────────────────────────────────────┘  │
```

### Componentes principales

| Componente | Tecnología | Descripción |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Interfaz de usuario SPA (Single Page Application). |
| **Estado** | React Context | Gestión de estado global con `useState` + `useCallback`. |
| **3D** | Three.js + R3F + Drei | Visualización tridimensional del almacén. |
| **API Client** | Axios | Cliente HTTP con interceptor de transformación snake_case↔camelCase. |
| **Backend** | Node.js + Express 5 | API REST con 9 módulos de rutas y middleware de errores. |
| **Base de datos** | PostgreSQL 15+ | Motor relacional con `pg` (node-postgres) Pool connection. |

### Tecnologías utilizadas

| Categoría | Tecnología | Versión |
|---|---|---|
| Lenguaje (Frontend) | JavaScript (ES2022+) | — |
| UI Framework | React | ^19.2.6 |
| Router | React Router DOM | ^7.17.0 |
| Build Tool | Vite | ^8.0.12 |
| CSS Framework | Tailwind CSS | ^4.3.0 |
| 3D Engine | Three.js | ^0.184.0 |
| React 3D | @react-three/fiber | ^9.6.1 |
| Drei (helpers) | @react-three/drei | ^10.7.7 |
| Iconos | Lucide React | ^1.17.0 |
| Utilidades CSS | clsx + tailwind-merge | ^2.1.1 / ^3.6.0 |
| HTTP Client | Axios | ^1.17.0 |
| Animaciones CSS | tw-animate-css | ^1.4.0 |
| **Lenguaje (Backend)** | **Node.js (CommonJS)** | **20.x LTS** |
| **Framework Backend** | **Express** | **^5.2.1** |
| **Cliente PostgreSQL** | **pg (node-postgres)** | **^8.21.0** |
| **CORS** | **cors** | **^2.8.6** |
| **Variables de entorno** | **dotenv** | **^17.4.2** |
| **Dev Server (Backend)** | **nodemon** | **^3.1.14** |
| Base de datos | PostgreSQL | 15+ |
| Linter | ESLint | ^10.3.0 |

---

## 3. Instalación del Sistema

### Requisitos del servidor (desarrollo)

| Componente | Especificación mínima |
|---|---|
| Procesador | 2.0 GHz dual-core |
| Memoria RAM | 8 GB |
| Espacio en disco | 2 GB |
| Node.js | 20.x LTS o superior |
| npm | 10.x o superior |
| Git | 2.x |
| PostgreSQL | 15+ |
| Navegador | Chrome 120+, Firefox 120+, Edge 120+ |

### Dependencias y librerías necesarias

- **Node.js + npm**: Plataforma de ejecución y gestor de paquetes.
- **Git**: Control de versiones.
- **PostgreSQL 15+**: Motor de base de datos relacional.
- **pgAdmin** (opcional): Cliente gráfico para administrar la BD.

### Pasos para la instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd wms-qorifoods

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Instalar dependencias del backend
cd ../backend
npm install

# 4. Configurar base de datos PostgreSQL
#    - Crear la base de datos "wms_db"
#    - Editar backend/.env con sus credenciales:
#      PORT=3000
#      DATABASE_URL=postgresql://usuario:password@localhost:5432/wms_db

# 5. Ejecutar el script de base de datos
psql -U postgres -d wms_db -f ../database/db.sql

# 6. Iniciar el backend (en una terminal)
npm run dev
#    Servidor en http://localhost:3000

# 7. Iniciar el frontend (en otra terminal)
cd ../frontend
npm run dev
#    Servidor en http://localhost:5173
```

### Variables de entorno (backend/.env)

```
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/wms_db
```

### Build de producción

```bash
cd frontend
npm run build
npm run preview
```

---

## 4. Configuración del Entorno de Desarrollo

### Herramientas necesarias

| Herramienta | Propósito |
|---|---|
| VS Code | IDE recomendado |
| ESLint | Linter de código (incluido en frontend) |
| React DevTools | Depuración de componentes React |
| Three.js DevTools | Depuración de escenas 3D (opcional) |
| PostgreSQL / pgAdmin | Cliente de base de datos |
| Postman / Insomnia | Pruebas de API REST (opcional) |
| nodemon | Recarga automática del backend en desarrollo |

### Estructura de carpetas del proyecto

```
wms-qorifoods/
│
├── database/
│   └── db.sql                         # DDL completo (10 tablas + secuencias + seed data)
│
├── backend/                           # API REST
│   ├── .env                           # Configuración (PORT, DATABASE_URL)
│   ├── package.json
│   └── src/
│       ├── index.js                   # Entry point del servidor Express
│       ├── db.js                      # Pool de conexión PostgreSQL
│       ├── middleware/
│       │   └── error-handler.js       # Manejador global de errores
│       └── routes/                    # 9 módulos de rutas
│           ├── auth.routes.js
│           ├── insumos.routes.js
│           ├── lotes.routes.js
│           ├── requerimientos.routes.js
│           ├── usuarios.routes.js
│           ├── tareas.routes.js
│           ├── alertas.routes.js
│           ├── dashboard.routes.js
│           └── ubicaciones.routes.js
│
├── frontend/                          # Aplicación frontend SPA
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── images/
│   │       └── LOGO-QORI.png
│   ├── src/
│   │   ├── main.jsx                   # Entry point React
│   │   ├── App.jsx                    # Router + Provider
│   │   ├── index.css                  # Tailwind v4 theme + tokens
│   │   ├── images/LOGO-QORI.png
│   │   ├── lib/                       # Lógica compartida
│   │   │   ├── api.js                 # Cliente Axios + 18 funciones API
│   │   │   ├── data.js                # Datos semilla (fallback)
│   │   │   ├── store.jsx              # Estado global (Context API)
│   │   │   ├── nav.js                 # Navegación por rol
│   │   │   ├── types.js               # Constantes de roles
│   │   │   └── utils.js               # Utilidades (formatos, fechas)
│   │   ├── pages/                     # 13 páginas (rutas)
│   │   │   ├── login.jsx
│   │   │   ├── inicio.jsx
│   │   │   ├── ingreso.jsx
│   │   │   ├── inventario.jsx
│   │   │   ├── requerimientos.jsx
│   │   │   ├── nuevo-requerimiento.jsx
│   │   │   ├── atender-requerimiento.jsx
│   │   │   ├── alertas.jsx
│   │   │   ├── usuarios.jsx
│   │   │   ├── responsabilidades.jsx
│   │   │   ├── insumos-registro.jsx
│   │   │   ├── almacen-3d.jsx
│   │   │   └── dashboard.jsx
│   │   └── components/                # Componentes reutilizables
│   │       ├── app-shell.jsx
│   │       ├── sidebar.jsx
│   │       ├── topbar.jsx
│   │       ├── task-row.jsx
│   │       ├── toast-container.jsx
│   │       ├── ui/ (action-button, form-field, modal, status-badge)
│   │       └── warehouse-3d/ (warehouse-scene, warehouse-panel)
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html
│
├── manual-de-usuario.md
├── manual-tecnico.md
└── documentacion-final.md
```

### Cómo ejecutar el sistema en modo desarrollo

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:3000`

### Lint del código

```bash
cd frontend
npm run lint
```

---

## 5. Base de Datos

### Motor de base de datos

PostgreSQL 15+. La conexión se realiza mediante `pg.Pool` con una URL de conexión definida en variables de entorno.

**Archivo de conexión** (`backend/src/db.js`):
```javascript
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

### Modelo entidad-relación

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   usuarios   │     │   insumos        │     │   ubicaciones    │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)          │     │ id (PK)          │
│ nombre       │     │ nombre (UNIQUE)  │     │ pasillo (A-D)    │
│ email (UQ)   │     │ proveedor        │     │ rack (1-6)       │
│ password     │     │ unidad (kg/L)    │     │ nivel (1-5)      │
│ rol          │     │ punto_reorden    │     │ UNIQUE(p,r,n)    │
│ activo       │     │ lead_time        │     └──────────────────┘
└──────┬───────┘     └──────────────────┘              │
       │                   │                           │
       │    ┌──────────────▼───────────────────────────┼──────────┐
       │    │           lotes_inventario               │          │
       │    ├──────────────────────────────────────────┤          │
       │    │ id (PK)                                  │          │
       ├────┤ insumo_id (FK → insumos)                 │          │
       │    │ codigo_lote (UQ, auto-generado)          │          │
       │    │ cantidad (CHECK >= 0)                    │          │
       │    │ cantidad_inicial (CHECK > 0)             │          │
       │    │ vencimiento (DATE)                       │          │
       └────┤ ubicacion_id (FK → ubicaciones)          ◄─────────┘
            │ proveedor                                │
            │ fecha_ingreso (DEFAULT NOW())            │
            │ registrado_por_id (FK → usuarios)        │
            │ estado (GENERATED ALWAYS AS ... STORED)  │
            └──────────────────────────────────────────┘


┌──────────────────┐     ┌───────────────────────────┐
│  requerimientos  │     │  requerimiento_insumos    │
├──────────────────┤     ├───────────────────────────┤
│ id (PK)          │     │ id (PK)                   │
│ numero (UNIQUE)  │     │ requerimiento_id (FK)     │
│ fecha_solicitud  │◄────│ insumo_id (FK → insumos)  │
│ fecha_registro   │     │ cantidad (CHECK > 0)      │
│ estado (CHECK)   │     │ unidad                    │
│ registrado_por_id│     │ atendido (DEFAULT 0)      │
└──────────────────┘     │ stock_snapshot            │
         │               └───────────────────────────┘
         │
         │    ┌───────────────────────────┐
         │    │ requerimiento_atenciones  │
         │    ├───────────────────────────┤
         └────┤ requerimiento_id (FK)     │
              │ fecha (DEFAULT NOW())     │
              │ atendido_por_id (FK)      │
              │ detalle (JSONB)           │
              └───────────────────────────┘

┌──────────────┐     ┌───────────────────────┐
│   tareas     │     │  alertas_atendidas    │
├──────────────┤     ├───────────────────────┤
│ id (PK)      │     │ id (PK)               │
│ asignado_a_id│     │ insumo_id (FK)        │
│ descripcion  │     │ fecha (DEFAULT NOW()) │
│ estado (CHECK)│    │ atendido_por_id (FK)  │
│ creada_en    │     └───────────────────────┘
└──────────────┘
```

### Script de creación (`database/db.sql`)

El archivo `database/db.sql` contiene:

- **10 tablas**: `usuarios`, `insumos`, `ubicaciones`, `lotes_inventario`, `requerimientos`, `requerimiento_insumos`, `requerimiento_atenciones`, `tareas`, `alertas_atendidas`
- **Secuencia**: `lote_codigo_seq` para códigos auto-incrementales (`LOT-YYYY-NNNN`)
- **Columna generada**: `lotes_inventario.estado` — `GENERATED ALWAYS AS ... STORED` que calcula automáticamente el estado (`disponible`, `bajo`, `agotado`) según `cantidad ≤ cantidad_inicial * 0.3`
- **Restricciones**: `CHECK` en `rol` (jefe/supervisor/operario), `unidad` (kg/L), rango rack (1-6), nivel (1-5), cantidad > 0, estado de requerimiento (pendiente/parcial/atendido), estado de tarea (pendiente/completada)
- **Índices**: En `insumo_id`, `ubicacion_id`, `vencimiento`, `requerimiento_id`, `asignado_a_id`
- **Seed data**: 3 usuarios, 10 insumos, 120 ubicaciones (GENERATE_SERIES), 30 lotes, 7 requerimientos con sus insumos y atenciones, 2 alertas atendidas, 10 tareas

### Estrategia de respaldo y recuperación

```bash
# Respaldo completo
pg_dump -U postgres -h localhost -d wms_db > backup_$(date +%Y%m%d).sql

# Restauración
psql -U postgres -d wms_db < backup_20260701.sql

# Restauración desde cero (recrear todo)
psql -U postgres -d wms_db -f database/db.sql
```

---

## 6. Código Fuente

### 6.1 Frontend

#### Entry point: `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

#### Router principal: `src/App.jsx`

Define 13 rutas protegidas por `PrivateRoute` (redirige al login si no hay sesión). El layout general:

```
AppProvider (Context) → BrowserRouter → Routes → PrivateRoute → Page
```

#### Cliente HTTP: `src/lib/api.js`

Cliente Axios con `baseURL: http://localhost:3000/api`. Incluye:

- **`FIELD_MAP`**: Transformación de snake_case a camelCase para todos los campos de la API.
- **`NUMERIC_KEYS`**: Conversión automática a Number para campos como `cantidad`, `stock`, `atendido`.
- **Interceptor de respuesta**: Transforma automáticamente todos los datos entrantes.
- **18 funciones exportadas**: `login`, `getInsumos`, `createInsumo`, `updateInsumo`, `getLotes`, `createLote`, `getRequerimientos`, `getRequerimiento`, `createRequerimiento`, `atenderRequerimiento`, `getUsuarios`, `createUsuario`, `updateUsuario`, `toggleUsuarioActive`, `getTareas`, `createTarea`, `toggleTarea`, `getAlertas`, `atenderAlerta`, `getDashboard`, `getUbicaciones`.

#### Gestión de estado global: `src/lib/store.jsx`

Patrón **React Context + hooks**. Expone un `AppProvider` y un hook `useApp()`.

**Estado** (9 variables con `useState`): `currentUser`, `users`, `inventory`, `insumos`, `requirements`, `tasks`, `alerts`, `ubicaciones`, `toasts`.

**Acciones** (14 funciones con `useCallback`): `login`, `logout`, `loadAll`, `addToast`, `dismissToast`, `completeTask`, `assignTask`, `attendRequirement`, `addRequirement`, `attendAlert`, `toggleUserActive`, `addUser`, `updateUser`, `addLot`, `addInsumo`, `updateInsumo`.

**Estado derivado** (2 valores con `useMemo`):
- `activeAlertCount`: Alertas donde `!a.atendidaId`.
- `pendingReqCount`: Requerimientos con estado `"pendiente"`.

#### Sistema de rutas: `src/lib/nav.js`

Define 10 ítems de navegación con etiquetas, rutas e íconos Lucide. Filtrado por rol:

| Rol | Ítems visibles |
|---|---|
| `jefe` | Inicio, Dashboard, Insumos, Inventario, 3D, Usuarios, Tareas |
| `supervisor` | Inicio, Requerimientos, Inventario, 3D, Alertas |
| `operario` | Inicio, Ingreso, Requerimientos, Inventario, 3D |

#### Páginas del sistema

| Archivo | Propósito | Rol |
|---|---|---|
| `login.jsx` | Autenticación de usuarios contra API | Público |
| `inicio.jsx` | Home role-based con tareas pendientes, KPIs | Todos |
| `ingreso.jsx` | Registro de lote con selector 3D o dropdown | Operario |
| `inventario.jsx` | Consulta con 5 filtros + panel lateral de lotes | Todos |
| `requerimientos.jsx` | Lista de requerimientos con acciones por rol | Sup., Oper. |
| `nuevo-requerimiento.jsx` | Formulario con filas dinámicas | Supervisor |
| `atender-requerimiento.jsx` | Despacho FEFO con atención parcial e historial | Operario |
| `alertas.jsx` | Alertas de stock bajo con atención | Supervisor |
| `usuarios.jsx` | CRUD de usuarios (3 modales) | Jefe |
| `responsabilidades.jsx` | Asignación de tareas con panel lateral | Jefe |
| `insumos-registro.jsx` | CRUD de catálogo de insumos | Jefe |
| `almacen-3d.jsx` | Visualización 3D full-screen | Todos |
| `dashboard.jsx` | Dashboard ejecutivo con KPIs y tablas | Jefe |

### 6.2 Backend

#### Entry point: `backend/src/index.js`

Servidor Express que:
1. Configura CORS y parsing JSON.
2. Monta 9 grupos de rutas bajo `/api/*`.
3. Incluye middleware de manejo global de errores.
4. Endpoint raíz (`GET /`) con health check que verifica conexión a BD.
5. Escucha en puerto `3000` (configurable vía `PORT`).

#### Conexión a BD: `backend/src/db.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

#### Middleware de errores: `backend/src/middleware/error-handler.js`

Captura errores lanzados en rutas y devuelve `{ error: mensaje }` con status code apropiado.

#### Módulos de rutas (9 archivos)

| Archivo | Endpoints | Descripción |
|---|---|---|
| `auth.routes.js` | `POST /login` | Autenticación por email + password. Validación de cuenta activa. |
| `insumos.routes.js` | `GET /`, `POST /`, `PUT /:id` | CRUD de catálogo de insumos. |
| `lotes.routes.js` | `GET /`, `POST /` | Listado con filtros (insumo, pasillo, rack, nivel, estado). Creación con JOIN completo. |
| `requerimientos.routes.js` | `GET /`, `GET /:id`, `POST /`, `POST /:id/atender` | Listado con subconsultas JSON. Atención con transacción, locks FEFO, cálculo de estado. |
| `usuarios.routes.js` | `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/toggle-active` | CRUD completo con manejo de email duplicado (código 23505). |
| `tareas.routes.js` | `GET /`, `POST /`, `PATCH /:id/toggle` | CRUD con filtro por asignado. Toggle pendiente↔completada. |
| `alertas.routes.js` | `GET /`, `POST /atender` | Alertas computadas: JOIN insumos + lotes, HAVING SUM < punto_reorden. |
| `dashboard.routes.js` | `GET /` | 5 KPIs: insumos registrados, lotes activos, stock crítico, reqs pendientes, alertas activas. |
| `ubicaciones.routes.js` | `GET /` | Listado ordenado de 120 ubicaciones. |

#### Lógica clave — Atención de requerimiento (`requerimientos.routes.js`)

```javascript
router.post("/:id/atender", async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Bloqueo fila del requerimiento
    const reqActual = await client.query(
      "SELECT * FROM requerimientos WHERE id = $1 FOR UPDATE", [id]
    );
    // Por cada insumo a despachar:
    for (const salida of salidas) {
      // Buscar lotes FEFO (ORDER BY vencimiento ASC)
      const lotes = await client.query(`
        SELECT id, cantidad FROM lotes_inventario
        WHERE insumo_id = $1 AND cantidad > 0
        ORDER BY vencimiento ASC FOR UPDATE
      `, [insumo_id]);
      // Descontar inventario FIFO por lote
      for (const lote of lotes.rows) {
        const tomar = Math.min(lote.cantidad, pendiente);
        await client.query("UPDATE lotes_inventario SET cantidad = cantidad - $1 WHERE id = $2", [tomar, lote.id]);
        pendiente -= tomar;
      }
      // Actualizar atendido acumulado
      await client.query("UPDATE requerimiento_insumos SET atendido = atendido + $1 WHERE ...", ...);
    }
    // Calcular nuevo estado
    const allComplete = insumosReq.rows.every(r => Number(r.atendido) >= Number(r.cantidad));
    const nuevoEstado = allComplete ? "atendido" : "parcial";
    await client.query("UPDATE requerimientos SET estado = $1 WHERE id = $2", [nuevoEstado, id]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  }
});
```

---

## 7. APIs o Servicios Web

### Base URL

```
http://localhost:3000/api
```

### Endpoints implementados

#### Autenticación

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| POST | `/auth/login` | Iniciar sesión | `email`, `password` | `{ user: { id, nombre, email, rol, activo } }` |

Códigos: `200 OK`, `401 Credenciales inválidas`, `403 Usuario inactivo`.

#### Insumos

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/insumos` | Listar todos | — | `[{ id, nombre, proveedor, unidad, punto_reorden, lead_time }]` |
| POST | `/insumos` | Crear insumo | `nombre`, `proveedor`, `unidad`, `punto_reorden`, `lead_time` | `201 { id, ... }` |
| PUT | `/insumos/:id` | Actualizar insumo | (mismos campos) | `{ id, ... }` |

#### Lotes de inventario

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/lotes` | Listar lotes | `?insumo_id&pasillo&rack&nivel&estado` | `[{ id, insumo_id, codigo_lote, cantidad, vencimiento, pasillo, rack, nivel, estado, ... }]` |
| POST | `/lotes` | Crear lote | `insumo_id`, `cantidad`, `vencimiento`, `ubicacion_id`, `proveedor`, `registrado_por_id` | `201 { id, ... }` |

#### Requerimientos

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/requerimientos` | Listar todos | — | `[{ id, numero, insumos[], atenciones[], ... }]` |
| GET | `/requerimientos/:id` | Obtener uno | — | `{ id, numero, insumos[], atenciones[], ... }` |
| POST | `/requerimientos` | Crear | `numero`, `fecha_solicitud`, `registrado_por_id`, `insumos[]` | `201 { id, ... }` |
| POST | `/requerimientos/:id/atender` | Atender (despachar) | `salidas[{insumo_id, cantidad}]`, `atendido_por_id` | `{ mensaje, estado }` |

La atención de requerimiento ejecuta en una **transacción**:
1. Bloquea la fila del requerimiento (`SELECT ... FOR UPDATE`).
2. Por cada insumo, busca lotes ordenados por vencimiento ASC (FEFO).
3. Descuenta inventario FIFO por lote.
4. Acumula en `requerimiento_insumos.atendido`.
5. Inserta registro en `requerimiento_atenciones` con detalle JSONB.
6. Calcula nuevo estado: `"atendido"` (todo completo), `"parcial"` (progreso), o `"pendiente"`.
7. Commit o Rollback ante error.

#### Usuarios

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/usuarios` | Listar usuarios | — | `[{ id, nombre, email, rol, activo }]` |
| POST | `/usuarios` | Crear usuario | `nombre`, `email`, `password`, `rol` | `201 { id, ... }` |
| PUT | `/usuarios/:id` | Actualizar | `nombre`, `password?`, `rol` | `{ id, ... }` |
| PATCH | `/usuarios/:id/toggle-active` | Activar/Desactivar | — | `{ id, ..., activo }` |

#### Tareas

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/tareas` | Listar tareas | `?asignado_a_id` | `[{ id, descripcion, estado, asignado_a_nombre, ... }]` |
| POST | `/tareas` | Crear tarea | `asignado_a_id`, `descripcion` | `201 { id, ... }` |
| PATCH | `/tareas/:id/toggle` | Toggle estado | — | `{ id, estado }` |

#### Alertas

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/alertas` | Alertas computadas | — | `[{ insumo_id, insumo, stock_actual, punto_reorden, deficit, atendida_id, ... }]` |
| POST | `/alertas/atender` | Atender alerta | `insumo_id`, `atendido_por_id` | `201 { id, fecha, ... }` |

Las alertas son **computadas dinámicamente**: JOIN entre `insumos` y `lotes_inventario`, agrupado por insumo, con `HAVING SUM(cantidad) < punto_reorden`.

#### Dashboard

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/dashboard` | KPIs del sistema | — | `{ insumosRegistrados, lotesActivosCount, stockCritico, reqsPendientes, alertasActivas }` |

#### Ubicaciones

| Método | Ruta | Descripción | Parámetros | Respuesta |
|---|---|---|---|---|
| GET | `/ubicaciones` | Listar ubicaciones | — | `[{ id, pasillo, rack, nivel }]` (120 registros) |

---

## 8. Seguridad

### Control de accesos y roles

El sistema implementa un modelo de control de acceso basado en roles (RBAC):

| Rol | Nivel de acceso |
|---|---|
| `jefe` | Administrativo total: dashboard, usuarios, insumos, tareas |
| `supervisor` | Operaciones: requerimientos (crear), alertas, inventario |
| `operario` | Tareas operativas: ingreso de lotes, atención de requerimientos |

**Mecanismos de seguridad implementados:**

1. **Ruteo protegido**: `PrivateRoute` en `App.jsx` redirige al login si no hay `currentUser`.
2. **Guard por rol**: `AppShell` recibe `allowedRoles` y bloquea acceso no autorizado.
3. **Navegación filtrada**: `Sidebar` solo muestra ítems permitidos según `NAV_BY_ROLE`.
4. **Autenticación backend**: Validación de credenciales contra BD en `POST /api/auth/login`.
5. **Validación de cuenta activa**: Usuarios inactivos reciben `403 Forbidden`.
6. **Consultas parametrizadas**: Todas las queries SQL usan `$1, $2, ...` para prevenir SQL injection.
7. **Transacciones con bloqueo**: `SELECT ... FOR UPDATE` en atención de requerimientos para evitar condiciones de carrera.
8. **CORS habilitado**: Solo permite orígenes configurados.

### Seguridad planificada

| Medida | Estado |
|---|---|
| Hash de contraseñas (bcrypt) | Pendiente |
| Autenticación JWT | Pendiente |
| HTTPS | Pendiente (configurable en producción) |
| Validación de entrada con Express | Parcial (implementada en rutas críticas) |
| Rate limiting | Pendiente |

---

## 9. Pruebas Técnicas

### Estado actual

El sistema no cuenta con pruebas automatizadas en esta versión. Se realizaron pruebas funcionales manuales de todas las funcionalidades del frontend y los endpoints del backend.

### Pruebas de frontend

| Funcionalidad | Tipo de prueba | Resultado |
|---|---|---|
| Inicio de sesión | Funcional (manual) | OK |
| Validación de roles | Funcional (manual) | OK |
| CRUD de insumos | Funcional + validación | OK |
| Registro de lote | Funcional + validación | OK |
| Atención de requerimiento | Funcional + FEFO | OK |
| Atención parcial | Funcional (manual) | OK |
| Filtros de inventario | Funcional (manual) | OK |
| Visualización 3D | Funcional (manual) | OK |
| Dashboard | Funcional (manual) | OK |
| Alertas dinámicas | Funcional (manual) | OK |
| CRUD de usuarios | Funcional + validación | OK |
| Asignación de tareas | Funcional (manual) | OK |
| Build de producción | Compilación (build) | OK |

### Pruebas de backend (API)

| Endpoint | Método | Prueba | Resultado |
|---|---|---|---|
| `/api/auth/login` | POST | Login correcto → 200 + user | OK |
| `/api/auth/login` | POST | Credenciales inválidas → 401 | OK |
| `/api/auth/login` | POST | Usuario inactivo → 403 | OK |
| `/api/insumos` | GET | Listar insumos → 200 + array | OK |
| `/api/insumos` | POST | Crear insumo → 201 | OK |
| `/api/lotes` | GET | Listar con filtros → 200 | OK |
| `/api/lotes` | POST | Crear lote → 201 | OK |
| `/api/requerimientos` | GET | Listar con insumos y atenciones → 200 | OK |
| `/api/requerimientos/:id/atender` | POST | Atención parcial → transacción commit | OK |
| `/api/requerimientos/:id/atender` | POST | Atención completa → estado "atendido" | OK |
| `/api/usuarios` | POST | Email duplicado → 409 | OK |
| `/api/tareas/:id/toggle` | PATCH | Toggle estado → 200 | OK |
| `/api/alertas` | GET | Alerta dinámica → solo stock < ROP | OK |
| `/api/dashboard` | GET | 5 KPIs calculados → 200 | OK |

### Herramientas previstas para el futuro

- **Vitest** — Pruebas unitarias para funciones utilitarias y store.
- **React Testing Library** — Pruebas de componentes.
- **Supertest** — Pruebas de integración de API.
- **Playwright** — Pruebas end-to-end.

---

## 10. Mantenimiento y Actualizaciones

### Cómo realizar actualizaciones del sistema

```bash
# 1. Obtener los últimos cambios
git pull origin main

# 2. Actualizar dependencias (frontend y backend)
cd frontend && npm install
cd ../backend && npm install

# 3. Ejecutar migraciones de BD (si las hay)
psql -U postgres -d wms_db -f database/migrations/XXX.sql

# 4. Verificar compilación del frontend
cd ../frontend && npm run build

# 5. Ejecutar linter
npm run lint

# 6. Verificar health check del backend
curl http://localhost:3000
```

### Procedimientos para solucionar fallas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| Error de compilación frontend | Dependencia desactualizada | `npm install` o borrar `node_modules` + `npm install` |
| Error "ECONNREFUSED" en backend | PostgreSQL no está corriendo | `sudo systemctl start postgresql` |
| Error de conexión a BD | DATABASE_URL incorrecta | Verificar `backend/.env` |
| La escena 3D no se renderiza | WebGL no disponible | Verificar navegador / habilitar WebGL |
| 401 en login | Credenciales inválidas | Verificar email y contraseña en BD |
| 500 en atención de requerimiento | Error en transacción | Revisar logs del backend |
| Puerto 3000 ocupado | Otro proceso usando el puerto | Cambiar `PORT` en `.env` |

### Documentación de cambios (Changelog)

| Versión | Fecha | Cambios principales |
|---|---|---|
| 1.0.0 | Julio 2026 | Versión inicial: frontend + backend + BD operativos |

---

## 11. Anexos

### Configuración de Vite (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Tema de Tailwind CSS (`index.css`)

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@theme inline {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', monospace;
  /* Colores corporativos Qori Foods */
  --color-background: var(--background);
  --color-foreground: var(--text-primary);
  --color-primary: var(--accent);
  --color-brand: var(--sidebar-bg);
  --color-sidebar: var(--sidebar-bg);
  --color-sidebar-primary: var(--sidebar-accent);
  --radius-sm: 3px;
  --radius-md: 5px;
  --radius-lg: 8px;
}

:root {
  --background: #f8f8f7;
  --text-primary: #1c1c1a;
  --text-secondary: #52524e;
  --text-tertiary: #8f8f8a;
  --surface: #ffffff;
  --surface-raised: #f4f4f3;
  --surface-overlay: #efefed;
  --border-subtle: #e8e8e6;
  --border-default: #d4d4d0;
  --accent: #b07d2a;
  --accent-hover: #9a6d22;
  --sidebar-bg: #1e1208;
  --sidebar-text: #c8bfb0;
  --sidebar-accent: #c8922a;
  --success: #2d6a4f;
  --warning: #92520a;
  --danger: #9b2c2c;
  --info: #1e4d7b;
}
```

### Configuración de ESLint (`eslint.config.js`)

Formato flat config de ESLint v10 con plugins para React, React Hooks y React Refresh.

### Datos de semilla (`database/db.sql`)

| Tabla | Registros | Propósito |
|---|---|---|
| `usuarios` | 3 | María Flores (jefe), Pedro Salas (supervisor), Carlos Quispe (operario) |
| `insumos` | 10 | Catálogo de materias primas con proveedores |
| `ubicaciones` | 120 | 4 pasillos × 6 racks × 5 niveles |
| `lotes_inventario` | 30 | Lotes con diversos estados y vencimientos |
| `requerimientos` | 7 | Pedidos de producción (pendientes, parciales, atendidos) |
| `alertas_atendidas` | 2 | Historial de reabastecimiento |
| `tareas` | 10 | Tareas asignadas al personal |

### Logs de ejemplo (compilación exitosa)

```
vite v8.0.16 building client environment for production...
✓ 2381 modules transformed.
✓ built in 1.13s

Servidor backend:
> nodemon src/index.js
Servidor corriendo en http://localhost:3000
```

### Health check de API

```
GET http://localhost:3000/
→ 200 { message: "WMS Qori Foods API funcionando", db: "conectada", serverTime: "..." }
```
