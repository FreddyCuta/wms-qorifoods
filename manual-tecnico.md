# Manual Técnico del Sistema

## WMS Qori Foods — Sistema de Gestión de Almacén de Insumos

|                 |                                         |
|-----------------|-----------------------------------------|
| **Nombre del sistema** | WMS Qori Foods — Almacén de Insumos |
| **Versión**     | 1.0.0                                   |
| **Fecha**       | Julio 2026                              |
| **Equipo desarrollador** | [Nombre del equipo]                |

---

## 1. Introducción

### Objetivo del manual

Este manual técnico está dirigido a desarrolladores, administradores de sistemas y personal de TI encargado de la instalación, configuración, mantenimiento y evolución del sistema WMS Qori Foods. Describe la arquitectura, las tecnologías empleadas, la estructura del código, la base de datos y los procedimientos operativos.

### Audiencia técnica

- Desarrolladores frontend y backend.
- Administradores de bases de datos.
- DevOps y personal de infraestructura.
- Estudiantes de ingeniería de software.

### Alcance del sistema

WMS Qori Foods es un sistema web de gestión de almacenes (WMS) para el control de materias primas. Sus funciones principales son:

- Registro de ingreso de lotes de insumos.
- Gestión de requerimientos de producción (alta, atención parcial, historial).
- Consulta de inventario en tiempo real con filtros multidimensionales.
- Visualización 3D del almacén con navegación por teclado y ratón.
- Dashboard ejecutivo con indicadores KPI.
- Gestión de usuarios, roles y permisos.
- Asignación de tareas al personal.
- Alertas automáticas de stock bajo.
- Catálogo de insumos con proveedores y puntos de reorden.

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
│  │              │  Axios (API)│  <── Pendiente de conexión         │  │
│  │              └─────────────┘                                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────────┘
                           │  HTTP / HTTPS
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│                    SERVIDOR (Futura implementación)                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │              Backend (Express + Node.js)                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │  │
│  │  │  Routes  │ │Middleware│ │ Services │                       │  │
│  │  └──────────┘ └──────────┘ └──────────┘                       │  │
│  │                     │                                           │  │
│  │              ┌──────▼──────┐                                    │  │
│  │              │    ORM      │                                    │  │
│  │              └─────────────┘                                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                           │                                           │
│  ┌────────────────────────▼───────────────────────────────────────┐  │
│  │                    PostgreSQL 15+                              │  │
│  │   10 tablas: usuarios, insumos, ubicaciones, lotes_inventario, │  │
│  │   requerimientos, requerimiento_insumos, requerimiento_        │  │
│  │   atenciones, tareas, alertas_atendidas                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Componentes principales

| Componente    | Tecnología        | Descripción                                              |
|---------------|-------------------|----------------------------------------------------------|
| **Frontend**  | React 19 + Vite 8 | Interfaz de usuario SPA (Single Page Application).       |
| **Estado**    | React Context     | Gestión de estado global con `useState` + `useCallback`. |
| **3D**        | Three.js + R3F    | Visualización tridimensional del almacén.                |
| **API**       | Axios             | Cliente HTTP (pendiente de conectar al backend).         |
| **Backend**   | Node.js + Express | (Futura implementación) API REST.                        |
| **Base de datos** | PostgreSQL 15+ | Base de datos relacional.                                |

### Tecnologías utilizadas

| Categoría       | Tecnología                      | Versión   |
|-----------------|---------------------------------|-----------|
| Lenguaje        | JavaScript (ES2022+)            | —         |
| UI Framework    | React                           | ^19.2.6   |
| Router          | React Router DOM                | ^7.17.0   |
| Build Tool      | Vite                            | ^8.0.12   |
| CSS Framework   | Tailwind CSS                    | ^4.3.0    |
| 3D Engine       | Three.js                        | ^0.184.0  |
| React 3D        | @react-three/fiber              | ^9.6.1    |
| Drei (helpers)  | @react-three/drei               | ^10.7.7   |
| Iconos          | Lucide React                    | ^1.17.0   |
| Utilidades CSS  | clsx + tailwind-merge           | ^2.1.1 / ^3.6.0 |
| HTTP Client     | Axios                           | ^1.17.0   |
| Animaciones CSS | tw-animate-css                  | ^1.4.0    |
| Base de datos   | PostgreSQL                      | 15+       |
| Backend         | (Futuro) Node.js + Express      | —         |

---

## 3. Instalación del Sistema

### Requisitos del servidor (desarrollo)

