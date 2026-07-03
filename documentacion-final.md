# Documentación Final del Proyecto de Software

## WMS Qori Foods — Sistema de Gestión de Almacén de Insumos

---

| | |
|---|---|
| **Universidad** | [Nombre de la universidad] |
| **Facultad** | [Nombre de la facultad] |
| **Curso** | Ingeniería de Software |
| **Nombre del proyecto** | WMS Qori Foods — Sistema de Gestión de Almacén de Insumos |
| **Integrantes** | [Nombres de los integrantes] |
| **Docente** | [Nombre del docente] |
| **Fecha de entrega** | Julio 2026 |

---

## Resumen Ejecutivo

**WMS Qori Foods** es un sistema web de gestión de almacenes (WMS) desarrollado para la empresa Qori Foods, dedicada a la producción de alimentos. El sistema permite controlar el inventario de materias primas mediante el registro de lotes, la gestión de requerimientos de producción, la consulta de existencias en tiempo real y la visualización tridimensional del almacén.

El sistema fue desarrollado con una arquitectura de tres capas: **frontend** (React 19 + Vite 8 + Three.js), **backend** (Node.js + Express 5 con API REST) y **base de datos** (PostgreSQL 15+ con 10 tablas). Implementa un modelo de acceso basado en roles (Jefe, Supervisor, Operario) con 13 páginas funcionales que cubren todo el ciclo de vida del inventario: desde el ingreso de lotes hasta el despacho para producción, pasando por la generación de alertas automáticas de stock bajo.

El sistema se encuentra en su versión 1.0.0 con frontend, backend y base de datos completamente funcionales e integrados, listo para su uso en producción.

---

## 1. Introducción

### Contexto del problema

Qori Foods, una empresa del rubro alimenticio, enfrentaba dificultades en la gestión de su almacén de materias primas. El control de inventarios se realizaba de manera manual o con herramientas ofimáticas básicas, lo que generaba:

- Pérdida de trazabilidad de lotes (fechas de vencimiento, proveedores, ubicaciones).
- Desabastecimiento por falta de alertas tempranas de stock bajo.
- Dificultad para coordinar los requerimientos de producción con el inventario disponible.
- Falta de visibilidad en tiempo real del estado del almacén.
- Duplicidad de esfuerzos en el registro y despacho de insumos.

### Justificación del proyecto

La implementación de un sistema WMS específico para Qori Foods permite:

- **Automatizar** el registro y control de lotes de insumos.
- **Centralizar** la información del almacén en un solo sistema accesible desde cualquier lugar.
- **Optimizar** el flujo de requerimientos entre producción y almacén.
- **Reducir** pérdidas por vencimientos mediante alertas y control de fechas.
- **Mejorar** la trazabilidad desde el ingreso hasta el despacho de cada lote.

### Objetivo general y específicos

**Objetivo general**:

Desarrollar un sistema web de gestión de almacén (WMS) para el control de materias primas de Qori Foods, que permita registrar, consultar y despachar inventario con trazabilidad completa y visualización en 3D.

**Objetivos específicos**:

1. Implementar un módulo de registro de lotes con asignación de ubicaciones físicas en el almacén.
2. Desarrollar un sistema de requerimientos de producción con atención parcial y método FEFO.
3. Crear una consulta de inventario con filtros multidimensionales (insumo, ubicación, estado).
4. Implementar alertas automáticas de stock bajo basadas en puntos de reorden.
5. Desarrollar una visualización tridimensional interactiva del almacén.
6. Implementar un dashboard ejecutivo con indicadores KPI.
7. Diseñar e implementar un modelo de base de datos relacional en PostgreSQL con 10 tablas.
8. Construir una API REST con Express para la comunicación frontend-backend.
9. Gestionar usuarios con roles y niveles de acceso diferenciados.

### Alcance y limitaciones del sistema

**Alcance**:

- Gestión completa de lotes de insumos (ingreso, consulta, despacho).
- Requerimientos de producción con atención parcial, método FEFO e historial.
- Catálogo de insumos con proveedores y puntos de reorden.
- Visualización 3D del almacén con navegación interactiva y selección de ubicaciones.
- Dashboard ejecutivo con KPIs calculados desde la base de datos.
- Gestión de usuarios (CRUD, roles, activación/desactivación).
- Asignación de tareas al personal.
- Alertas automáticas de stock bajo (cálculo dinámico).
- API REST con 20 endpoints para todas las operaciones CRUD y transaccionales.

**Limitaciones**:

- Las contraseñas se almacenan en texto plano (pendiente implementar bcrypt).
- No incluye autenticación JWT (sesión manejada por estado en frontend).
- No incluye integración con sistemas externos (ERP, facturación, etc.).
- La visualización 3D requiere WebGL y puede no funcionar en navegadores antiguos.
- No incluye generación de reportes PDF ni impresión directa.
- No cuenta con pruebas automatizadas.

