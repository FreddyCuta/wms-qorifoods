# Cómo funciona WMS Qori Foods

## Arquitectura general

Esto es una **SPA (Single Page Application)** hecha con React. Todo corre en el frontend.
El backend existe como proyecto separado (Express en `/backend`), pero **actualmente solo tiene un endpoint de prueba** (`GET /` que devuelve un JSON). Toda la data real vive en memoria del lado del cliente usando Context API. Cuando en el futuro se conecte el backend, los datos se traerán desde la base de datos PostgreSQL.

## Stack actual

- **Vite 8** como empaquetador y servidor de desarrollo.
- **React 19** con JavaScript puro (nada de TypeScript).
- **React Router DOM v7** para el enrutamiento.
- **Tailwind CSS v4** con `@tailwindcss/vite` para estilos ultra rápidos y modernos.
- **Three.js + @react-three/fiber + @react-three/drei** para la visualización e interactividad del almacén en 3D.
- **lucide-react** para los íconos de la interfaz.
- **clsx + tailwind-merge** para la función utilitaria `cn()`.

## Lógica del almacén

El almacén de WMS Qori Foods es un **almacén de insumos**, no de productos terminados.

- **Entrada de insumos:** Ocurre cuando un operario registra el ingreso de un lote nuevo al almacén (ej: llega un camión con un pedido a proveedores).
- **Salida de insumos:** Ocurre únicamente cuando Producción requiere insumos para su proceso productivo.

Cada insumo tiene **un único proveedor** asociado para simplificar la trazabilidad.

## Flujo de la aplicación

1. El usuario entra a la app y ve el **login**.
2. Ingresa correo y contraseña. El sistema busca al usuario en el estado local. Si coincide y está activo, lo guarda en el contexto (`currentUser`).
3. Redirige a `/inicio`. Ahí el `AppShell` detecta el rol del usuario y renderiza la sidebar con las opciones que le corresponden.
4. Cada página tiene un `allowedRoles`. Si el usuario no tiene ese rol, lo redirige al inicio.
5. El usuario puede cerrar sesión desde la sidebar (modal de confirmación).

## Sistema de roles

Hay 3 roles fijos. Cada uno ve una barra de navegación distinta y tiene acceso a distintas páginas:

| Rol | Label | Descripción |
|---|---|---|
| `jefe` | Jefe de Almacén | Visión general del almacén, gestión de insumos, usuarios y responsabilidades |
| `supervisor` | Supervisor de Almacén | Gestión de requerimientos de producción y atención de alertas de stock |
| `operario` | Operario de Almacén | Registro de ingreso de lotes y atención de requerimientos (salida de insumos) |

### Jefe de Almacén

El jefe tiene acceso al **Dashboard del Almacén** para ver el estado actual del almacén. Sus funciones son:

- **Dashboard (`/dashboard`):** Panel completo con KPIs, estado del inventario, movimientos recientes, lotes próximos a vencer, distribución de stock y resumen del equipo.
- **Registrar Insumo (`/insumosRegistro`):** Agrega nuevos insumos al sistema con su proveedor, unidad de medida y punto de reorden (ROP). También puede editar insumos existentes.
- **Consulta de Inventario (`/inventario`):** Visualiza el stock agrupado por insumo con detalle de lotes.
- **Visualización 3D (`/almacen-3d`):** Representación interactiva del almacén con ubicación de lotes.
- **Gestión de Usuarios (`/usuarios`):** CRUD completo de usuarios del sistema (crear, editar, activar/desactivar).
- **Asignar Responsabilidades (`/responsabilidades`):** Asigna tareas a supervisores y operarios.

### Supervisor de Almacén

El supervisor **NO ve el Dashboard**. Al iniciar sesión, se le muestran sus **pendientes** (tareas asignadas) más KPIs de alertas activas y requerimientos pendientes. Sus funciones son:

- **Registrar Requerimiento de Producción (`/requerimientos/nuevo`):** Cuando Producción necesita insumos, entrega al supervisor un requerimiento manual (en físico). El supervisor lo registra en el sistema con la lista de insumos solicitados.
- **Listado de Requerimientos (`/requerimientos`):** Visualiza todos los requerimientos registrados y su estado (pendiente, parcial, atendido).
- **Atender Alertas (`/alertas`):** El sistema detecta automáticamente cuando un insumo alcanza una cantidad menor a su punto de reorden (ROP) y genera una alerta. El supervisor atiende la alerta, lo que envía un requerimiento de reabastecimiento al área de Compras (Compras se encarga del resto del proceso).
- **Consulta de Inventario (`/inventario`):** Visualiza el stock disponible.
- **Visualización 3D (`/almacen-3d`):** Representación interactiva del almacén.

### Operario de Almacén

El operario **NO ve el Dashboard**. Al iniciar sesión, se le muestran sus **pendientes** (tareas asignadas). Sus funciones son:

- **Registrar Ingreso de Lote (`/ingreso`):** Cuando llega un lote al almacén, registra su ingreso: selecciona el insumo (autocompleta proveedor), ingresa cantidad, fecha de vencimiento, ubicación física. El número de lote se genera automáticamente.
- **Atender Requerimientos de Producción (`/requerimientos/:id/atender`):** Prepara la salida de los insumos solicitados por Producción y registra la salida en el sistema. El sistema sugiere el lote más próximo a vencer (FEFO). Si no hay stock suficiente para completar todo, se puede atender **parcialmente**: el sistema guarda cuánto se despachó (acumulado en `atendido`) y el requerimiento queda como "parcial". Cuando llegue más stock, el operario puede retomar el requerimiento y completar los insumos pendientes.
- **Consulta de Inventario (`/inventario`):** Visualiza el stock disponible.
- **Visualización 3D (`/almacen-3d`):** Representación interactiva del almacén.

## Flujo de Requerimientos (entrada y salida)

1. **Producción** necesita insumos para su proceso. Como no cuenta con sistema propio, genera un requerimiento **manual** (documento físico) con la lista de insumos y cantidades.
2. El **supervisor** recibe el documento y lo registra en el sistema mediante la pantalla "Nuevo Requerimiento".
3. Los **operarios** ven el requerimiento en la lista y lo **atienden**: preparan físicamente los insumos y registran la salida en el sistema.
4. Al registrar la salida, el sistema **descuenta automáticamente** del inventario y actualiza el estado del requerimiento.

### Atención parcial y acumulada

Si no hay stock suficiente para completar la cantidad solicitada de un insumo, el operario puede registrar una **salida parcial**. El sistema:

- **Acumula** la cantidad despachada en el campo `atendido` de cada insumo.
- **Guarda un historial** (`atenciones[]`) con la fecha, hora y responsable de cada atención parcial.
- Marca el requerimiento como **"parcial"**.

Cuando llegue más stock, el operario puede **volver a atender** el mismo requerimiento. El sistema muestra:
- Cuánto se atendió previamente ("Ya atendido: 50 kg")
- Cuánto falta por atender ("Pendiente: 150 kg")
- El historial de atenciones previas con sus fechas

Cuando todos los insumos alcanzan su cantidad solicitada, el requerimiento pasa a **"atendido"** con la fecha y hora de la última atención completada.

## Flujo de Alertas de Reabastecimiento

1. El sistema **calcula automáticamente** el stock total de cada insumo comparándolo con su punto de reorden (ROP).
2. Si el stock total es menor al ROP, se genera una **alerta** visible en la pantalla de Alertas y en la campana de notificaciones del supervisor.
3. El **supervisor** revisa la alerta y la **atiende**, lo que envía una solicitud de reabastecimiento al área de Compras.
4. Compras gestiona la compra con el proveedor correspondiente.
5. Cuando el lote finalmente llega al almacén, el **operario** registra el ingreso.