| Componente       | Especificación mínima           |
|------------------|---------------------------------|
| Procesador       | 2.0 GHz dual-core               |
| Memoria RAM      | 8 GB                            |
| Espacio en disco | 2 GB                            |
| Node.js          | 20.x LTS o superior             |
| npm              | 10.x o superior                 |
| Git              | 2.x                             |

### Dependencias y librerías necesarias

- **Node.js** + **npm**: Plataforma de ejecución y gestor de paquetes.
- **Git**: Control de versiones.

### Pasos para la instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd wms-qorifoods

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Para generar la build de producción
npm run build

# 5. Para previsualizar la build
npm run preview
```

### Variables de entorno

Actualmente el frontend funciona con datos mock (sin backend). Cuando se implemente el backend, se deberá crear un archivo `.env` en la raíz de `frontend/`:

```
VITE_API_URL=http://localhost:3000/api
```

---

## 4. Configuración del Entorno de Desarrollo

### Herramientas necesarias

| Herramienta        | Propósito                              |
|--------------------|----------------------------------------|
| VS Code            | IDE recomendado                        |
| ESLint             | Linter de código (incluido)            |
| React DevTools     | Depuración de componentes React        |
| Three.js DevTools  | Depuración de escenas 3D (opcional)    |
| PostgreSQL (futuro)| Cliente de base de datos               |

### Estructura de carpetas del proyecto

```
wms-qorifoods/
│
├── database/                          # Esquema de base de datos
│   └── db.sql                         # DDL completo (10 tablas + secuencias + seed)
│
├── frontend/                          # Aplicación frontend
│   ├── public/                        # Archivos estáticos
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── images/
│   │       └── LOGO-QORI.png
│   │
│   ├── src/
│   │   ├── main.jsx                   # Entry point
│   │   ├── App.jsx                    # Router + Provider
│   │   ├── index.css                  # Estilos globales + tema Tailwind v4
│   │   │
│   │   ├── images/
│   │   │   └── LOGO-QORI.png
│   │   │
│   │   ├── lib/                       # Lógica compartida
│   │   │   ├── data.js                # Datos mock (usuarios, insumos, inventario, etc.)
│   │   │   ├── store.jsx              # Estado global (Context API)
│   │   │   ├── nav.js                 # Configuración de navegación por rol
│   │   │   ├── types.js               # Constantes de roles
│   │   │   └── utils.js               # Utilidades (formatos, fechas, mapeo insumo)
│   │   │
│   │   ├── pages/                     # Páginas del sistema (rutas)
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
│   │   │
│   │   └── components/                # Componentes reutilizables
│   │       ├── app-shell.jsx           # Layout principal
│   │       ├── sidebar.jsx             # Menú lateral
│   │       ├── topbar.jsx              # Barra superior
│   │       ├── task-row.jsx            # Fila de tarea
│   │       ├── toast-container.jsx     # Contenedor de notificaciones
│   │       │
│   │       ├── ui/                     # Componentes UI atómicos
│   │       │   ├── action-button.jsx
│   │       │   ├── form-field.jsx      # Field, TextInput, SelectInput, TextArea
│   │       │   ├── modal.jsx
│   │       │   └── status-badge.jsx
│   │       │
│   │       └── warehouse-3d/           # Componentes de visualización 3D
│   │           ├── warehouse-scene.jsx  # Escena Three.js
│   │           └── warehouse-panel.jsx  # Panel envolvente con UI overlay
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   └── .gitignore
│
├── manual-de-usuario.md                # Manual de usuario
├── manual-tecnico.md                   # Manual técnico
└── documentacion-final.md              # Documentación final del proyecto
```

### Cómo ejecutar el sistema en modo desarrollo

```bash
cd frontend
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:5173` (o el puerto disponible).

### Lint del código

```bash
npm run lint
```

---

## 5. Base de Datos

### Motor de base de datos

PostgreSQL 15+ con extensión `pgcrypto` para generación de UUIDs.

### Modelo entidad-relación

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   usuarios   │     │   insumos        │     │   ubicaciones    │
├──────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)          │     │ id (PK)          │
│ nombre       │     │ nombre (UNIQUE)  │     │ pasillo (A-D)    │
│ email (UQ)   │     │ proveedor        │     │ rack (1-6)       │
│ password_hash│     │ unidad (kg/L)    │     │ nivel (1-5)      │
│ rol          │     │ punto_reorden    │     │ UNIQUE(p,r,n)    │
│ activo       │     │ lead_time        │     └──────────────────┘
└──────┬───────┘     └──────────────────┘              │
       │                   │                           │
       │                   │                           │
       │    ┌──────────────▼───────────────────────────┼──────────┐
       │    │           lotes_inventario               │          │
       │    ├──────────────────────────────────────────┤          │
       │    │ id (PK)                                  │          │
       ├────┤ insumo_id (FK → insumos)                 │          │
       │    │ codigo_lote (UQ, auto-generado)          │          │
       │    │ cantidad                                  │          │
       │    │ cantidad_inicial                         │          │
       │    │ vencimiento                              │          │
       └────┤ ubicacion_id (FK → ubicaciones)          ◄─────────┘
            │ proveedor                                │
            │ fecha_ingreso                            │
            │ registrado_por_id (FK → usuarios)        │
            │ estado (generado: disponible/bajo/agotado)│
            └──────────────────────────────────────────┘


┌──────────────────┐     ┌───────────────────────────┐
│  requerimientos  │     │  requerimiento_insumos    │
├──────────────────┤     ├───────────────────────────┤
│ id (PK)          │     │ id (PK)                   │
│ numero (UNIQUE)  │     │ requerimiento_id (FK)     │
│ fecha_solicitud  │◄────│ insumo_id (FK → insumos)  │
│ fecha_registro   │     │ cantidad                  │
│ estado           │     │ unidad                    │
│ registrado_por_id│     │ atendido                  │
└──────────────────┘     │ stock_snapshot            │
         │               └───────────────────────────┘
         │
         │    ┌───────────────────────────┐
         │    │ requerimiento_atenciones  │
         │    ├───────────────────────────┤
         └────┤ requerimiento_id (FK)     │
              │ fecha                     │
              │ atendido_por_id (FK → usuarios)
              │ detalle (JSONB)           │
              └───────────────────────────┘

┌──────────────┐     ┌───────────────────────┐
│   tareas     │     │  alertas_atendidas    │
├──────────────┤     ├───────────────────────┤
│ id (PK)      │     │ id (PK)               │
│ asignado_a_id│     │ insumo_id (FK)        │
│ descripcion  │     │ fecha                 │
│ estado       │     │ atendido_por_id (FK)  │
│ creada_en    │     └───────────────────────┘
└──────────────┘
```

