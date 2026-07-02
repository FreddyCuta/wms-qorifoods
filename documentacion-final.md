# Documentación Final del Proyecto de Software

## WMS Qori Foods — Sistema de Gestión de Almacén de Insumos

---

|                         |                                                         |
|-------------------------|---------------------------------------------------------|
| **Universidad**         | [Nombre de la universidad]                              |
| **Facultad**            | [Nombre de la facultad]                                 |
| **Curso**               | Ingeniería de Software                                  |
| **Nombre del proyecto** | WMS Qori Foods — Sistema de Gestión de Almacén de Insumos |
| **Integrantes**         | [Nombres de los integrantes]                            |
| **Docente**             | [Nombre del docente]                                    |
| **Fecha de entrega**    | Julio 2026                                              |

---

## Resumen Ejecutivo

**WMS Qori Foods** es un sistema web de gestión de almacenes (WMS) desarrollado para la empresa Qori Foods, dedicada a la producción de alimentos. El sistema permite controlar el inventario de materias primas mediante el registro de lotes, la gestión de requerimientos de producción, la consulta de existencias en tiempo real y la visualización tridimensional del almacén.

El sistema fue desarrollado con **React 19** y **Vite 8** en el frontend, utilizando **Three.js** para la visualización 3D, **Tailwind CSS v4** para el diseño de interfaz, y **PostgreSQL** como motor de base de datos. Implementa un modelo de acceso basado en roles (Jefe, Supervisor, Operario) con 13 páginas funcionales que cubren todo el ciclo de vida del inventario: desde el ingreso de lotes hasta el despacho para producción, pasando por la generación de alertas automáticas de stock bajo.

El sistema se encuentra en su versión 1.0.0 con el frontend completamente funcional usando datos de demostración, y cuenta con un esquema de base de datos PostgreSQL listo para su implementación en producción.

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
7. Diseñar un modelo de base de datos relacional que garantice la integridad de los datos.
8. Gestionar usuarios conRoles y niveles de acceso diferenciados.

### Alcance y limitaciones del sistema

**Alcance**:

- Gestión completa de lotes de insumos (ingreso, consulta, despacho).
- Requerimientos de producción con atención parcial e historial.
- Catálogo de insumos con proveedores y puntos de reorden.
- Visualización 3D del almacén con navegación interactiva.
- Dashboard ejecutivo con KPIs y tablas de análisis.
- Gestión de usuarios (CRUD, roles, activación/desactivación).
- Asignación de tareas al personal.
- Alertas automáticas de stock bajo.

**Limitaciones**:

- La versión actual (1.0.0) funciona completamente con datos mock; el backend y la conexión a base de datos están pendientes de implementación.
- No incluye integración con sistemas externos (ERP, facturación, etc.).
- La visualización 3D requiere WebGL y puede no funcionar en navegadores antiguos.
- No incluye generación de reportes PDF ni impresión directa.

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

| Actor                    | Descripción                                                  |
|--------------------------|--------------------------------------------------------------|
| **Jefe de Almacén**      | Administra el sistema: usuarios, insumos, tareas, dashboard. |
| **Supervisor de Almacén**| Gestiona requerimientos, monitorea alertas, consulta inventario. |
| **Operario de Almacén**  | Registra ingresos de lotes y atiende requerimientos.         |

### Requisitos funcionales