---

## 2. Análisis del Sistema

### Descripción del problema o necesidad detectada

El almacén de Qori Foods maneja múltiples materias primas (insumos) que ingresan en lotes con diferentes fechas de vencimiento, proveedores y cantidades. El personal necesita:

- **Registrar** cada ingreso de lote con su ubicación exacta en el almacén (pasillo, rack, nivel).
- **Consultar** rápidamente el stock disponible de cualquier insumo.
- **Atender** los requerimientos de producción despachando los lotes más próximos a vencer (FEFO).
- **Recibir alertas** cuando un insumo está por debajo de su punto de reorden.
- **Visualizar** la disposición física del almacén para planificar ubicaciones.

### Actores del sistema

| Actor | Descripción |
|---|---|
| **Jefe de Almacén** | Administra el sistema: usuarios, insumos, tareas, dashboard. |
| **Supervisor de Almacén** | Gestiona requerimientos, monitorea alertas, consulta inventario. |
| **Operario de Almacén** | Registra ingresos de lotes y atiende requerimientos. |

### Requisitos funcionales

| ID | Descripción | Actor |
|---|---|---|
| RF-01 | Iniciar sesión con correo y contraseña | Todos |
| RF-02 | Cerrar sesión | Todos |
| RF-03 | Ver página de inicio con contenido según el rol | Todos |
| RF-04 | Visualizar dashboard con KPIs | Jefe |
| RF-05 | Registrar un nuevo insumo en el catálogo | Jefe |
| RF-06 | Editar un insumo existente | Jefe |
| RF-07 | Registrar ingreso de un nuevo lote | Operario |
| RF-08 | Seleccionar ubicación del lote (pasillo, rack, nivel) | Operario |
| RF-09 | Validar capacidad máxima de 5 lotes por nivel | Operario |
| RF-10 | Consultar inventario con filtros | Todos |
| RF-11 | Filtrar inventario por insumo, pasillo, rack, nivel | Todos |
| RF-12 | Filtrar inventario por estado (normal, bajo, agotado) | Todos |
| RF-13 | Ver detalle de lotes de un insumo (panel lateral) | Todos |
| RF-14 | Visualizar alertas de stock bajo | Supervisor |
| RF-15 | Atender una alerta de stock bajo | Supervisor |
| RF-16 | Crear un nuevo requerimiento de producción | Supervisor |
| RF-17 | Atender un requerimiento (despachar inventario) | Operario |
| RF-18 | Atender parcialmente un requerimiento | Operario |
| RF-19 | Aplicar método FEFO en el despacho | Operario |
| RF-20 | Crear un nuevo usuario | Jefe |
| RF-21 | Editar un usuario existente | Jefe |
| RF-22 | Desactivar/reactivar un usuario | Jefe |
| RF-23 | Asignar una tarea a un miembro del personal | Jefe |
| RF-24 | Marcar una tarea como completada | Operario |
| RF-25 | Visualizar el almacén en 3D | Todos |
| RF-26 | Navegar en el almacén 3D con teclado | Todos |
| RF-27 | Seleccionar un lote en la vista 3D | Todos |
| RF-28 | Ver información del lote seleccionado | Todos |

### Requisitos no funcionales

| ID | Descripción |
|---|---|
| RNF-01 | El sistema debe cargar la página principal en menos de 3 segundos. |
| RNF-02 | La visualización 3D debe renderizar a 30+ FPS en hardware estándar. |
| RNF-03 | El sistema debe ser responsive (adaptarse a pantallas de escritorio). |
| RNF-04 | La interfaz debe estar en español (Perú). |
| RNF-05 | El sistema debe usar codificación de caracteres UTF-8. |
| RNF-06 | Las consultas SQL deben usar parámetros para prevenir SQL injection. |
| RNF-07 | El código debe seguir el estándar ESLint configurado. |
| RNF-08 | La build de producción debe generar archivos optimizados (minificación). |
| RNF-09 | El backend debe responder en menos de 500ms para consultas simples. |
| RNF-10 | La API debe usar transacciones para operaciones críticas (atención de requerimientos). |

### Modelo de casos de uso