### Script de creación (database/db.sql)

El archivo `database/db.sql` contiene el DDL completo con las siguientes características:

- **Generación de UUIDs**: `gen_random_uuid()` de la extensión `pgcrypto`.
- **Columna generada**: `lotes_inventario.estado` es una columna `GENERATED ALWAYS AS ... STORED` que calcula automáticamente el estado del lote (`disponible`, `bajo`, `agotado`) según `cantidad` vs `cantidad_inicial * 0.3`.
- **Secuencia**: `lote_codigo_seq` para generar códigos de lote auto-incrementales (formato: `LOT-YYYY-NNNN`).
- **Seed data**: 120 ubicaciones generadas con `GENERATE_SERIES` + `CROSS JOIN`.
- **Restricciones**: `CHECK` en campos críticos (rol, unidad, rango numérico de rack/nivel, etc.).
- **Índices**: En columnas de búsqueda frecuente (`insumo_id`, `ubicacion_id`, `vencimiento`, `requerimiento_id`, `asignado_a_id`).

### Estrategia de respaldo y recuperación

Se recomienda:

```bash
# Respaldo completo
pg_dump -U <user> -h <host> -d wms_qori > backup_$(date +%Y%m%d).sql

# Restauración
psql -U <user> -h <host> -d wms_qori < backup_20260701.sql
```

---

## 6. Código Fuente

### Estructura del código (Frontend)

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

Define 13 rutas protegidas por `PrivateRoute` (redirige al login si no hay sesión). El layout general es:

```
AppProvider (Context) → BrowserRouter → Routes → AppRoutes
```

Cada ruta renderiza un Page component envuelto en `PrivateRoute`.

#### Gestión de estado global: `src/lib/store.jsx`

Patrón **React Context + hooks**. Expone un `AppProvider` y un hook `useApp()`.

**Estado** (8 variables con `useState`):
| Variable        | Tipo          | Inicialización        |
|-----------------|---------------|-----------------------|
| `currentUser`   | object\|null  | `null`                |
| `users`         | array         | `USERS` (mock)        |
| `inventory`     | array         | `INVENTORY` (mock)    |
| `insumos`       | array         | `INSUMOS` (mock)      |
| `requirements`  | array         | `REQUIREMENTS` (mock) |
| `tasks`         | array         | `TASKS` (mock)        |
| `attendedAlerts`| object        | `{}`                  |
| `toasts`        | array         | `[]`                  |

