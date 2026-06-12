# Cómo funciona WMS Qori Foods

## Arquitectura general

Esto es una **SPA (Single Page Application)** hecha con React. Todo corre en el frontend.
El backend existe como proyecto separado (Express en `/backend`), pero **actualmente solo tiene un endpoint de prueba** (`GET /` que devuelve un JSON). Toda la data real vive en memoria del lado del cliente usando Context API. Cuando en el futuro se conecte el backend, los datos se traerán desde la base de datos PostgreSQL.

## Stack actual

- **Vite 8** como empaquetador y servidor de desarrollo
- **React 19** con JavaScript puro (nada de TypeScript)
- **React Router DOM v7** para las rutas
- **Tailwind CSS v4** con `@tailwindcss/vite` para los estilos
- **lucide-react** para los íconos
- **clsx + tailwind-merge** para la función utilitaria `cn()`

## Flujo de la aplicación

1. El usuario entra a la app y ve el **login**.
2. Ingresa correo y contraseña. El sistema busca al usuario en el arreglo `USERS` de `data.js`. Si coincide y está activo, lo guarda en el contexto (`currentUser`).
3. Redirige a `/inicio`. Ahí el `AppShell` detecta el rol del usuario y renderiza la sidebar con las opciones que le corresponden.
4. Cada página tiene un `allowedRoles`. Si el usuario no tiene ese rol, lo redirige al inicio.
5. El usuario puede cerrar sesión desde la sidebar (modal de confirmación).

## Sistema de roles

Hay 3 roles fijos. Cada uno ve una barra de navegación distinta y tiene acceso a distintas páginas:

| Rol | Label | Puede ver |
|---|---|---|
| `jefe` | Jefe de Almacén | Inicio, Registrar Insumo, Consulta de Inventario, Gestión de Usuarios, Asignar Responsabilidades |
| `supervisor` | Supervisor de Almacén | Inicio, Gestión de Requerimientos, Consulta de Inventario, Alertas y Monitoreo |
| `operario` | Operario de Almacén | Inicio, Registrar Ingreso de Lote, Gestión de Requerimientos, Consulta de Inventario |

Los roles están definidos en `lib/nav.js` (la navegación) y `lib/types.js` (los labels).

Además, ciertos componentes dentro de una página cambian según el rol. Por ejemplo:
- En la página de Requerimientos, solo el **supervisor** ve el botón "Nuevo Requerimiento"; solo el **operario** puede atender requerimientos pendientes.
- En Alertas, solo el **supervisor** ve y atiende alertas.
- En Gestión de Usuarios y Responsabilidades, solo entra el **jefe**.

## Carpeta `lib/` — Lógica compartida

### `data.js`
Contiene todos los datos mock del sistema: usuarios, insumos, ubicaciones, inventario, requerimientos, alertas y tareas. Cuando el backend esté listo, estos datos se reemplazarán por llamadas API. Por ahora cada usuario tiene una contraseña en texto plano para simular el login.

### `store.jsx`
El corazón del estado global. Usa Context API (`createContext`) para compartir datos entre todos los componentes sin necesidad de prop drilling.

**Qué contiene el contexto:**
- **Datos:** `currentUser`, `users`, `inventory`, `insumos`, `requirements`, `alerts`, `tasks`, `toasts`
- **Funciones de autenticación:** `login()`, `logout()`
- **Funciones CRUD:** `addInsumo()`, `updateInsumo()`, `addUser()`, `assignTask()`, `completeTask()`, `attendRequirement()`, `attendAlert()`, `toggleUserActive()`
- **Utilidades:** `addToast()`, `dismissToast()`
- **Derivados:** `activeAlertCount`, `pendingReqCount` (valores calculados con `useMemo`)

Cada función que modifica datos usa `useCallback` para evitar renders innecesarios. Las operaciones mutan el estado "en memoria" — cuando llegue el backend, estas funciones harán `fetch`/`axios` en vez de modificar arreglos locales.

### `nav.js`
Define los ítems del menú lateral con su ícono, label y ruta. Luego los agrupa por rol en `NAV_BY_ROLE`. La sidebar lee esta constante para saber qué mostrar según `currentUser.role`.

### `types.js`
Constantes runtime, como `ROLE_LABEL` que mapea cada rol a su nombre legible. No hay TypeScript, así que esto reemplaza los tipos/enums.

### `utils.js`
Tres funciones utilitarias:
- `cn()` — Combina clases de Tailwind condicionalmente (wrapper de clsx + tailwind-merge)
- `fmt()` — Formatea números con separadores de miles (locale `es-PE`)
- `qty()` — Concatena número formateado + unidad (ej: "1 200 kg")