```
┌─────────────────────────────────────────────────────────┐
│                    WMS Qori Foods                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Jefe de Almacén                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐    │   │
│  │  │Gestionar  │ │Gestionar │ │Asignar        │    │   │
│  │  │Insumos    │ │Usuarios  │ │Tareas         │    │   │
│  │  │(CRUD)     │ │(CRUD)    │ │               │    │   │
│  │  └──────────┘ └──────────┘ └───────────────┘    │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │Ver Dashboard y KPIs                      │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Supervisor de Almacén                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐    │   │
│  │  │Gestionar  │ │Consultar │ │Monitorear     │    │   │
│  │  │Requerim.  │ │Inventario│ │Alertas        │    │   │
│  │  │(Crear)    │ │(Filtrar) │ │(Atender)      │    │   │
│  │  └──────────┘ └──────────┘ └───────────────┘    │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │Visualizar Almacén 3D                     │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Operario de Almacén                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐    │   │
│  │  │Registrar  │ │Atender   │ │Consultar      │    │   │
│  │  │Ingreso    │ │Requerim. │ │Inventario     │    │   │
│  │  │de Lote    │ │(FEFO)    │ │               │    │   │
│  │  └──────────┘ └──────────┘ └───────────────┘    │   │
│  │  ┌──────────┐ ┌──────────────────────────┐   │   │
│  │  │Ver Tareas│ │Visualizar Almacén 3D     │   │   │
│  │  │(Completar)│ └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Todos los actores                  │   │
│  │  ┌──────────┐ ┌──────────────────────────┐      │   │
│  │  │Iniciar/   │ │Visualizar Almacén 3D    │      │   │
│  │  │Cerrar     │ │(Navegar, Seleccionar)   │      │   │
│  │  │Sesión     │ └──────────────────────────┘      │   │
│  │  └──────────┘                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Escenarios principales

**Escenario 1 — Registro de ingreso de lote**:

1. El operario inicia sesión y navega a "Registrar Ingreso de Lote".
2. Selecciona el insumo del catálogo (el proveedor y unidad se autocompletan).
3. Ingresa la cantidad y fecha de vencimiento.
4. Selecciona la ubicación (pasillo, rack, nivel) mediante dropdowns o selector 3D.
5. El sistema valida que el nivel tenga capacidad disponible (< 5 lotes).
6. El operario confirma y el lote se registra con código único en la base de datos.

**Escenario 2 — Atención de requerimiento (despacho)**:

1. El supervisor crea un requerimiento de producción.
2. El operario abre el requerimiento pendiente.
3. El sistema sugiere lotes a despachar usando FEFO.
4. El operario ingresa las cantidades a despachar por insumo.
5. El backend ejecuta una transacción: descuenta inventario FEFO, actualiza atendido acumulado, registra atención con detalle JSONB, calcula nuevo estado.
6. El frontend refresca los datos desde la API.

**Escenario 3 — Monitoreo de alertas**:

1. El backend calcula alertas mediante una consulta SQL que compara stock total vs punto de reorden.
2. Si un insumo está por debajo de su ROP, aparece en la lista.
3. El supervisor ve las alertas y las atiende, registrando fecha y responsable.
4. Las alertas atendidas no vuelven a aparecer.

---

## 3. Diseño del Sistema

### Arquitectura general del sistema

El sistema sigue una arquitectura **cliente-servidor de tres capas**:

```
┌──────────────────────────────────────────────────────────┐
│               CAPA DE PRESENTACIÓN (Frontend)             │
│  React 19 + Vite 8 + Tailwind v4 + Three.js              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │  Páginas  │  │Componente│  │  Visualización 3D   │   │
│  │  (13)     │  │s UI (7)  │  │ (Three.js + R3F)    │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
│         │                                                │
│  ┌──────▼──────┐                                         │
│  │  Axios HTTP │──── HTTP/JSON ────┐                     │
│  └─────────────┘                    │                     │
└─────────────────────────────────────┼─────────────────────┘
                                      │
┌─────────────────────────────────────▼─────────────────────┐
│               CAPA DE NEGOCIO (Backend)                   │
│  Node.js + Express 5                                      │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ 9 Rutas  │  │ Middleware │  │   Transacciones      │  │
│  │  REST    │  │(CORS, Err) │  │   (BEGIN/COMMIT)     │  │
│  └──────────┘  └────────────┘  └──────────────────────┘  │
│         │                                                │
│  ┌──────▼──────┐                                         │
│  │  pg Pool   │──── SQL ────┐                           │
│  └─────────────┘             │                           │
└──────────────────────────────┼───────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────┐
│               CAPA DE DATOS                              │
│  PostgreSQL 15+                                          │
│  10 tablas con restricciones, índices, columna generada  │
└──────────────────────────────────────────────────────────┘
```

### Diseño de interfaces

El sistema cuenta con 13 interfaces principales más componentes modales y paneles laterales. El diseño sigue una paleta de colores corporativa:

- **Fondo general**: Gris claro (`#f8f8f7`)
- **Sidebar**: Marrón oscuro (`#1e1208`) con textos en beige
- **Acento**: Dorado (`#b07d2a` y `#c8922a`)
- **Estados**: Verde éxito (`#2d6a4f`), Ámbar advertencia (`#92520a`), Rojo crítico (`#9b2c2c`), Azul informativo (`#1e4d7b`)
- **Tipografía**: Inter (sans-serif) y Geist Mono (monospace)
- **Radios**: 3px (sm), 5px (md), 8px (lg)

**Principales pantallas**:

1. **Login**: Formulario centrado con campos de correo y contraseña.
2. **Inicio por rol**: Tarjetas de tareas pendientes + indicadores.
3. **Dashboard**: 5 KPIs + tabla de existencias expandible + vencimientos + gráfico de barras + requerimientos activos + actividad del equipo.
4. **Registro de lote**: Formulario con selector de ubicación en 3 dropdowns + botón para selector 3D + indicador de ocupación.
5. **Consulta de inventario**: Tabla agrupada por insumo + 5 filtros + panel lateral de lotes con colores de vencimiento.
6. **Requerimientos**: Tabla con estado y acciones por rol.
7. **Atención de requerimiento**: Tarjetas por insumo con sugerencia FEFO, campo de cantidad y badge de estado, en grilla de 3 columnas.
8. **Alertas**: Lista con indicador de déficit + modal de atención.
9. **Usuarios**: Tabla + 3 modales (crear, editar, desactivar con advertencia de tareas).
10. **Responsabilidades**: Tarjetas de personal + panel lateral de tareas + formulario de asignación.
11. **Insumos registro**: Formulario + lista editable.
12. **Almacén 3D**: Canvas Three.js + panel de información + HUD de posición.
13. **Insumos registro**: Formulario + lista editable.

### Diagramas de flujo

**Diagrama de flujo — Registro de lote**:

```
[Inicio] → Seleccionar insumo → Ingresar cantidad y vencimiento
    ↓
Seleccionar ubicación (Pasillo / Rack / Nivel)
    ↓
¿Nivel tiene < 5 lotes? → No → [Error: "Nivel lleno"] → Volver
    ↓ Sí
[Confirmar] → POST /api/lotes → [Lote registrado en BD] → [Fin]
```

**Diagrama de flujo — Atención de requerimiento**:

```
[Inicio] → Seleccionar requerimiento pendiente/parcial
    ↓
Por cada insumo solicitado:
    → GET /api/requerimientos/:id (obtener datos actuales)
    → Calcular cantidad pendiente (solicitado - atendido)
    → Buscar lotes FEFO (backend: ORDER BY vencimiento ASC)
    → Operario ingresa cantidad a despachar (≤ disponible)
    ↓
[Confirmar despacho] → POST /api/requerimientos/:id/atender
    ↓ (Transacción en backend)
    → SELECT ... FOR UPDATE (bloquear fila)
    → Descontar inventario de lotes (FEFO, lote por lote)
    → UPDATE requerimiento_insumos.atendido (acumular)
    → INSERT en requerimiento_atenciones (historial + detalle JSONB)
    → Calcular nuevo estado (atendido / parcial)
    → COMMIT (o ROLLBACK ante error)
    ↓
[Frontend refresca datos] → [Fin]
```

**Diagrama de secuencia — Creación de requerimiento**:

```
Supervisor           Frontend                Backend (API)            BD
    │                    │                        │                    │
    │── Navega a ───────>│                        │                    │
    │  /requerimientos/  │                        │                    │
    │  nuevo             │                        │                    │
    │<── Formulario ─────│                        │                    │
    │                    │                        │                    │
    │── Completa datos ──>│                        │                    │
    │── Click            │                        │                    │
    │  "Registrar"       │── POST /api/ ────────>│                    │
    │                    │   requerimientos       │── INSERT INTO ───>│
    │                    │                        │   requerimientos   │
    │                    │                        │── INSERT INTO ───>│
    │                    │                        │   req_insumos (xN) │
    │                    │                        │<── OK ────────────│
    │                    │<── 201 + data ─────────│                    │
    │<── Toast + ────────│                        │                    │
    │  Redirigir a       │                        │                    │
    │  /requerimientos   │                        │                    │
```

### Modelo de datos (entidad-relación)

Ver sección 5 del Manual Técnico para el diagrama ER completo con 10 tablas, relaciones, restricciones y columna generada.

---

## 4. Implementación del Sistema

### Tecnologías utilizadas

| Categoría | Tecnología | Versión | Propósito |
|---|---|---|---|
| Lenguaje (Frontend) | JavaScript (ES2022+) | — | Lógica de interfaz de usuario |
| UI Framework | React | ^19.2.6 | Componentes de interfaz |
| Router | React Router DOM | ^7.17.0 | Navegación SPA |
| Build Tool | Vite | ^8.0.12 | Empaquetado y dev server |
| CSS Framework | Tailwind CSS | ^4.3.0 | Estilos utilitarios |
| 3D Engine | Three.js | ^0.184.0 | Renderizado 3D |
| React 3D | @react-three/fiber | ^9.6.1 | Integración React + Three.js |
| Drei (helpers) | @react-three/drei | ^10.7.7 | OrbitControls, Text, Html |
| Iconos | Lucide React | ^1.17.0 | Iconos vectoriales |
| HTTP Client | Axios | ^1.17.0 | Conexión frontend-backend |
| Lenguaje (Backend) | Node.js (CommonJS) | 20.x LTS | Lógica del servidor |
| Framework Backend | Express | ^5.2.1 | API REST |
| Cliente PostgreSQL | pg (node-postgres) | ^8.21.0 | Conexión a BD |
| CORS | cors | ^2.8.6 | Seguridad de orígenes |
| Variables de entorno | dotenv | ^17.4.2 | Configuración |
| Dev Server Backend | nodemon | ^3.1.14 | Recarga automática |
| Base de datos | PostgreSQL | 15+ | Persistencia de datos |
| Linter | ESLint | ^10.3.0 | Calidad de código |