**Acciones expuestas** (13 funciones):
- Sesión: `login`, `logout`
- Toast: `addToast`, `dismissToast`
- Tareas: `completeTask`, `assignTask`
- Requerimientos: `attendRequirement`, `addRequirement`
- Alertas: `attendAlert` (alerta dinámica computada con `useMemo`)
- Usuarios: `toggleUserActive`, `addUser`, `updateUser`
- Insumos: `addInsumo`, `updateInsumo`
- Inventario: `addLot`

**Estado derivado** (3 valores computados con `useMemo`):
- `alerts`: cruza inventario vs punto de reorden de cada insumo.
- `activeAlertCount`: alertas no atendidas.
- `pendingReqCount`: requerimientos con estado "pendiente".

#### Sistema de rutas: `src/lib/nav.js`

Define 10 ítems de navegación con etiquetas, rutas e íconos Lucide. La navegación visible se filtra por rol:

| Rol         | Ítems visibles                                              |
|-------------|-------------------------------------------------------------|
| `jefe`      | Inicio, Dashboard, Insumos, Inventario, 3D, Usuarios, Tareas |
| `supervisor`| Inicio, Requerimientos, Inventario, 3D, Alertas              |
| `operario`  | Inicio, Ingreso, Requerimientos, Inventario, 3D              |

#### Utilidades: `src/lib/utils.js`

| Función       | Descripción                                          |
|---------------|------------------------------------------------------|
| `cn(...)`     | Combina clases Tailwind con resolución de conflictos |
| `fmt(n)`      | Formato numérico con locale `es-PE`                  |
| `qty(n, unit)`| Formato "cantidad + unidad"                          |
| `parseDate(d)`| Parsea fecha "DD/MM/YYYY" → Date                    |
| `daysUntil(d, from?)` | Días hasta una fecha                          |
| `initInsumoMap(i)` | Inicializa mapas bidireccionales nombre↔ID       |
| `insumoId(nombre)`   | Lookup de ID por nombre de insumo               |
| `insumoName(id)`     | Lookup de nombre por ID de insumo               |

### Descripción de módulos clave

#### Páginas (Pages)

| Archivo                        | Propósito                                              | Rol              |
|--------------------------------|--------------------------------------------------------|------------------|
| `login.jsx`                    | Autenticación de usuarios contra mock DB               | Público          |
| `inicio.jsx`                   | Home role-based con tareas pendientes, KPIs            | Todos            |
| `ingreso.jsx`                  | Registro de lote con selector de ubicación (3D o dropdown) | Operario      |
| `inventario.jsx`               | Consulta con filtros por insumo, pasillo, rack, nivel, estado | Todos        |
| `requerimientos.jsx`           | Lista de requerimientos con acciones                   | Sup., Oper.      |
| `nuevo-requerimiento.jsx`      | Formulario de creación con filas dinámicas             | Supervisor       |
| `atender-requerimiento.jsx`    | Despacho FEFO con atención parcial                     | Operario         |
| `alertas.jsx`                  | Alertas de stock bajo con atención                     | Supervisor       |
| `usuarios.jsx`                 | CRUD de usuarios (crear, editar, desactivar)           | Jefe             |
| `responsabilidades.jsx`        | Asignación de tareas al personal                       | Jefe             |
| `insumos-registro.jsx`         | CRUD de catálogo de insumos                            | Jefe             |
| `almacen-3d.jsx`               | Visualización 3D full-screen con panel de información  | Todos            |
| `dashboard.jsx`                | Dashboard ejecutivo con KPIs, tablas y gráficos        | Jefe             |

#### Componentes UI (ui/)

| Componente       | Archivo               | Props                              |
|------------------|-----------------------|------------------------------------|
| `ActionButton`   | `action-button.jsx`   | `variant?`, `fullWidth?`, `className?` |
| `Field`          | `form-field.jsx`      | `label`, `error?`, `children`      |
| `TextInput`      | `form-field.jsx`      | `invalid?`, `className?`           |
| `SelectInput`    | `form-field.jsx`      | `invalid?`, `className?`, `children`|
| `TextArea`       | `form-field.jsx`      | `invalid?`, `className?`           |
| `Modal`          | `modal.jsx`           | `open`, `onClose`, `title`, `children` |
| `ModalFooter`    | `modal.jsx`           | `children`                         |
| `Badge`          | `status-badge.jsx`    | `color?`, `children`, `className?` |