## Estructura del frontend

### Carpeta `lib/` — Lógica compartida

- **`data.js`:** Contiene datos mock del sistema (usuarios, insumos, ubicaciones, inventario, requerimientos, tareas). Cuando el backend esté listo, estos datos se reemplazarán por llamadas API.
- **`store.jsx`:** Estado global vía Context API. Expone datos y funciones de modificación. Las alertas son calculadas automáticamente en base al inventario y los ROP de cada insumo.
- **`nav.js`:** Define los ítems del menú lateral filtrados por rol en `NAV_BY_ROLE`.
- **`types.js`:** Constantes runtime como `ROLE_LABEL`.
- **`utils.js`:** Funciones utilitarias: `cn()`, `fmt()`, `qty()`, `parseDate()`, `daysUntil()`.

### Carpeta `components/` — Componentes reutilizables

- **`app-shell.jsx`:** Layout principal que envuelve cada página (sidebar + topbar + contenido + toasts).
- **`sidebar.jsx`:** Menú lateral izquierdo con navegación según el rol.
- **`topbar.jsx`:** Barra superior con título de página y campana de alertas (solo supervisor).
- **`toast-container.jsx`:** Notificaciones flotantes temporales.
- **`task-row.jsx`:** Fila de tarea con checkbox de completado.
- **`ui/`:** Componentes base: `ActionButton`, `Field`, `TextInput`, `SelectInput`, `TextArea`, `Modal`, `Badge`.
- **`warehouse-3d/`:** Componentes para la escena 3D del almacén.

### Carpeta `pages/` — Las vistas del sistema

| Ruta | Página | Roles | Descripción |
|---|---|---|---|
| `/` | Login | Público | Inicio de sesión |
| `/inicio` | Inicio | Todos | Dashboard personalizado por rol |
| `/ingreso` | Registrar Ingreso de Lote | operario | Registro de nuevo lote |
| `/inventario` | Consulta de Inventario | Todos | Stock agrupado por insumo |
| `/almacen-3d` | Visualización 3D | Todos | Maqueta interactiva del almacén |
| `/requerimientos` | Gestión de Requerimientos | supervisor, operario | Listado de requerimientos |
| `/requerimientos/nuevo` | Nuevo Requerimiento | supervisor | Crear requerimiento de producción |
| `/requerimientos/:id/atender` | Atender Requerimiento | operario | Registrar salida de insumos |
| `/alertas` | Alertas y Monitoreo | supervisor | Alertas de stock bajo |
| `/usuarios` | Gestión de Usuarios | jefe | CRUD de usuarios |
| `/responsabilidades` | Asignar Responsabilidades | jefe | Asignar tareas |
| `/insumosRegistro` | Registrar Insumo | jefe | CRUD de insumos |
| `/dashboard` | Dashboard | jefe | Panel de análisis |

### Componentes 3D (`warehouse-3d/`)

La maqueta 3D representa el almacén físico con coordenadas:

- **Pasillos (X):** A=-9, B=-3, C=3, D=9
- **Racks (Z):** 1=-4, 2=0, 3=4
- **Niveles (Y):** 1=0.4, 2=1.2, 3=2.0

Cada lote en inventario se representa como una caja coloreada según el tipo de insumo, con altura proporcional al stock y brillo indicador de estado (verde=disponible, naranja=stock bajo, rojo=agotado).

## Usuarios de prueba

| Rol | Nombre | Email | Contraseña | Estado |
|---|---|---|---|---|
| Jefe de Almacén | María Flores | maria@qorifoods.com | jefe123 | Activo |
| Supervisor | Pedro Salas | pedro@qorifoods.com | super123 | Activo |
| Operario | Carlos Quispe | carlos@qorifoods.com | operario123 | Activo |
| Operario | Luis Mamani | luis@qorifoods.com | operario123 | Activo |
| Supervisor | Ana Torres | ana@qorifoods.com | super123 | Inactivo |