### Estructura general del código

```
wms-qorifoods/
├── database/
│   └── db.sql                    # DDL: 10 tablas + seed data
├── backend/                      # API REST
│   ├── .env                      # Variables de entorno
│   └── src/
│       ├── index.js              # Servidor Express (punto de entrada)
│       ├── db.js                 # Pool de conexión PostgreSQL
│       ├── middleware/
│       │   └── error-handler.js  # Manejador global de errores
│       └── routes/               # 9 módulos de rutas
│           ├── auth.routes.js    # POST /login
│           ├── insumos.routes.js # CRUD insumos
│           ├── lotes.routes.js   # CRUD lotes con filtros
│           ├── requerimientos.routes.js  # CRUD + atención transaccional
│           ├── usuarios.routes.js       # CRUD usuarios
│           ├── tareas.routes.js  # CRUD tareas + toggle
│           ├── alertas.routes.js # Alertas computadas + atención
│           ├── dashboard.routes.js      # 5 KPIs
│           └── ubicaciones.routes.js    # Listado
└── frontend/                     # SPA React
    └── src/
        ├── main.jsx              # Entry point
        ├── App.jsx               # Router (13 rutas)
        ├── index.css             # Tailwind v4 tema
        ├── lib/                  # Lógica compartida
        │   ├── api.js            # Axios + 18 funciones API
        │   ├── store.jsx         # Context API
        │   ├── nav.js            # Navegación por rol
        │   ├── types.js          # Constantes
        │   └── utils.js          # Utilidades
        ├── pages/                # 13 páginas
        └── components/           # UI + Layout + 3D
```

### Fragmentos clave de código