#### Componentes 3D (warehouse-3d/)

| Componente          | Archivo               | Descripción                                    |
|---------------------|-----------------------|------------------------------------------------|
| `WarehouseScene`    | `warehouse-scene.jsx` | Escena Three.js completa: racks, cajas, cursor |
| `WarehousePanel`    | `warehouse-panel.jsx` | Wrapper con overlays UI, info panel, toolbar   |

#### Layout

| Componente      | Archivo              | Descripción                                  |
|-----------------|----------------------|----------------------------------------------|
| `AppShell`      | `app-shell.jsx`      | Layout principal: Sidebar + Topbar + content  |
| `Sidebar`       | `sidebar.jsx`        | Menú lateral con navegación por rol          |
| `Topbar`        | `topbar.jsx`         | Barra superior con título y campana          |
| `ToastContainer`| `toast-container.jsx`| Notificaciones flotantes                     |

### Puntos de entrada al sistema

1. **`index.html`**: Carga el módulo `src/main.jsx`.
2. **`src/main.jsx`**: Renderiza `<App />` dentro de `<StrictMode>`.
3. **`src/App.jsx`**: Provee el contexto global y configura el router.

---

## 7. APIs / Servicios Web

### Estado actual

El frontend opera completamente con datos mock locales. No hay endpoints de API implementados. La librería **Axios** está instalada y lista para ser utilizada cuando se desarrolle el backend.

### Endpoints planificados

| Método | Ruta                              | Descripción                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/auth/login`                 | Iniciar sesión                       |
| POST   | `/api/auth/logout`                | Cerrar sesión                        |
| GET    | `/api/usuarios`                   | Listar usuarios                      |
| POST   | `/api/usuarios`                   | Crear usuario                        |
| PUT    | `/api/usuarios/:id`               | Actualizar usuario                   |
| PATCH  | `/api/usuarios/:id/toggle`        | Activar/desactivar usuario           |
| GET    | `/api/insumos`                    | Listar insumos                       |
| POST   | `/api/insumos`                    | Crear insumo                         |
| PUT    | `/api/insumos/:id`                | Actualizar insumo                    |
| GET    | `/api/inventario`                 | Listar inventario (con filtros)      |
| POST   | `/api/inventario`                 | Registrar nuevo lote                 |
| GET    | `/api/requerimientos`             | Listar requerimientos                |
| POST   | `/api/requerimientos`             | Crear requerimiento                  |
| POST   | `/api/requerimientos/:id/atender` | Atender requerimiento (despacho)     |
| GET    | `/api/alertas`                    | Listar alertas activas               |
| POST   | `/api/alertas/:id/atender`        | Atender alerta                       |
| GET    | `/api/tareas`                     | Listar tareas                        |
| POST   | `/api/tareas`                     | Asignar tarea                        |
| PATCH  | `/api/tareas/:id/complete`        | Completar tarea                      |
| GET    | `/api/ubicaciones`                | Listar ubicaciones                    |
| GET    | `/api/dashboard/kpi`              | KPIs para dashboard                  |

---

## 8. Seguridad

### Control de accesos y roles

El sistema implementa un modelo básico de control de acceso basado en roles (RBAC):

| Rol         | Nivel de acceso       |
|-------------|-----------------------|
| `jefe`      | Administrativo total  |
| `supervisor`| Operaciones y alertas |
| `operario`  | Tareas operativas     |

**Mecanismos de seguridad actuales (frontend)**:

1. **Ruteo protegido**: `PrivateRoute` en `App.jsx` redirige al login si no hay `currentUser`.
2. **Guard por rol**: `AppShell` recibe `allowedRoles` y redirige a `/inicio` si el rol no está autorizado.
3. **Navegación filtrada**: `Sidebar` solo muestra los ítems permitidos según `NAV_BY_ROLE[role]`.

### Seguridad planificada (backend)

| Medida                 | Implementación prevista           |
|------------------------|-----------------------------------|
| Hash de contraseñas    | bcrypt                            |
| JWT                    | Autenticación stateless           |
| HTTPS                  | Certificado SSL/TLS               |
| Validación de entrada  | Express middleware                 |
| SQL Injection          | Consultas parametrizadas / ORM    |
| CORS                   | Configuración de orígenes         |
| Rate limiting          | express-rate-limit                |

---

## 9. Pruebas Técnicas

### Estado actual

El sistema no cuenta con pruebas automatizadas en esta versión. Se realizaron pruebas manuales de las siguientes funcionalidades:

| Funcionalidad             | Tipo de prueba           | Resultado |
|---------------------------|--------------------------|-----------|
| Inicio de sesión          | Funcional (manual)       | OK        |
| Validación de roles       | Funcional (manual)       | OK        |
| CRUD de insumos           | Funcional (manual)       | OK        |
| Registro de lote          | Funcional + validación   | OK        |
| Atención de requerimiento | Funcional + FEFO         | OK        |
| Atención parcial          | Funcional (manual)       | OK        |
| Filtros de inventario     | Funcional (manual)       | OK        |
| Visualización 3D          | Funcional (manual)       | OK        |
| Navegación por teclado 3D | Funcional (manual)       | OK        |
| Dashboard                 | Funcional (manual)       | OK        |
| Alertas dinámicas         | Funcional (manual)       | OK        |
| CRUD de usuarios          | Funcional + validación   | OK        |
| Asignación de tareas      | Funcional (manual)       | OK        |
| Build de producción       | Compilación (build)      | OK        |

### Herramientas previstas para el futuro

- **Vitest** — Pruebas unitarias para funciones utilitarias y store.
- **React Testing Library** — Pruebas de componentes.
- **Playwright / Cypress** — Pruebas end-to-end.

---

## 10. Mantenimiento y Actualizaciones

### Cómo realizar actualizaciones del sistema

```bash
# 1. Obtener los últimos cambios
git pull origin main