| ID     | Descripción                                             | Actor        |
|--------|---------------------------------------------------------|--------------|
| RF-01  | Iniciar sesión con correo y contraseña                  | Todos        |
| RF-02  | Cerrar sesión                                           | Todos        |
| RF-03  | Ver página de inicio con contenido según el rol         | Todos        |
| RF-04  | Visualizar dashboard con KPIs                           | Jefe         |
| RF-05  | Registrar un nuevo insumo en el catálogo                | Jefe         |
| RF-06  | Editar un insumo existente                              | Jefe         |
| RF-07  | Registrar ingreso de un nuevo lote                      | Operario     |
| RF-08  | Seleccionar ubicación del lote (pasillo, rack, nivel)   | Operario     |
| RF-09  | Validar capacidad máxima de 5 lotes por nivel           | Operario     |
| RF-10  | Consultar inventario con filtros                        | Todos        |
| RF-11  | Filtrar inventario por insumo, pasillo, rack, nivel     | Todos        |
| RF-12  | Filtrar inventario por estado (normal, bajo, agotado)   | Todos        |
| RF-13  | Ver detalle de lotes de un insumo (panel lateral)       | Todos        |
| RF-14  | Visualizar alertas de stock bajo                        | Supervisor   |
| RF-15  | Atender una alerta de stock bajo                        | Supervisor   |
| RF-16  | Crear un nuevo requerimiento de producción              | Supervisor   |
| RF-17  | Atender un requerimiento (despachar inventario)          | Operario     |
| RF-18  | Atender parcialmente un requerimiento                   | Operario     |
| RF-19  | Aplicar método FEFO en el despacho                      | Operario     |
| RF-20  | Crear un nuevo usuario                                  | Jefe         |
| RF-21  | Editar un usuario existente                             | Jefe         |
| RF-22  | Desactivar/reactivar un usuario                         | Jefe         |
| RF-23  | Asignar una tarea a un miembro del personal             | Jefe         |
| RF-24  | Marcar una tarea como completada                        | Operario     |
| RF-25  | Visualizar el almacén en 3D                             | Todos        |
| RF-26  | Navegar en el almacén 3D con teclado                    | Todos        |
| RF-27  | Seleccionar un lote en la vista 3D                      | Todos        |
| RF-28  | Ver información del lote seleccionado                   | Todos        |

### Requisitos no funcionales

| ID     | Descripción                                                              |
|--------|--------------------------------------------------------------------------|
| RNF-01 | El sistema debe cargar la página principal en menos de 3 segundos.       |
| RNF-02 | La visualización 3D debe renderizar a 30+ FPS en hardware estándar.     |
| RNF-03 | El sistema debe ser responsive (adaptarse a pantallas de escritorio).    |
| RNF-04 | La interfaz debe estar en español (Perú).                                |
| RNF-05 | El sistema debe usar codificación de caracteres UTF-8.                   |
| RNF-06 | Las contraseñas deben almacenarse con hash (bcrypt en backend futuro).   |
| RNF-07 | El código debe seguir el estándar ESLint configurado.                    |
| RNF-08 | La build de producción debe generar archivos optimizados (minificación). |

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
6. El operario confirma y el lote se registra con código único.

**Escenario 2 — Atención de requerimiento (despacho)**:

1. El supervisor crea un requerimiento de producción.
2. El operario abre el requerimiento pendiente.
3. El sistema sugiere lotes a despachar usando FEFO (primero en vencer, primero en salir).
4. El operario ingresa las cantidades a despachar por insumo.
5. Confirma el despacho; el inventario se descuenta y el requerimiento actualiza su estado.

**Escenario 3 — Monitoreo de alertas**:

1. El sistema calcula automáticamente el stock total por insumo.
2. Si un insumo está por debajo de su punto de reorden, se genera una alerta.
3. El supervisor ve las alertas en su página de inicio (campana) y en Alertas.
4. El supervisor atende la alerta, registrando fecha y responsable.

---

## 3. Diseño del Sistema

### Arquitectura general del sistema

El sistema sigue una arquitectura **SPA (Single Page Application)** en el frontend, con el estado gestionado localmente mediante React Context. La comunicación con el backend (futura) será a través de una API REST.