## Carpeta `components/` — Componentes reutilizables

### `app-shell.jsx`
El layout principal de todas las páginas protegidas. Renderiza la sidebar, el topbar, el contenido (`children`) y el contenedor de toasts. También maneja el modal de confirmación de cierre de sesión. Verifica que el usuario actual tenga el rol permitido para la página (`allowedRoles`).

### `sidebar.jsx`
Menú lateral fijo (60 de ancho). Muestra el logo de Qori, el nombre del sistema, los enlaces de navegación según el rol del usuario, y un recuadro inferior con el avatar (iniciales), nombre, rol y botón de cerrar sesión.

### `topbar.jsx`
Barra superior fija. Muestra el título de la página actual y, para jefe/supervisor, una campanita con el contador de alertas activas. Al hacer clic en la campana navega a `/alertas`.

### `task-row.jsx`
Fila de tarea con checkbox para marcar como completada/pendiente. Se usa en la página de Inicio.

### `toast-container.jsx`
Renderiza las notificaciones temporales (toasts) en la esquina superior derecha. Cada toast se auto-destruye a los 4 segundos.

### `ui/action-button.jsx`
Botón con variantes visuales: `primary` (default), `ghost`, `danger`, `outline`. Soporta `fullWidth`.

### `ui/form-field.jsx`
Componentes de formulario reutilizables: `Field` (label + error), `TextInput`, `SelectInput`, `TextArea`. Todos tienen manejo de estado `invalid` para mostrar errores.

### `ui/modal.jsx`
Modal genérico con overlay, título, contenido y `ModalFooter`. Se controla con prop `open`. Cierra al hacer clic fuera.

### `ui/status-badge.jsx`
Etiqueta de estado con colores predefinidos: `amber`, `green`, `red`, `blue`, `navy`, `gray`.

## Carpeta `pages/` — Las vistas del sistema

### `login.jsx`
Pantalla de inicio de sesión con logo, formulario de correo/contraseña y validación contra los usuarios mock. Maneja 2 errores: credenciales incorrectas y cuenta inactiva. Si ya hay sesión, redirige a `/inicio`.

### `inicio.jsx`
Dashboard principal. Muestra contenido diferente según el rol:
- **Operario:** "Buenos días" + sus tareas pendientes.
- **Supervisor:** Lo mismo + KPIs de alertas activas y requerimientos pendientes.
- **Jefe:** "Buenos días" + KPI de lotes registrados.

### `ingreso.jsx`
Formulario para que el operario registre el ingreso de un lote nuevo: selecciona insumo, ingresa cantidad, fecha de vencimiento, ubicación. Genera automáticamente el código de lote correlativo y autocompleta el proveedor según el insumo. Por ahora solo muestra un toast de éxito, no persiste el lote en el inventario (es solo UI).

### `inventario.jsx`
Consulta de inventario agrupado por insumo. Filtros por insumo, ubicación y estado de stock. Muestra tabla con cantidad total, punto de reorden, estado y un botón para ver los lotes individuales en un drawer lateral. También tiene un toggle para mostrar el inventario vacío (demo).

### `requerimientos.jsx`
Listado de requerimientos de producción con su estado. El supervisor puede crear nuevos; el operario puede atender los pendientes. Tabla con N° de req, fechas, registrado por, cantidad de insumos, estado y acciones.

### `nuevo-requerimiento.jsx`
Formulario para que el supervisor cree un requerimiento. Permite agregar múltiples insumos en filas dinámicas, con validación de duplicados, stock cero y cantidades.

### `atender-requerimiento.jsx`
Pantalla para que el operario registre las salidas de un requerimiento. Muestra el stock disponible y sugiere lotes FEFO (First Expiry, First Out). Permite ingresar cantidad parcial. Al confirmar, marca el requerimiento como atendido o parcial.

### `alertas.jsx`
Panel de alertas de reabastecimiento para el supervisor. Lista insumos por debajo del punto de reorden con su déficit y lead time. El supervisor puede atenderlas (simula envío a Compras). Filtro por nombre de insumo.

### `usuarios.jsx`
CRUD de usuarios solo para el jefe. Tabla con nombre, email, rol, estado activo/inactivo. Acciones: editar, desactivar/reactivar. Modal de creación con validación de email duplicado y confirmación de contraseña.

### `responsabilidades.jsx`
Permite al jefe asignar tareas a supervisores y operarios. Muestra una lista de usuarios (excluye al jefe y a los inactivos). Al seleccionar uno, abre un drawer con sus tareas actuales y un formulario para asignar una nueva.

