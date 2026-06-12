# WMS Qori Foods — Documentación para redacción del Documento de Interfaces

---

## 1. Resumen del proyecto

**WMS Qori Foods** es un sistema web de gestión de almacén de insumos (Warehouse Management System) para Qori Foods, empresa peruana productora de pasta con quinua orgánica. Es una SPA (Single Page Application) construida con React 19 + Vite 8 + Tailwind CSS v4, con datos en memoria vía Context API. El backend (Express + PostgreSQL) está planeado pero aún no implementado.

### Datos clave del negocio

- **Rol del sistema:** Controlar el ingreso, almacenamiento y salida de insumos para producción de pasta.
- **Usuarios:** 3 roles — Jefe de Almacén, Supervisor de Almacén, Operario de Almacén.
- **Insumos:** Materias primas como sémola de trigo, harina, aceite vegetal, sal, huevos deshidratados, quinua orgánica.
- **Inventario:** Organizado por lotes con código, ubicación física (pasillo/rack/nivel), fecha de vencimiento y cantidad.
- **Requerimientos:** Solicitudes de insumos para producción que deben ser atendidas (despachadas) por el operario.

---

## 2. Funcionalidades del sistema (por pantalla)

### 2.1 Login (`/`)
Pantalla de inicio de sesión con dos columnas:
- **Izquierda:** Fondo marrón (#6b2d1f) con logo de Qori Foods, título "WMS Qori Foods" y subtítulo.
- **Derecha:** Formulario con campos de correo y contraseña, botón "Iniciar sesión", enlace de ayuda.
- Valida contra usuarios mock (5 usuarios precargados).
- Maneja 2 errores: credenciales incorrectas y cuenta inactiva.
- Si ya hay sesión activa, redirige automáticamente al inicio.

### 2.2 Inicio / Dashboard (`/inicio`)
Accesible para todos los roles. El contenido cambia según el rol:

- **Operario:** Saludo personalizado + lista de "Mis Pendientes" (tareas asignadas con checkbox para marcar como completada).
- **Supervisor:** Lo mismo que operario + 2 tarjetas KPI: alertas activas y requerimientos pendientes (con enlaces a las pantallas correspondientes).
- **Jefe:** Saludo + KPI de lotes registrados en inventario.

### 2.3 Registrar Ingreso de Lote (`/ingreso`)
Solo **operario**. Formulario para registrar un nuevo lote en el almacén:
- Seleccionar insumo (dropdown).
- Fecha de ingreso (autocompletada, solo lectura).
- Proveedor (se autocompleta al seleccionar el insumo).
- Número de lote (generado automáticamente: LOT-2026-XXXX).
- Cantidad (numérico con unidad).
- Fecha de vencimiento.
- Ubicación en almacén (dropdown con 6 ubicaciones).
- Registrado por (autocompletado con el usuario actual).
- Validaciones: campos obligatorios, cantidad > 0.
- Actualmente solo muestra toast de éxito (no persiste en inventario).

### 2.4 Consulta de Inventario (`/inventario`)
Accesible para todos los roles. Pantalla de consulta agrupada por insumo:
- **Panel de filtros:** Por insumo (dropdown), ubicación, estado del stock (Normal / Stock bajo / Agotado).
- **Tabla principal:** Insumo, cantidad total disponible, punto de reorden, estado (badge verde/ámbar/rojo), botón "Ver lotes".
- **Drawer lateral:** Al hacer clic en "Ver lotes" se abre un panel con detalle de cada lote: código, cantidad, vencimiento (con color según proximidad), ubicación, fecha de ingreso.
- **Toggle demo:** Botón para alternar entre datos normales y estado vacío.

### 2.5 Gestión de Requerimientos (`/requerimientos`)
Solo **supervisor** y **operario**.
- **Tabla:** N° de requerimiento, fecha de solicitud, fecha de registro, registrado por, cantidad de insumos, estado (Pendiente / Atendido parcialmente / Atendido), acciones.
- **Supervisor:** Ve botón "Nuevo Requerimiento".
- **Operario:** Ve botón "Atender" en requerimientos pendientes/parciales.

### 2.6 Nuevo Requerimiento (`/requerimientos/nuevo`)
Solo **supervisor**. Formulario para crear requerimiento:
- N° de requerimiento (texto libre, valida duplicado con REQ-047).
- Fecha del pedido.
- **Tabla dinámica de insumos:** Varias filas agregables con insumo (dropdown), cantidad solicitada, stock actual disponible, botón eliminar.
- Validación: al menos 1 insumo, cantidades > 0.
- Muestra alerta visual si el stock del insumo es 0.

### 2.7 Atender Requerimiento (`/requerimientos/:id/atender`)
Solo **operario**. Pantalla para registrar salidas de insumos:
- Muestra cada insumo solicitado con su lote sugerido (FEFO — First Expiry First Out), vencimiento, ubicación y stock disponible.
- Input para ingresar cantidad de salida (máximo = cantidad solicitada).
- Badge de estado por fila: Pendiente / Completo / Parcial.
- Alerta si hay stock insuficiente.
- Modal de confirmación con resumen de salidas.
- Al confirmar, marca el requerimiento como "atendido" o "parcial".

### 2.8 Alertas y Monitoreo (`/alertas`)
Solo **supervisor**. Lista de insumos cuyo stock actual está por debajo del punto de reorden:
- Filtro por nombre de insumo.
- Cada alerta muestra: insumo, stock actual, punto de reorden, déficit, lead time del proveedor, badge de estado (atendida/no atendida), tiempo desde que se generó.
- Botón "Atender alerta" → modal de confirmación → simula envío a Compras.
- Estado vacío si no hay alertas activas.

### 2.9 Gestión de Usuarios (`/usuarios`)
Solo **jefe**. CRUD de usuarios:
- **Tabla:** Nombre, email, rol (badge con color), estado activo/inactivo (badge verde/rojo), acciones.
- **Acciones:** Editar (modal con nombre, password, rol), Desactivar (con advertencia de tareas pendientes), Reactivar.
- **Crear usuario:** Modal con nombre, email, contraseña, confirmación, rol (solo supervisor/operario, no jefe).
- No permite editar/desactivar al propio usuario logueado.

### 2.10 Asignar Responsabilidades (`/responsabilidades`)
Solo **jefe**. Asignación de tareas a supervisores y operarios:
- Lista de usuarios activos (excluye al jefe).
- Al seleccionar uno → drawer lateral con:
  - Datos del usuario.
  - Lista de tareas asignadas (con badge de estado).
  - Formulario para nueva tarea (textarea con contador 0/300).

### 2.11 Registrar Insumo (`/insumosRegistro`)
Solo **jefe**. CRUD de insumos:
- **Formulario:** Nombre, proveedor, unidad de medida (kg/L), punto de reorden (ROP).
- **Lista de insumos registrados:** Cada uno con nombre, proveedor, ROP y botón de editar (ícono lápiz).
- **Modo edición:** Al editar, el formulario se rellena, cambia el botón a "Guardar cambios", aparece botón "Cancelar". Valida duplicados correctamente (permite mantener el mismo nombre).

---

## 3. Estructura de componentes

### Layout principal
```
AppShell
├── Sidebar (fijo, ancho 60)
│   ├── Logo Qori + "WMS Qori Foods"
│   ├── Navegación (según rol)
│   └── Avatar + nombre + cerrar sesión
├── Topbar (fijo, altura 16)
│   ├── Título de página
│   └── Campana de alertas (jefe/supervisor)
├── main (margin-left: 60, padding-top: 16)
│   └── children (contenido de cada página)
└── ToastContainer
```

### Componentes UI reutilizables
- `ActionButton` — 4 variantes: primary, ghost, danger, outline
- `Field` — Label + hijo + mensaje de error
- `TextInput` — Input con estado invalid
- `SelectInput` — Select con flecha SVG personalizada
- `TextArea` — Textarea con estado invalid
- `Modal` — Overlay + título + contenido + ModalFooter
- `Badge` — Etiqueta con 6 colores (amber, green, red, blue, navy, gray)
- `TaskRow` — Fila con checkbox de completado
- `ToastContainer` — Notificaciones flotantes con auto-destrucción

---

## 4. Sistema de roles y permisos

| Rol | Nav | Pantallas exclusivas |
|---|---|---|
| `jefe` | Inicio, Registrar Insumo, Inventario, Usuarios, Responsabilidades | Usuarios, Responsabilidades, Registrar Insumo |
| `supervisor` | Inicio, Requerimientos, Inventario, Alertas | Alertas, Nuevo Requerimiento (solo él ve el botón) |
| `operario` | Inicio, Ingreso de Lote, Requerimientos, Inventario | Ingreso de Lote, Atender Requerimiento (solo él ve el botón) |

Los permisos se controlan de 2 formas:
1. **Nav:** `NAV_BY_ROLE` en `nav.js` filtra los ítems del menú lateral.
2. **Páginas:** `allowedRoles` en cada `AppShell` redirige si no tiene permiso.
3. **Acciones internas:** Condicionales dentro del JSX (ej: `isSupervisor && <NuevoButton>`).

---

## 5. Datos y estado

### Estado global (Context API en `store.jsx`)
- `currentUser` — Usuario logueado (null si no hay sesión).
- `users` — Arreglo de usuarios (mock + creados).
- `inventory` — Lotes en inventario (solo lectura).
- `insumos` — Catálogo de insumos.
- `requirements` — Requerimientos de producción.
- `alerts` — Alertas de reabastecimiento.
- `tasks` — Tareas asignadas.
- `toasts` — Notificaciones temporales.

### Datos mock (`data.js`)
Todos los datos iniciales están hardcodeados en este archivo. Cuando se conecte el backend, estos datos vendrán de PostgreSQL vía API REST.

---

## 6. Diseño visual

### Paleta de colores
| Token | Color | Uso |
|---|---|---|
| `--brand` | #6b2d1f (marrón) | Sidebar, panel izquierdo del login |
| `--primary` | #c8922a (dorado) | Botones, enlaces, acentos |
| `--background` | #ffffff | Fondo general |
| `--foreground` | #2a211d | Texto principal |
| `--sidebar` | #6b2d1f | Fondo de sidebar |
| `--success` | #27ae60 | Badge "Normal", check |
| `--warning` | #e67e22 | Badge "Stock bajo", alertas |
| `--critical` | #c0392b | Badge "Agotado", errores |

### Tipografía
- **Headings:** Inter (sans-serif)
- **Mono:** Geist Mono
- Tamaños: text-xs (11px), text-sm (13px), text-base (15px), text-lg (17px), text-xl (19px), text-2xl (21px)

### Bordes y radios
- `--border`: #e7e3df
- `--radius`: 0.5rem (base), con variantes sm/md/lg/xl/2xl/3xl/4xl

---

## 7. Rutas del sistema

| Ruta | Página | Roles permitidos |
|---|---|---|
| `/` | Login | Público |
| `/inicio` | Dashboard | Todos |
| `/ingreso` | Registrar Ingreso de Lote | operario |
| `/inventario` | Consulta de Inventario | Todos |
| `/requerimientos` | Gestión de Requerimientos | supervisor, operario |
| `/requerimientos/nuevo` | Nuevo Requerimiento | supervisor |
| `/requerimientos/:id/atender` | Atender Requerimiento | operario |
| `/alertas` | Alertas y Monitoreo | supervisor |
| `/usuarios` | Gestión de Usuarios | jefe |
| `/responsabilidades` | Asignar Responsabilidades | jefe |
| `/insumosRegistro` | Registrar Insumo | jefe |

---

## 8. Usuarios de prueba

| Rol | Nombre | Email | Contraseña | Estado |
|---|---|---|---|---|
| Jefe de Almacén | María Flores | maria@qorifoods.com | jefe123 | Activo |
| Supervisor | Pedro Salas | pedro@qorifoods.com | super123 | Activo |
| Operario | Carlos Quispe | carlos@qorifoods.com | operario123 | Activo |
| Operario | Luis Mamani | luis@qorifoods.com | operario123 | Activo |
| Supervisor | Ana Torres | ana@qorifoods.com | super123 | Inactivo |

---

## 9. Notas técnicas relevantes para el documento de interfaces

- **No hay backend:** Todos los datos son mock en memoria. Los cambios no persisten al recargar la página.
- **Sin TypeScript:** Todo es JavaScript puro. Los "tipos" están en `lib/types.js` como constantes runtime.
- **Responsive:** El login tiene layout responsive (columna en mobile, fila en desktop). El resto del sistema está diseñado para desktop (sidebar fijo, tablas).
- **Estados vacíos:** Inventario tiene toggle para probar estado vacío. Alertas muestra pantalla de "sin alertas" cuando corresponde.
- **Validaciones:** Todos los formularios tienen validación client-side con mensajes de error visibles.
- **FEFO:** En "Atender Requerimiento" se sugiere el lote más próximo a vencer para cada insumo (hardcodeado por ahora).
- **Drawers:** Inventario y Responsabilidades usan drawers laterales (no modales) para mostrar información detallada.

---

## A. Guía para redactar el Documento de Interfaces

A continuación se desarrolla cada punto del índice con información real del proyecto, para que sirva como base al redactar el documento.

---

### 1. Principios

#### 1.1 Usabilidad
Hablar de cómo el sistema está diseñado para que los 3 roles (jefe, supervisor, operario) realicen sus tareas sin fricción. Mencionar:
- El login es directo: email + contraseña, sin registros ni recuperaciones complejas.
- Cada rol ve solo lo que necesita (sidebar filtrada por `NAV_BY_ROLE`), reduciendo carga cognitiva.
- Las acciones principales están a 1 clic: "Nuevo Requerimiento", "Atender", "Registrar Ingreso".
- Los formularios tienen placeholder y ejemplos concretos ("Ej: Harina de trigo premium", "Ej: REQ-048").
- El sistema valida en el cliente y muestra errores específicos, no genéricos.

#### 1.2 Consistencia
Describir cómo se mantiene la coherencia visual y funcional en toda la app:
- Todos los botones usan el mismo componente `ActionButton` con variantes predecibles (primary para acción principal, ghost para cancelar, danger para destruir).
- Los formularios usan siempre los mismos componentes `Field` + `TextInput`/`SelectInput` con el mismo estilo de error (borde rojo + texto critical).
- Las tablas comparten estructura: cabecera gris (`bg-muted`), filas con hover, border entre filas.
- Los badges de estado usan 6 colores fijos según contexto (verde=completado, ámbar=pendiente, rojo=agotado/error, azul=info, gris=neutro, navy=jefe).
- El layout es consistente: sidebar izquierda fija + topbar superior + contenido central.
- El modal de confirmación aparece siempre que una acción es irreversible (cerrar sesión, atender alerta, registrar salida).

#### 1.3 Feedback inmediato
Describir todos los mecanismos de feedback visual que tiene el sistema:
- **Toasts:** Notificaciones emergentes en esquina superior derecha con ícono y color según tipo (check verde = éxito, X rojo = error). Ej: "Lote registrado correctamente.", "Insumo actualizado exitosamente.". Se autodestruyen a los 4 segundos.
- **Validación en tiempo real:** Al hacer submit, los campos inválidos se marcan al instante con borde rojo y mensaje de error debajo ("Este campo es obligatorio.", "La cantidad debe ser mayor a cero.").
- **Badges de estado dinámicos:** En "Atender Requerimiento", cada fila de insumo muestra un badge que cambia de "Pendiente" → "Parcial" → "Completo" según lo que el operario ingrese.
- **Contadores:** El botón de campana en la topbar muestra el número de alertas activas no atendidas. El badge en la tabla de requerimientos muestra cuántos están pendientes.
- **Hover en tablas:** Las filas de tabla cambian de color al pasar el mouse (`hover:bg-accent/40`), indicando que son interactivas.
- **Drawers:** Al abrir un drawer (inventario, responsabilidades), el fondo se oscurece con overlay semitransparente, indicando que hay una capa superior activa.
- **Cambio de modo:** En "Registrar Insumo", al entrar en modo edición aparece un banner "Editando: [nombre del insumo]" y el botón cambia a "Guardar cambios".

#### 1.4 Visibilidad del estado del sistema
Describir cómo el usuario sabe en todo momento qué está pasando:
- **Sesión:** La sidebar siempre muestra el nombre, rol (con badge) e iniciales del usuario logueado. Si no hay sesión, redirige al login.
- **Ubicación actual:** El sidebar resalta con borde dorado y fondo más claro la página activa. La topbar muestra el título de la página.
- **Estados de datos:** Cada tabla tiene badges de estado con colores: verde (completado/normal), ámbar (pendiente/stock bajo), rojo (agotado/error).
- **Stock:** En inventario se muestra claramente "Normal", "Stock bajo" o "Agotado" con colores. En las tablas de vencimiento, las fechas próximas (>30 días) se ven en ámbar, las críticas (>7 días) en rojo.
- **Alertas:** Las alertas activas tienen borde izquierdo rojo; las atendidas, borde verde. El texto muestra "Atendida el [fecha] por [usuario]" cuando ya se resolvió.
- **Estados vacíos:** Alertas muestra mensaje "No hay alertas de reabastecimiento activas" con ícono de check. Inventario tiene un toggle para mostrar "No hay insumos registrados" a propósito.

#### 1.5 Sugestividad
Cómo el sistema sugiere al usuario lo que puede hacer:
- **Placeholders:** "usuario@qorifoods.com", "Ej: Harina de trigo premium", "Ej: Molinos del Norte SAC", "Seleccione un insumo...".
- **Autocompletado:** Al seleccionar un insumo en "Registrar Ingreso de Lote", el proveedor se rellena solo. El número de lote se genera automáticamente.
- **Botones con íconos:** "Nuevo Requerimiento" tiene icono `+`, "Atender" no tiene ícono pero usa color primary que contrasta.
- **Badges:** Cada badge sugiere el estado: ámbar = atención requerida, verde = todo ok, rojo = problema.
- **Tooltips visuales:** El ícono de advertencia junto a stock cero tiene `title="Sin stock disponible actualmente"`.
- **Enlaces sugeridos:** Los KPIs del dashboard del supervisor tienen enlaces "Ver alertas →" y "Ver requerimientos →" que invitan a navegar.
- **Select con opción por defecto:** Todos los dropdowns tienen una opción tipo "Seleccione..." o "Filtrar por..." para indicar que se debe elegir.

---

### 2. Heurísticas (Nielsen)

#### 2.1 Visibilidad del estado del sistema
(Ídem 1.4 — aplica igual como heurística)

#### 2.2 Relación entre el sistema y el mundo real
Evaluar cómo el sistema usa el lenguaje del usuario (no técnico):
- **Terminología del rubro:** "Lote", "insumo", "punto de reorden", "proveedor", "ubicación (pasillo/rack/nivel)", "FEFO", "salida de insumos", "requerimiento de producción".
- **Fechas en formato peruano:** DD/MM/YYYY (ej: "05/06/2026"). Números con formato `es-PE` (separador de miles con espacio: "1 200 kg").
- **Rol con nombre real:** En vez de mostrar "jefe" crudo, muestra "Jefe de Almacén" (`ROLE_LABEL`). En la sidebar, las iniciales simuldan un avatar.
- **Metáfora de almacén:** Ubicaciones como "Pasillo A – Rack 1 – Nivel 1" reflejan la disposición física real. "Registrar Ingreso de Lote" simula el proceso de recepción física.
- **Mensajes de error humanizados:** "Su cuenta se encuentra inactiva. Contacte al Jefe de Almacén." en vez de "Error 403".

#### 2.3 Control y libertad del usuario
Describir cómo el usuario puede deshacer acciones o salir de estados no deseados:
- **Cancelar:** Todos los formularios tienen botón "Cancelar" que vuelve a la pantalla anterior sin guardar.
- **Cerrar drawers:** Los drawers laterales tienen botón X y se cierran al hacer clic fuera (overlay).
- **Modal de confirmación:** Las acciones destructivas (cerrar sesión, desactivar usuario, atender alerta, registrar salida) muestran modal con "Cancelar" antes de ejecutar.
- **Toggle de completado:** En "Mis Pendientes", se puede marcar/desmarcar una tarea como completada. No es irreversible.
- **Cerrar sesión:** Tiene modal de confirmación, no es un clic accidental.
- **Navegación libre:** El usuario puede ir a cualquier página de su menú en cualquier momento, no hay flujos forzados (excepto login → inicio).

#### 2.4 Consistencia y estándares
(Ídem 1.2 — aplica igual como heurística)
Adicionalmente:
- Los estándares web se siguen: href para rutas, type="email" para correos, type="password" con toggle show/hide.
- Los íconos de lucide-react siguen convenciones conocidas: Home para inicio, Bell para alertas, Users para usuarios, Search para búsqueda.
- Las tablas tienen estilos estándar: thead con texto en negrita, tbody con hover, alineación de columnas coherente.

#### 2.5 Prevención de errores
Describir cómo el sistema evita que el usuario cometa errores antes de que ocurran:
- **Validación de formularios:** Antes de submit, se validan todos los campos. Errores específicos por campo.
- **Duplicados:** Al crear usuario, se valida que el email no exista. Al crear insumo, se valida que el nombre no esté duplicado. Al crear requerimiento, se valida que el número no se repita (contra REQ-047 hardcodeado).
- **Contraseña y confirmación:** En creación de usuario, se valida que ambas contraseñas coincidan antes de enviar.
- **Select en vez de input libre:** Para insumo, ubicación, rol, estado, unidad — se usa dropdown para evitar errores de tipeo.
- **Cantidad máxima:** En "Atender Requerimiento", el input de cantidad tiene un límite superior (no puede superar lo solicitado) usando `Math.min()`.
- **Input type="number":** Los campos numéricos usan type="number" con min="0" para evitar textos.
- **Desactivar usuario con tareas:** Si el usuario tiene tareas pendientes, muestra advertencia antes de desactivar.

#### 2.6 Reconocer mejor que recordar
Cómo el sistema muestra opciones visibles en vez de exigir memorizar:
- **Menú lateral siempre visible:** El usuario no necesita recordar rutas, las ve en la sidebar.
- **Dropdowns en vez de inputs:** Todos los selects listan opciones disponibles (insumos, ubicaciones, roles, estados).
- **Autocompletado de proveedor y lote:** El usuario no necesita recordar el proveedor de cada insumo ni el último número de lote.
- **Badges de estado:** El estado se muestra visualmente con color y texto, no hay que inferirlo de datos crudos.
- **Dashboard con KPIs:** El supervisor ve de un vistazo cuántas alertas y requerimientos pendientes hay, sin tener que navegar a cada pantalla.
- **Contador en campana:** El número de alertas activas se muestra en la topbar siempre visible.

#### 2.7 Flexibilidad y eficiencia de uso
Cómo el sistema se adapta a distintos niveles de experiencia:
- **Roles con distintos niveles de acceso:** El jefe tiene control total (CRUD de usuarios, insumos, responsabilidades). El supervisor opera (alertas, requerimientos). El operario ejecuta (ingreso de lotes, atender requerimientos).
- **Atajos visuales:** Los botones de acción principal están siempre en la misma posición (esquina superior derecha de la sección).
- **Filtros en inventario:** Permiten acotar rápidamente la búsqueda sin necesidad de escribir SQL o comandos.
- **Toggle de datos vacíos en inventario:** Utilidad para testers/demo, permite ver cómo se ve el sistema sin datos.
- **Drawer de lotes:** Información detallada sin cambiar de página, manteniendo el contexto de la tabla principal.

#### 2.8 Diseño estético y minimalista
Evaluar la estética visual:
- **Paleta reducida:** Marrón (#6b2d1f) + dorado (#c8922a) como colores corporativos. Blanco/gris para fondos. Rojo/verde/ámbar solo para estados.
- **Sin elementos decorativos innecesarios:** No hay ilustraciones, gradientes complejos ni animaciones que distraigan.
- **Espaciado consistente:** Padding uniforme en cards (p-6), tablas (px-4 py-3), botones (px-4 py-2). Gap de 5 entre campos de formulario.
- **Tipografía clara:** Inter para legibilidad. Tamaños decrecientes: título de página (text-lg), encabezados de sección (text-base), contenido (text-sm), metadatos (text-xs).
- **Cards agrupadas:** Cada sección importante está dentro de un `rounded-lg border border-border bg-card` que la delimita visualmente.
- **Sidebar oscura:** El contraste entre sidebar (marrón oscuro) y contenido (blanco) ayuda a enfocar la atención en el área de trabajo.

#### 2.9 Ayuda a los usuarios a reconocer, diagnosticar y recuperarse de errores
Qué pasa cuando algo sale mal:
- **Mensajes de error específicos:** "Correo o contraseña incorrectos. Intente nuevamente." (no "Error de autenticación"). "Ya existe un usuario registrado con este correo electrónico." (no "Duplicate entry").
- **Campos marcados visualmente:** Borde rojo en el input + texto de error debajo del label.
- **Cuenta inactiva:** Mensaje claro: "Su cuenta se encuentra inactiva. Contacte al Jefe de Almacén." con indicación de qué hacer.
- **Requerimiento duplicado:** "Ya existe un requerimiento registrado con ese número. Verifique el documento físico." — indica qué hacer para resolverlo.
- **Stock insuficiente:** En "Atender Requerimiento", una alerta visual de "Stock insuficiente" advierte antes de confirmar.
- **Tareas pendientes al desactivar:** Modal con advertencia específica de cuántas tareas quedan sin responsable.

#### 2.10 Ayuda y documentación
Qué ayuda tiene el sistema:
- **Placeholders descriptivos:** Los inputs tienen ejemplos concretos de qué escribir.
- **Enlace de ayuda en login:** "¿Problemas para ingresar? Contacte al administrador." al pie del formulario.
- **Tooltips:** El ícono de alerta junto a stock cero tiene tooltip "Sin stock disponible actualmente".
- **Instrucciones en modales:** El modal de "Atender alerta" explica que "Se registrará el envío de un requerimiento de reabastecimiento...".
- **Breadcrumb:** En "Nuevo Requerimiento" hay un texto "Requerimientos → Nuevo Requerimiento" que indica la ubicación dentro del flujo.
- **Nota:** El sistema no tiene una sección de ayuda formal ni tooltips interactivos en cada campo. Esto sería un punto de mejora.

---

### 3. Propósitos de la interfaz

Aquí se describen los objetivos que cumple la interfaz del sistema:

- **Gestión de sesión:** Permitir que el usuario se identifique y acceda solo a lo que le corresponde según su rol.
- **Registro de ingreso de lotes:** Capturar la entrada de nuevos insumos al almacén con trazabilidad (lote, proveedor, ubicación, vencimiento).
- **Consulta de inventario:** Visualizar el stock actual agrupado por insumo, con capacidad de filtrar y ver detalle por lote.
- **Gestión de requerimientos:** Crear solicitudes de insumos para producción y registrar las salidas físicas del almacén.
- **Monitoreo de alertas:** Detectar insumos por debajo del punto de reorden y gestionar su reabastecimiento.
- **Administración de usuarios:** Crear, editar, activar/desactivar usuarios del sistema (solo jefe).
- **Asignación de responsabilidades:** Asignar tareas a supervisores y operarios desde la jefatura.
- **Catálogo de insumos:** Mantener actualizado el listado de materias primas con sus proveedores y puntos de reorden (solo jefe).

---

### 4. Tipo de interfaz

- **Tipo:** Interfaz de usuario web (Web UI), SPA (Single Page Application).
- **Dispositivo objetivo:** Desktop/Laptop (no está diseñado responsive para mobile, excepto el login que sí se adapta).
- **Modelo de interacción:** Manipulación directa (forms, clicks, selects) + navegación por menú lateral.
- **Paradigma:** Dashboard con tablas, formularios y paneles laterales (drawers).
- **Framework UI:** React 19 con componentes funcionales y hooks.
- **Lenguaje:** JavaScript (ES modules), sin TypeScript.
- **Estilos:** CSS utility-first con Tailwind CSS v4, diseño custom (no usa librerías de componentes como Material UI o shadcn).

---

### 5. Presentación de la interfaz

Acá se describe cómo se ve y organiza visualmente la interfaz. Usar la info de la sección "Diseño visual" de este documento (paleta de colores, tipografía, bordes, layout de AppShell). Incluir:

- **Layout general:** Sidebar izquierda 240px + Topbar 64px + Área de contenido con padding 32px.
- **Componentes visuales:** Cards con border, tablas con thead gris, badges de estado, botones con variantes, inputs con borde y foco dorado.
- **Estados visuales:** Normal, hover, focus, disabled, invalid (error), active (página actual en sidebar).
- **Jerarquía:** Título de página en topbar > Encabezados de sección (text-base font-semibold) > Contenido (text-sm) > Metadatos (text-xs).
- **Modales y drawers:** Modales centrados con overlay oscuro, drawers laterales desde la derecha.

---

### ANEXO

Incluir aquí:
- **Tabla de usuarios de prueba** (copiar de la sección 8 de este documento).
- **Diagrama de navegación** entre pantallas (se puede describir como: Login → Inicio → [cada pantalla según rol]).
- **Capturas de pantalla** de cada interfaz (pendiente de tomar).
- **Glosario de términos:** Insumo, Lote, ROP, FEFO, Requerimiento, Alerta, Toast, Drawer, KPI, Badge.