```
┌───────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                │
│                    (Frontend React)                    │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │  Páginas  │  │Componente│  │   Visualización 3D  │  │
│  │  (13)     │  │s UI (7)  │  │  (Three.js + R3F)   │  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
│                        │                               │
│              ┌─────────▼─────────┐                    │
│              │   App Context     │                    │
│              │   (Estado Global) │                    │
│              └─────────┬─────────┘                    │
│                        │                               │
│              ┌─────────▼─────────┐                    │
│              │   Axios (API)     │                    │
│              └───────────────────┘                    │
└───────────────────────────┬───────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────┐
│                    CAPA DE NEGOCIO                     │
│                  (Futuro Backend)                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │  Rutas   │  │Middleware│  │    Servicios        │  │
│  │  REST    │  │(Auth,etc)│  │  (Lógica de negocio)│  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
│                        │                               │
│              ┌─────────▼─────────┐                    │
│              │   PostgreSQL      │                    │
│              │   (10 tablas)     │                    │
│              └───────────────────┘                    │
└───────────────────────────────────────────────────────┘
```

### Diseño de interfaces

El sistema cuenta con 13 interfaces principales más componentes modales y paneles laterales. El diseño sigue una paleta de colores corporativa con los tonos característicos de Qori Foods:

- **Primario**: Dorado (`#c8922a`)
- **Marca**: Marrón oscuro (`#6b2d1f`)
- **Fondo sidebar**: Marrón oscuro con acentos dorados
- **Estados**: Verde (éxito), Ámbar (advertencia), Rojo (crítico), Azul (informativo)

**Principales pantallas**:

1. **Login**: Panel dividido (marca a la izquierda, formulario a la derecha).
2. **Inicio por rol**: Tarjetas de tareas pendientes + indicadores.
3. **Dashboard**: 5 KPIs + tabla de existencias expandible + vencimientos + gráfico de barras + requerimientos activos + actividad del equipo.
4. **Registro de lote**: Formulario con selector de ubicación en 3 dropdowns + botón para selector 3D + indicador de ocupación.
5. **Consulta de inventario**: Tabla agrupada por insumo + 5 filtros (insumo, pasillo, rack, nivel, estado) + panel lateral de lotes.
6. **Requerimientos**: Tabla con estado + acciones por rol.
7. **Atención de requerimiento**: Formulario por insumo con sugerencia FEFO + historial de atenciones + modal de confirmación.
8. **Alertas**: Lista con indicador de déficit + modal de atención.
9. **Usuarios**: Tabla + 3 modales (crear, editar, desactivar).
10. **Responsabilidades**: Tarjetas de personal + panel lateral de tareas + formulario de asignación.
11. **Insumos**: Formulario de registro + lista con edición.
12. **Almacén 3D**: Canvas Three.js + panel de información + HUD de posición.
13. **Insumos registro**: Formulario + lista editable.

### Diagramas relevantes

**Diagrama de flujo — Registro de lote**:

```
[Inicio] → Seleccionar insumo → Ingresar cantidad y vencimiento
    ↓
Seleccionar ubicación (Pasillo / Rack / Nivel)
    ↓
¿Nivel tiene < 5 lotes? → No → [Error: "Nivel lleno"] → Volver
    ↓ Sí
[Confirmar] → [Lote registrado] → [Fin]
```

**Diagrama de flujo — Atención de requerimiento**:

```
[Inicio] → Seleccionar requerimiento pendiente
    ↓
Por cada insumo solicitado:
    → Calcular cantidad pendiente (solicitado - atendido)
    → Buscar lotes FEFO (ordenados por vencimiento ascendente)
    → Operario ingresa cantidad a despachar (≤ disponible)
    ↓
[Confirmar despacho]
    → Descontar inventario de lotes (FEFO)
    → Actualizar atendido acumulado por insumo
    → Registrar atención en historial
    → Calcular nuevo estado (atendido / parcial / pendiente)
    ↓
[Fin]
```

**Diagrama de secuencia — Creación de requerimiento**:

```
Supervisor                Frontend                    Store (Context)
    │                         │                            │
    │── Navega a /requerimientos/nuevo ──>│                            │
    │<── Formulario vacío ──────────│                            │
    │── Completa datos ───────────────>│                            │
    │── Hace clic en "Registrar" ──>│                            │
    │                         │── addRequirement(req) ──>│
    │                         │                            │── Agrega a lista
    │                         │<── OK ───────────────────│
    │<── Toast "Requerimiento registrado" ──│                            │
    │<── Redirige a /requerimientos ──│                            │
```