# 2. Actualizar dependencias
cd frontend
npm install

# 3. Verificar que no haya errores de compilación
npm run build

# 4. Ejecutar linter
npm run lint
```

### Procedimientos para solucionar fallas comunes

| Problema                         | Causa probable                   | Solución                                      |
|----------------------------------|----------------------------------|-----------------------------------------------|
| Error de compilación             | Dependencia desactualizada       | `npm install` o borrar `node_modules` + `npm install` |
| Error de dependencia             | Versión incompatible             | Verificar `package.json` y actualizar         |
| La escena 3D no se renderiza     | WebGL no disponible              | Verificar navegador / habilitar WebGL         |
| Rutas no funcionan               | Router mal configurado           | Verificar `App.jsx` y `nav.js`                |
| Estado no persiste               | No hay backend / recarga         | (Normal en versión mock)                      |

### Documentación de cambios (Changelog)

| Versión | Fecha       | Cambios principales                                               |
|---------|-------------|-------------------------------------------------------------------|
| 1.0.0   | Julio 2026  | Versión inicial: frontend completo con datos mock                 |

---

## 11. Anexos

### Configuración de Vite (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Configuración de ESLint (`eslint.config.js`)

Utiliza el formato flat config de ESLint v10 con plugins para React, React Hooks y React Refresh.

### Tema de Tailwind CSS (extracto de `index.css`)

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@theme inline {
  --color-background: #ffffff;
  --color-foreground: #2a211d;
  --color-primary: #c8922a;
  --color-brand: #6b2d1f;
  --color-success: #27ae60;
  --color-warning: #e67e22;
  --color-critical: #c0392b;
  --color-info: #2563eb;
  --color-sidebar: #6b2d1f;
  --color-sidebar-primary: #c8922a;
  --radius-sm: calc(0.5rem * 0.5);
  --radius-md: 0.5rem;
  --radius-lg: calc(0.5rem * 1);
}
```

### Datos mock (estructura completa en `frontend/src/lib/data.js`)

| Exportación   | Tipo   | Cantidad | Propósito                     |
|---------------|--------|----------|-------------------------------|
| `USERS`       | array  | 5        | Usuarios de prueba            |
| `INSUMOS`     | array  | 6        | Catálogo de materias primas   |
| `UBICACIONES` | array  | 120      | Ubicaciones físicas           |
| `INVENTORY`   | array  | 30       | Lotes de inventario           |
| `REQUIREMENTS`| array  | 4        | Requerimientos de producción  |
| `ALERTS`      | array  | 2        | Alertas de stock bajo         |
| `TASKS`       | array  | 5        | Tareas asignadas              |

### Logs de ejemplo (compilación exitosa)

```
vite v8.0.16 building client environment for production...
transforming...✓ 2329 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.62 kB │ gzip:   0.38 kB
dist/assets/index-D8rDVGlk.css     41.44 kB │ gzip:   7.56 kB
dist/assets/index-CE-tZkqt.js   1,426.43 kB │ gzip: 401.30 kB
✓ built in 2.56s
```