**Conexión a base de datos (`backend/src/db.js`)**:
```javascript
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

**Atención de requerimiento con transacción (`backend/src/routes/requerimientos.routes.js`)**:
```javascript
router.post("/:id/atender", async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Bloquear fila del requerimiento
    const reqActual = await client.query(
      "SELECT * FROM requerimientos WHERE id = $1 FOR UPDATE", [id]
    );

    for (const salida of salidas) {
      // Buscar lotes FEFO (más próximo a vencer primero)
      const lotes = await client.query(`
        SELECT id, cantidad FROM lotes_inventario
        WHERE insumo_id = $1 AND cantidad > 0
        ORDER BY vencimiento ASC FOR UPDATE
      `, [insumo_id]);

      // Descontar inventario lote por lote
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

      // Acumular atendido
      await client.query(`
        UPDATE requerimiento_insumos SET atendido = atendido + $1
        WHERE requerimiento_id = $2 AND insumo_id = $3
      `, [cantidad, id, insumo_id]);
    }

    // Calcular nuevo estado
    const insumosReq = await client.query(
      "SELECT cantidad, atendido FROM requerimiento_insumos WHERE requerimiento_id = $1", [id]
    );
    const allComplete = insumosReq.rows.every(
      r => Number(r.atendido) >= Number(r.cantidad)
    );
    const nuevoEstado = allComplete ? "atendido" : "parcial";
    await client.query(
      "UPDATE requerimientos SET estado = $1 WHERE id = $2", [nuevoEstado, id]
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
```

**Cliente API con transformación automática (`frontend/src/lib/api.js`)**:
```javascript
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3000/api' })

const FIELD_MAP = {
  rol: 'role', activo: 'active', descripcion: 'description',
  asignadoAId: 'assigneeId', registradoPorId: 'registradoPorId',
  // ... más mapeos
}

// Transformación snake_case → camelCase automática
api.interceptors.response.use((res) => {
  res.data = transformKeys(res.data)
  return res
})
```

**Renderizado de racks 3D (`warehouse-scene.jsx`)**:
```javascript
const PASILLO_Z = { A: -6, B: -2, C: 2, D: 6 }
const BAY_X = { 1: -10, 2: -6, 3: -2, 4: 2, 5: 6, 6: 10 }
const NIVEL_Y = { 1: 0.07, 2: 0.57, 3: 1.07, 4: 1.57, 5: 2.07 }

function RackRow({ position, rowLetter }) {
  return (
    <group position={position}>
      {UPRIGHT_X.map((ux) => (
        <mesh position={[ux, POST_H / 2, zOff]} castShadow>
          <boxGeometry args={[0.08, POST_H, 0.08]} />
          <meshStandardMaterial color="#5a4a3e" />
        </mesh>
      ))}
      {SHELF_Y.map((y) => (
        <mesh position={[0, y, 0]} receiveShadow>
          <boxGeometry args={[ROW_L, 0.05, ROW_D]} />
          <meshStandardMaterial color="#7a6a5a" />
        </mesh>
      ))}
    </group>
  )
}
```

### Conectividad con base de datos

La conexión se realiza mediante `pg.Pool` (node-postgres) con una URL de conexión configurada en variables de entorno. El esquema de base de datos tiene 10 tablas:

| Tabla | Registros semilla | Descripción |
|---|---|---|
| `usuarios` | 3 | María Flores (jefe), Pedro Salas (supervisor), Carlos Quispe (operario) |
| `insumos` | 10 | Catálogo de materias primas con proveedor, unidad, ROP y lead time |
| `ubicaciones` | 120 | 4 pasillos × 6 racks × 5 niveles |
| `lotes_inventario` | 30 | Lotes con trazabilidad completa y columna generada para estado |
| `requerimientos` | 7 | Pedidos de producción con estados: pendiente, parcial, atendido |
| `requerimiento_insumos` | 19 | Items solicitados con cantidad y atendido acumulado |
| `requerimiento_atenciones` | 4 | Historial de despachos con detalle JSONB |
| `tareas` | 10 | Asignaciones al personal |
| `alertas_atendidas` | 2 | Registro de alertas de stock bajo atendidas |

---

## 5. Pruebas del Sistema

### Plan de pruebas

Se realizaron pruebas funcionales manuales sobre todas las funcionalidades del sistema, abarcando tanto el frontend como la API REST del backend.

**Pruebas de frontend (13 funcionalidades)**:

1. Autenticación: Login válido, inválido, usuario inactivo.
2. Autorización: Acceso por rol a rutas permitidas y bloqueadas.
3. CRUD de insumos: Crear, editar, validar duplicados.
4. Registro de lote: Validación de campos, capacidad máxima por nivel.
5. Consulta de inventario: Filtros combinados, panel lateral de lotes.
6. Requerimientos: Crear, listar, filtrar por estado.
7. Atención de requerimiento: Despacho completo, parcial, FEFO.
8. Alertas: Visualización dinámica, atención.
9. Usuarios: Crear, editar, desactivar con advertencia de tareas.
10. Tareas: Asignar, completar.
11. Dashboard: KPIs, tablas expandibles.
12. Visualización 3D: Renderizado, navegación por teclado.
13. Build de producción: Compilación sin errores.

**Pruebas de backend (20 endpoints)**:

| Endpoint | Método | Prueba | Resultado |
|---|---|---|---|
| `/api/auth/login` | POST | Credenciales correctas → 200 | OK |
| `/api/auth/login` | POST | Credenciales incorrectas → 401 | OK |
| `/api/auth/login` | POST | Usuario inactivo → 403 | OK |
| `/api/insumos` | GET | Listar todos → 200 + array | OK |
| `/api/insumos` | POST | Crear → 201 + datos | OK |
| `/api/insumos/:id` | PUT | Actualizar → 200 | OK |
| `/api/lotes` | GET | Listar con filtros → 200 | OK |
| `/api/lotes` | POST | Crear con JOIN completo → 201 | OK |
| `/api/requerimientos` | GET | Listar con subconsultas JSON → 200 | OK |
| `/api/requerimientos/:id` | GET | Obtener uno → 200 | OK |
| `/api/requerimientos` | POST | Crear con transacción → 201 | OK |
| `/api/requerimientos/:id/atender` | POST | Atención parcial → estado "parcial" | OK |
| `/api/requerimientos/:id/atender` | POST | Atención completa → estado "atendido" | OK |
| `/api/usuarios` | GET | Listar (sin password) → 200 | OK |
| `/api/usuarios` | POST | Email duplicado → 409 | OK |
| `/api/usuarios/:id` | PUT | Actualizar con password opcional → 200 | OK |
| `/api/usuarios/:id/toggle-active` | PATCH | Toggle activo → 200 | OK |
| `/api/tareas` | GET | Filtrar por asignado → 200 | OK |
| `/api/tareas/:id/toggle` | PATCH | Toggle pendiente/completada → 200 | OK |
| `/api/alertas` | GET | Solo stock < ROP → 200 | OK |
| `/api/alertas/atender` | POST | Registrar atención → 201 | OK |
| `/api/dashboard` | GET | 5 KPIs calculados → 200 | OK |
| `/api/ubicaciones` | GET | 120 registros → 200 | OK |

### Errores encontrados y cómo se resolvieron

| Error | Causa | Solución |
|---|---|---|
| La consulta de inventario no agrupaba por insumoId | El groupBy usaba solo `insumo` | Cambiar a `lot.insumoId \|\| lot.insumo` |
| Filtro de ubicación roto al usar 3 selects | matchUbic no parseaba la ubicación | Agregar `parseUbicacion()` para extraer componentes |
| La atención de requerimiento no encontraba insumos | salidaQtys keyeado por nombre | Usar `insumoId \|\| insumo` como key |
| Las alertas no se calculaban para nuevos insumos | alerts usaba solo `insumo` | Usar `ins.id \|\| ins.nombre` como key |
| Selector de ubicación en ingreso no validaba límite | Falta de conteo de ocupados | Agregar `filter()` por ubicación + `length` |
| La escena 3D no renderizaba en algunos navegadores | WebGL no disponible | Configurar cámara y luces por defecto |
| Modal sin botones de confirmar al atender | Refactor del Modal sin migrar footer | Agregar prop `footer` al modal |
| Página en blanco al atender req parcial | Backend devuelve `detalle`, código accedía `insumos` | Usar `a.insumos \|\| a.detalle` |
| Requerimiento no encontrado al atender | `useParams().id` string vs `r.id` numérico | Convertir con `Number(id)` |

---

## 6. Conclusiones y Recomendaciones

### Logros alcanzados

1. **Sistema funcional completo**: Se implementaron 13 páginas web, 9 módulos de API REST y 10 tablas en PostgreSQL que cubren todo el flujo operativo del almacén, desde el registro de lotes hasta el dashboard ejecutivo.

2. **Arquitectura de tres capas implementada**: Frontend (React), Backend (Express) y Base de datos (PostgreSQL) completamente integrados y funcionales. La comunicación frontend-backend se realiza mediante Axios con transformación automática de datos.

3. **Visualización 3D innovadora**: Se desarrolló una representación tridimensional interactiva del almacén con navegación por teclado, selección de ubicaciones y paneles de información contextual.

4. **Gestión inteligente de inventario**: El sistema implementa alertas dinámicas de stock bajo (calculadas mediante consultas SQL), método FEFO para despachos con transacciones ACID, y atención parcial de requerimientos con trazabilidad completa.

5. **API REST transaccional**: La atención de requerimientos se ejecuta dentro de transacciones con bloqueo de filas (`SELECT ... FOR UPDATE`), garantizando consistencia en operaciones concurrentes.

6. **Control de acceso basado en roles**: Tres roles con permisos diferenciados validados tanto en frontend (rutas protegidas, navegación filtrada) como en backend (validación de credenciales y estado activo).

### Dificultades enfrentadas

1. **Complejidad de la visualización 3D**: La creación de la escena Three.js con 120 posiciones de racks, postes, bandejas y la navegación por teclado requirió un diseño cuidadoso de coordenadas y lógica de GridCursor.

2. **Manejo de IDs vs nombres**: La transición de usar nombres de insumos como identificadores a usar IDs requirió actualizar múltiples componentes y funciones del store.

3. **Atención parcial de requerimientos**: El diseño del flujo de atención parcial (acumular atendido, manejar historial con JSONB, calcular estado automático) fue iterativo hasta lograr un comportamiento correcto en todos los escenarios.

4. **Consistencia en operaciones concurrentes**: La atención simultánea del mismo requerimiento requería bloquear filas para evitar condiciones de carrera, lo que se resolvió con transacciones y `SELECT FOR UPDATE`.

5. **Type mismatch entre frontend y backend**: Los IDs numéricos de PostgreSQL vs strings en URL params causaban errores difíciles de depurar.

### Lecciones aprendidas

1. **Desarrollo iterativo con prototipos**: Comenzar con un prototipo funcional permitió validar la lógica de negocio antes de implementar el backend completo.

2. **React Context para estado mediano**: Para una aplicación de este tamaño, Context API con hooks resultó suficiente y más simple que Redux.

3. **Transformación automática de datos**: El interceptor de Axios para convertir snake_case a camelCase eliminó errores de mapeo manual y simplificó el código del frontend.

4. **Transacciones en el backend**: Para operaciones críticas (despacho de inventario), las transacciones con bloqueo de filas son esenciales para mantener la integridad de los datos.

### Recomendaciones para mejoras futuras

1. **Hash de contraseñas**: Implementar bcrypt para almacenar contraseñas de forma segura.

2. **Autenticación JWT**: Implementar tokens JWT para sesiones stateless y mayor seguridad.

3. **Pruebas automatizadas**: Agregar pruebas unitarias con Vitest, pruebas de API con Supertest y pruebas E2E con Playwright.

4. **Módulo de reportes**: Añadir generación de reportes PDF (inventario, movimientos, alertas).

5. **Notificaciones en tiempo real**: Implementar WebSockets para notificaciones de nuevas alertas y requerimientos.

6. **Código QR en lotes**: Generar códigos QR para cada lote que permitan escanear y consultar información rápidamente.

7. **Internacionalización**: Preparar el sistema para soportar múltiples idiomas.

8. **Modo offline**: Usar Service Workers para permitir operaciones básicas sin conexión.

---

## 7. Bibliografía

- React 19 Documentation. *https://react.dev/*
- Vite Documentation. *https://vite.dev/*
- Tailwind CSS v4 Documentation. *https://tailwindcss.com/*
- Three.js Documentation. *https://threejs.org/docs/*
- React Three Fiber Documentation. *https://docs.pmnd.rs/react-three-fiber/*
- PostgreSQL Documentation. *https://www.postgresql.org/docs/*
- Express Documentation. *https://expressjs.com/*
- node-postgres (pg) Documentation. *https://node-postgres.com/*
- Lucide Icons. *https://lucide.dev/*
- Axios Documentation. *https://axios-http.com/*
- React Router Documentation. *https://reactrouter.com/*
- ESLint Documentation. *https://eslint.org/*

---

## 8. Anexos

### A. Manual de Usuario

Ver archivo: [`manual-de-usuario.md`](./manual-de-usuario.md)

### B. Manual Técnico

Ver archivo: [`manual-tecnico.md`](./manual-tecnico.md)

### C. Código fuente completo

| Componente | Ubicación |
|---|---|
| Frontend | `frontend/src/` |
| Backend | `backend/src/` |
| Base de datos | `database/db.sql` |

### D. Esquema de base de datos (`database/db.sql`)

El archivo `database/db.sql` contiene:
- 10 tablas con restricciones de integridad (PK, FK, CHECK, UNIQUE)
- Secuencia auto-incremental para códigos de lote
- Columna generada para estado del inventario
- Índices en columnas de búsqueda frecuente
- Seed data completa (3 usuarios, 10 insumos, 120 ubicaciones, 30 lotes, 7 requerimientos, 2 alertas, 10 tareas)

### E. Configuración del proyecto

- **`frontend/package.json`**: Dependencias y scripts del frontend.
- **`frontend/vite.config.js`**: Configuración de Vite (React + Tailwind).
- **`frontend/eslint.config.js`**: Reglas de linting.
- **`frontend/index.html`**: Punto de entrada HTML con fuente Inter.
- **`backend/package.json`**: Dependencias y scripts del backend.
- **`backend/.env`**: Variables de entorno (PORT, DATABASE_URL).

### F. Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Jefe de Almacén | maria@qorifoods.com | jefe123 |
| Supervisor de Almacén | pedro@qorifoods.com | super123 |
| Operario de Almacén | carlos@qorifoods.com | operario123 |

### G. API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/insumos` | Listar insumos |
| POST | `/api/insumos` | Crear insumo |
| PUT | `/api/insumos/:id` | Actualizar insumo |
| GET | `/api/lotes` | Listar lotes (con filtros) |
| POST | `/api/lotes` | Crear lote |
| GET | `/api/requerimientos` | Listar requerimientos |
| GET | `/api/requerimientos/:id` | Obtener requerimiento |
| POST | `/api/requerimientos` | Crear requerimiento |
| POST | `/api/requerimientos/:id/atender` | Atender (transaccional) |
| GET | `/api/usuarios` | Listar usuarios |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| PATCH | `/api/usuarios/:id/toggle-active` | Activar/desactivar |
| GET | `/api/tareas` | Listar tareas |
| POST | `/api/tareas` | Crear tarea |
| PATCH | `/api/tareas/:id/toggle` | Toggle estado |
| GET | `/api/alertas` | Alertas computadas |
| POST | `/api/alertas/atender` | Atender alerta |
| GET | `/api/dashboard` | KPIs del dashboard |
| GET | `/api/ubicaciones` | Listar ubicaciones |

### H. Componentes de la interfaz

| Componente | Archivo | Tipo |
|---|---|---|
| AppShell | `frontend/src/components/app-shell.jsx` | Layout |
| Sidebar | `frontend/src/components/sidebar.jsx` | Layout |
| Topbar | `frontend/src/components/topbar.jsx` | Layout |
| ActionButton | `frontend/src/components/ui/action-button.jsx` | UI |
| Field | `frontend/src/components/ui/form-field.jsx` | UI |
| TextInput | `frontend/src/components/ui/form-field.jsx` | UI |
| SelectInput | `frontend/src/components/ui/form-field.jsx` | UI |
| TextArea | `frontend/src/components/ui/form-field.jsx` | UI |
| Modal | `frontend/src/components/ui/modal.jsx` | UI |
| Badge | `frontend/src/components/ui/status-badge.jsx` | UI |
| TaskRow | `frontend/src/components/task-row.jsx` | UI |
| ToastContainer | `frontend/src/components/toast-container.jsx` | UI |
| WarehouseScene | `frontend/src/components/warehouse-3d/warehouse-scene.jsx` | 3D |
| WarehousePanel | `frontend/src/components/warehouse-3d/warehouse-panel.jsx` | 3D |