---

## 4. Implementación del Sistema

### Tecnologías utilizadas

| Categoría       | Tecnología                      | Versión   | Propósito                        |
|-----------------|---------------------------------|-----------|----------------------------------|
| Lenguaje        | JavaScript (ES2022+)            | —         | Lógica del frontend              |
| UI Framework    | React                           | ^19.2.6   | Componentes de interfaz          |
| Router          | React Router DOM                | ^7.17.0   | Navegación SPA                   |
| Build Tool      | Vite                            | ^8.0.12   | Empaquetado y dev server         |
| CSS Framework   | Tailwind CSS                    | ^4.3.0    | Estilos utilitarios              |
| 3D Engine       | Three.js                        | ^0.184.0  | Renderizado 3D                   |
| React 3D        | @react-three/fiber              | ^9.6.1    | Integración React + Three.js     |
| Drei (helpers)  | @react-three/drei               | ^10.7.7   | OrbitControls, Text, Html, etc.  |
| Iconos          | Lucide React                    | ^1.17.0   | Iconos vectoriales               |
| Utilidades      | clsx + tailwind-merge           | 2.1.1/3.6 | Manejo de clases CSS             |
| HTTP Client     | Axios                           | ^1.17.0   | Cliente HTTP (futuro backend)    |
| Base de datos   | PostgreSQL                      | 15+       | Persistencia de datos            |
| Linter          | ESLint                          | ^10.3.0   | Calidad de código                |
| Animaciones     | tw-animate-css                  | ^1.4.0    | Animaciones CSS                  |

### Estructura general del código

Ver sección 4 del **Manual Técnico del Sistema** para la estructura completa de carpetas.

### Fragmentos clave de código

**Gestión de estado global (`store.jsx`)**:
```jsx
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [inventory, setInventory] = useState(INVENTORY)
  const [insumos, setInsumos] = useState(INSUMOS)
  // ... más estado ...

  // Alerta dinámica computada del inventario
  const alerts = useMemo(() => {
    const stockPorInsumo = {}
    inventory.forEach((lot) => {
      const key = lot.insumoId || lot.insumo
      stockPorInsumo[key] = (stockPorInsumo[key] || 0) + lot.cantidad
    })
    return insumos
      .filter((ins) => (stockPorInsumo[ins.id || ins.nombre] || 0) < ins.puntoReorden)
      .map((ins) => ({ /* ... */ }))
  }, [inventory, insumos, attendedAlerts])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
```