### `insumos-registro.jsx`
CRUD de insumos para el jefe. Formulario para crear nuevos insumos (nombre, proveedor, unidad, ROP) y lista de insumos registrados con botón de editar. Al editar, el formulario se rellena con los datos actuales y permite cambiar nombre, proveedor y ROP.

## Archivos raíz

### `main.jsx`
Punto de entrada. Monta la app React en el DOM con `StrictMode`.

### `App.jsx`
Define el router (BrowserRouter) con todas las rutas. Envuelve todo en `AppProvider` para el contexto. Las rutas protegidas usan `PrivateRoute` que redirige al login si no hay `currentUser`.

### `index.css`
Estilos globales con Tailwind CSS v4. Define los tokens de diseño (`@theme`) con los colores de la marca Qori Foods: marrón (#6b2d1f) como color principal, dorado (#c8922a) como accent, y derivados para sidebar, estados (success, warning, critical), etc.

### `vite.config.js`
Configuración de Vite: plugin de React y plugin de Tailwind CSS v4.

## El componente que no existe (pero se usa)

El `SelectInput` tiene un SVG inline en estilo `backgroundImage` para el ícono de flecha del select. Está hardcodeado porque Tailwind v4 no incluye utilidades para íconos nativos de select.

## Cómo se agrega una página nueva

1. Crear el archivo en `pages/`.
2. Envolver el contenido en `<AppShell title="..." allowedRoles={[...]}>`.
3. Agregar la ruta en `App.jsx`.
4. Si la página debe aparecer en la navegación, agregar el ítem en `nav.js` e incluirlo en el arreglo del rol correspondiente.

## Si se conecta el backend

Cada función en `store.jsx` que hoy modifica un arreglo local deberá cambiarse para hacer peticiones HTTP (axios o fetch). Por ejemplo:

```js
// Hoy
const addInsumo = useCallback((insumo) => {
  setInsumos((ins) => [...ins, insumo])
}, [])

// Mañana
const addInsumo = useCallback(async (insumo) => {
  const res = await axios.post('/api/insumos', insumo)
  setInsumos((ins) => [...ins, res.data])
}, [])
```

Las credenciales de login también se validarían contra el backend en vez de buscar en `USERS` local.

---

## Contexto para la IA al abrir una nueva terminal de opencode

Cuando inicies una nueva sesión de opencode y quieras que la IA entienda tu proyecto, copia y pega este bloque:

```
Trabajamos en WMS Qori Foods, un sistema web de gestión de almacén de insumos (frontend en React 19 + Vite 8 + Tailwind CSS v4, JavaScript puro, sin TypeScript). El proyecto está en C:\Users\FREDDY\Documents\wms-qorifoods.

Stack: React 19, Vite 8, React Router DOM v7, Tailwind CSS v4, lucide-react, clsx + tailwind-merge.

Estructura del frontend:
- src/lib/ → data.js (datos mock), store.jsx (Context API con estado global), nav.js (navegación por rol), types.js (constantes), utils.js (cn, fmt, qty)
- src/components/ → app-shell.jsx (layout con sidebar+topbar), sidebar.jsx, topbar.jsx, task-row.jsx, toast-container.jsx, ui/ (action-button, form-field, modal, status-badge)
- src/pages/ → login, inicio, ingreso, inventario, requerimientos, nuevo-requerimiento, atender-requerimiento, alertas, usuarios, responsabilidades, insumos-registro
- src/App.jsx (router), main.jsx (entry point), index.css (Tailwind + tokens), vite.config.js

Roles del sistema: jefe (Jefe de Almacén), supervisor (Supervisor de Almacén), operario (Operario de Almacén). Cada rol ve distintas pantallas y botones según NAV_BY_ROLE en nav.js.

Datos: todo en memoria vía Context API. No hay backend real aún. Los usuarios mock están en data.js con contraseñas en texto plano.
Login valida contra USERS local buscando por email y comparando password.

Usuarios de prueba: maria@qorifoods.com / jefe123 (jefe), pedro@qorifoods.com / super123 (supervisor), carlos@qorifoods.com / operario123 (operario), luis@qorifoods.com / operario123 (operario), ana@qorifoods.com / super123 (inactivo).

El logo está en public/images/LOGO-QORI.png.
Los estilos usan colores personalizados definidos como variables CSS en index.css (brand: #6b2d1f, primary: #c8922a).
El archivo funcionamiento.md explica cómo funciona todo. ayudadocumento.md tiene el detalle de funcionalidades por pantalla.
```