**Renderizado de racks 3D (`warehouse-scene.jsx`)**:
```jsx
const PASILLO_Z = { A: -6, B: -2, C: 2, D: 6 }
const BAY_X = { 1: -10, 2: -6, 3: -2, 4: 2, 5: 6, 6: 10 }
const NIVEL_Y = { 1: 0.07, 2: 0.57, 3: 1.07, 4: 1.57, 5: 2.07 }

function RackRow({ position, rowLetter }) {
  return (
    <group position={position}>
      {/* Postes verticales en cada intersección */}
      {UPRIGHT_X.map((ux) => (
        <mesh position={[ux, POST_H / 2, zOff]} castShadow>
          <boxGeometry args={[0.08, POST_H, 0.08]} />
          <meshStandardMaterial color="#5a4a3e" />
        </mesh>
      ))}
      {/* Bandejas (shelves) por nivel */}
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

**Selector de ubicación con capacidad (`ingreso.jsx`)**:
```jsx
const ocupados = inventory.filter(
  (l) => l.ubicacion === `Pasillo ${pasillo} – Rack ${rack} – Nivel ${nivel}`
).length
const libres = 5 - ocupados
```

### Conectividad con base de datos

El esquema de base de datos está definido en `database/db.sql` con 10 tablas:

| Tabla                    | Registros        | Descripción                              |
|--------------------------|------------------|------------------------------------------|
| `usuarios`               | Usuarios del sistema | Autenticación y roles                 |
| `insumos`                | Catálogo         | Materias primas con proveedor y ROP      |
| `ubicaciones`            | 120 (4×6×5)      | Ubicaciones físicas del almacén          |
| `lotes_inventario`       | Inventario       | Lotes con trazabilidad completa          |
| `requerimientos`         | Pedidos          | Solicitudes de producción                |
| `requerimiento_insumos`  | Items del pedido | Insumos solicitados con cantidades       |
| `requerimiento_atenciones`| Historial       | Despachos parciales con detalle JSONB    |
| `tareas`                 | Asignaciones     | Tareas al personal                       |
| `alertas_atendidas`      | Registro         | Alertas de stock bajo atendidas          |

La conexión frontend-base de datos se realizará mediante una API REST (Express + Node.js) que se implementará en la siguiente fase del proyecto.

---

## 5. Pruebas del Sistema

### Plan de pruebas

Se realizaron pruebas funcionales manuales sobre todas las funcionalidades del sistema, abarcando:

1. **Pruebas de autenticación**: Login con credenciales válidas, inválidas y usuario inactivo.
2. **Pruebas de autorización**: Verificación de que cada rol solo accede a sus rutas permitidas.
3. **Pruebas de CRUD**: Creación, lectura, actualización de insumos y usuarios.
4. **Pruebas de registro de lote**: Validación de campos, capacidad máxima por nivel, generación de código.
5. **Pruebas de requerimientos**: Creación, atención parcial, atención completa, duplicados.
6. **Pruebas de inventario**: Filtros combinados, panel lateral de lotes, colores de vencimiento.
7. **Pruebas de alertas**: Cálculo dinámico, atención, persistencia.
8. **Pruebas de tareas**: Asignación, completado, visualización por usuario.
9. **Pruebas de visualización 3D**: Renderizado, navegación por teclado, selección de lotes.
10. **Pruebas de dashboard**: Cálculo de KPIs, tablas expandibles, gráficos.

### Casos de prueba

| ID   | Escenario                          | Input                                            | Resultado esperado                               | Resultado |
|------|------------------------------------|--------------------------------------------------|--------------------------------------------------|-----------|
| CT01 | Login correcto                     | email: maria@qorifoods.com, pass: jefe123         | Redirige a /inicio                               | OK        |
| CT02 | Login incorrecto                   | email: maria@qorifoods.com, pass: wrong           | Mensaje "Credenciales incorrectas"               | OK        |
| CT03 | Login usuario inactivo             | email: ana@qorifoods.com, pass: super123          | Mensaje "Cuenta desactivada"                     | OK        |
| CT04 | Acceso sin sesión                  | Navegar a /dashboard                              | Redirige a /login                                | OK        |
| CT05 | Acceso rol no autorizado           | Operario navega a /usuarios                       | Redirige a /inicio                               | OK        |
| CT06 | Crear insumo                       | Nombre: "Azúcar", Prov: "Agro Sur", Unidad: kg, ROP: 50 | Insumo agregado a la lista               | OK        |
| CT07 | Registrar lote                     | Insumo: Sémola, Cant: 500, Venc: 15/12/2026, Pasillo: A, Rack: 1, Nivel: 2 | Lote registrado con código | OK |
| CT08 | Nivel sin capacidad                | Intentar registrar en nivel con 5 lotes           | Mensaje "Este nivel ya tiene 5 lotes"            | OK        |
| CT09 | Filtro de inventario               | Pasillo: A, Rack: 1                                | Solo lotes en Pasillo A – Rack 1                 | OK        |
| CT10 | Atención parcial de requerimiento | Despachar 50 de 200 kg                            | Estado "parcial", historial registrado           | OK        |
| CT11 | Alerta dinámica                    | Stock < ROP                                       | Alerta visible en página de Alertas              | OK        |
| CT12 | Visualización 3D                   | Abrir /almacen-3d                                  | Escena renderizada con racks y cajas             | OK        |

### Errores encontrados y cómo se resolvieron

| Error                                                | Causa                               | Solución                                        |
|------------------------------------------------------|-------------------------------------|-------------------------------------------------|
| La consulta de inventario no agrupaba por insumoId   | El groupBy usaba solo `insumo`      | Cambiar a `lot.insumoId \|\| lot.insumo`        |
| Filtro de ubicación roto al usar 3 selects           | matchUbic no parseaba la ubicación  | Agregar `parseUbicacion()` para extraer componentes |
| La atención de requerimiento no encontraba insumos   | salidaQtys keyeado por nombre       | Usar `insumoId \|\| insumo` como key            |
| Las alertas no se calculaban para nuevos insumos     | alerts usaba solo `insumo`          | Usar `ins.id \|\| ins.nombre` como key          |
| Selector de ubicación en ingreso no validaba límite  | Falta de conteo de ocupados         | Agregar `filter()` por ubicación + `length`     |
| La escena 3D no renderizaba en algunos navegadores   | WebGL no disponible                 | Configurar cámara y luces por defecto           |

---

## 6. Conclusiones y Recomendaciones

### Logros alcanzados

1. **Sistema funcional completo**: Se implementaron 13 páginas web que cubren todo el flujo operativo del almacén, desde el registro de lotes hasta el dashboard ejecutivo.

2. **Visualización 3D innovadora**: Se desarrolló una representación tridimensional interactiva del almacén que permite a los usuarios navegar y seleccionar ubicaciones de forma intuitiva, con colores que identifican cada tipo de insumo y su estado.

3. **Gestión inteligente de inventario**: El sistema implementa alertas dinámicas de stock bajo (calculadas automáticamente contra el punto de reorden), método FEFO para despachos, y atención parcial de requerimientos con trazabilidad completa.

4. **Arquitectura preparada para escalar**: El esquema de base de datos en PostgreSQL con 10 tablas, claves foráneas, columnas generadas y restricciones CHECK está listo para producción. La separación en capas (frontend/backend/DB) permite escalar cada componente independientemente.

5. **Control de acceso basado en roles**: Tres roles con permisos diferenciados garantizan que cada usuario acceda solo a las funcionalidades que necesita.

6. **Interfaz responsive y corporativa**: Diseño consistente con la identidad de Qori Foods (colores dorado y marrón), componentes UI reutilizables, y adaptabilidad a diferentes tamaños de pantalla.

### Dificultades enfrentadas

1. **Complejidad de la visualización 3D**: La creación de la escena Three.js con 120 posiciones de racks, postes, bandejas, y la navegación por teclado requirió un diseño cuidadoso de las coordenadas y la lógica de GridCursor.

2. **Manejo de IDs vs nombres**: La transición de usar nombres de insumos como identificadores a usar IDs requirió actualizar múltiples componentes y funciones del store para mantener la compatibilidad.

3. **Atención parcial de requerimientos**: El diseño del flujo de atención parcial (acumular `atendido`, manejar historial `atenciones[]`, calcular estado automático) fue iterativo hasta lograr un comportamiento correcto en todos los escenarios.

4. **Validación de capacidad del nivel**: Implementar la regla de negocio "máximo 5 lotes por nivel" requirió sincronizar el selector de ubicación en dropdowns y el selector 3D.

### Lecciones aprendidas

1. **Mock data como primera iteración**: Desarrollar primero con datos mock permitió validar la lógica de negocio y la interfaz antes de implementar el backend, reduciendo el riesgo de cambios costosos.

2. **React Context para estado mediano**: Para una aplicación de este tamaño, Context API con hooks resultó suficiente y más simple que Redux u otras soluciones de estado.

3. **Tailwind v4 + tema inline**: La nueva sintaxis de Tailwind v4 con `@theme inline` simplificó la definición de colores corporativos sin necesidad de archivos de configuración adicionales.

### Recomendaciones para mejoras futuras

1. **Implementar backend REST**: Conectar el frontend al backend Express + PostgreSQL para persistencia real de datos.

2. **Añadir autenticación JWT**: Implementar login con tokens JWT y bcrypt para hash de contraseñas.

3. **Pruebas automatizadas**: Agregar pruebas unitarias con Vitest, pruebas de componentes con React Testing Library y pruebas E2E con Playwright.

4. **Módulo de reportes**: Añadir generación de reportes PDF (inventario, movimientos, alertas).

5. **Notificaciones en tiempo real**: Implementar WebSockets para notificaciones de nuevas alertas y requerimientos.

6. **Modo offline**: Usar Service Workers para permitir operaciones básicas sin conexión.

7. **Código QR en lotes**: Generar códigos QR para cada lote que permitan escanear y consultar información rápidamente.

8. **Internacionalización**: Preparar el sistema para soportar múltiples idiomas.

---

## 7. Bibliografía

- React 19 Documentation. *https://react.dev/*
- Vite Documentation. *https://vite.dev/*
- Tailwind CSS v4 Documentation. *https://tailwindcss.com/*
- Three.js Documentation. *https://threejs.org/docs/*
- React Three Fiber Documentation. *https://docs.pmnd.rs/react-three-fiber/*
- PostgreSQL Documentation. *https://www.postgresql.org/docs/*
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

El código fuente del proyecto se encuentra en el repositorio Git:

- **Frontend**: `frontend/src/`
- **Base de datos**: `database/db.sql`
- **Documentación**: `manual-de-usuario.md`, `manual-tecnico.md`, `documentacion-final.md`

### D. Esquema de base de datos (database/db.sql)

El archivo `database/db.sql` contiene:

- 10 tablas con restricciones de integridad (PK, FK, CHECK, UNIQUE)
- Secuencia auto-incremental para códigos de lote
- Columna generada para estado del inventario
- Índices en columnas de búsqueda frecuente
- Seed data para 120 ubicaciones (4 pasillos × 6 racks × 5 niveles)

### E. Configuración del proyecto

- **`frontend/package.json`**: Dependencias y scripts del proyecto.
- **`frontend/vite.config.js`**: Configuración de Vite (React + Tailwind).
- **`frontend/eslint.config.js`**: Reglas de linting.
- **`frontend/index.html`**: Punto de entrada HTML.

### F. Datos de demostración

El archivo `frontend/src/lib/data.js` contiene datos mock que representan un almacén operativo con:

- 5 usuarios de prueba
- 6 insumos con proveedores
- 30 lotes de inventario
- 4 requerimientos de producción
- 5 tareas asignadas

### G. Componentes de la interfaz

| Componente         | Archivo                                    | Tipo          |
|--------------------|--------------------------------------------|---------------|
| AppShell           | `frontend/src/components/app-shell.jsx`    | Layout        |
| Sidebar            | `frontend/src/components/sidebar.jsx`      | Layout        |
| Topbar             | `frontend/src/components/topbar.jsx`       | Layout        |
| ActionButton       | `frontend/src/components/ui/action-button.jsx` | UI        |
| Field              | `frontend/src/components/ui/form-field.jsx` | UI           |
| TextInput          | `frontend/src/components/ui/form-field.jsx` | UI           |
| SelectInput        | `frontend/src/components/ui/form-field.jsx` | UI           |
| TextArea           | `frontend/src/components/ui/form-field.jsx` | UI           |
| Modal              | `frontend/src/components/ui/modal.jsx`     | UI            |
| Badge              | `frontend/src/components/ui/status-badge.jsx` | UI         |
| TaskRow            | `frontend/src/components/task-row.jsx`     | UI            |
| ToastContainer     | `frontend/src/components/toast-container.jsx` | UI         |
| WarehouseScene     | `frontend/src/components/warehouse-3d/warehouse-scene.jsx` | 3D |
| WarehousePanel     | `frontend/src/components/warehouse-3d/warehouse-panel.jsx` | 3D |
