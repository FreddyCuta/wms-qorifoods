# Manual de Usuario

## WMS Qori Foods — Sistema de Gestión de Almacén de Insumos

|                 |                                         |
|-----------------|-----------------------------------------|
| **Nombre del sistema** | WMS Qori Foods — Almacén de Insumos |
| **Versión**     | 1.0.0                                   |
| **Fecha de elaboración** | Julio 2026                        |
| **Equipo desarrollador** | [Nombre del equipo]                |

---

## 1. Introducción

**WMS Qori Foods** es un sistema web de gestión de almacén (Warehouse Management System) diseñado para controlar el inventario de materias primas e insumos de la empresa Qori Foods. Permite registrar ingresos de lotes, gestionar requerimientos de producción, consultar el inventario en tiempo real, visualizar el almacén en 3D, asignar tareas al personal y monitorear alertas de stock bajo.

### Público objetivo

Este manual está dirigido a los tres perfiles de usuario del sistema:

- **Jefe de Almacén** — supervisión general, gestión de usuarios, insumos, responsabilidades y dashboard ejecutivo.
- **Supervisor de Almacén** — operaciones diarias, creación de requerimientos, monitoreo de alertas.
- **Operario de Almacén** — registro de ingreso de lotes, atención de requerimientos, consulta de inventario.

### Requisitos previos

- Conocimientos básicos de navegación web.
- Nociones elementales de gestión de inventarios (lotes, fechas de vencimiento, ubicaciones físicas).
- Credenciales de acceso proporcionadas por el administrador del sistema.

---

## 2. Requisitos del Sistema

### Hardware mínimo

| Componente       | Especificación                |
|------------------|-------------------------------|
| Procesador       | 1.5 GHz dual-core             |
| Memoria RAM      | 4 GB                          |
| Espacio en disco | 500 MB libres                 |
| Conexión a red   | 2 Mbps (para visualización 3D) |
| Tarjeta gráfica  | Compatible con WebGL          |

### Software necesario

- **Sistema operativo**: Windows 10+, macOS 12+, Ubuntu 20.04+ (o cualquier SO moderno).
- **Navegador web**: Google Chrome 120+, Mozilla Firefox 120+, Microsoft Edge 120+, Safari 17+.
- **Resolución de pantalla recomendada**: 1366 × 768 píxeles o superior.
- **WebGL**: Activado en el navegador (necesario para la visualización 3D del almacén).

### Configuración previa

El sistema se ejecuta completamente en el navegador web. No requiere instalación de software adicional por parte del usuario. Solo necesita:

1. Acceder a la URL proporcionada por el administrador.
2. Iniciar sesión con sus credenciales.

_Nota: La versión actual del sistema funciona con datos de demostración. La conexión a la base de datos y el backend estarán disponibles en versiones futuras._

---

## 3. Acceso al Sistema

### Cómo iniciar sesión

1. Abra su navegador web.
2. Ingrese la URL del sistema (proporcionada por el administrador).
3. Aparecerá la pantalla de inicio de sesión con dos campos:

   - **Correo electrónico**: Ingrese su correo corporativo (ej: `maria@qorifoods.com`).
   - **Contraseña**: Ingrese su contraseña.

4. Haga clic en el botón **"Ingresar"** o presione la tecla **Enter**.

![Pantalla de inicio de sesión]()

### Credenciales de prueba

| Rol         | Correo                  | Contraseña     |
|-------------|-------------------------|----------------|
| Jefe        | maria@qorifoods.com     | jefe123        |
| Supervisor  | pedro@qorifoods.com     | super123       |
| Operario    | carlos@qorifoods.com    | operario123    |
| Operario    | luis@qorifoods.com      | operario123    |

### Recuperación de contraseña

_Nota: La funcionalidad de recuperación de contraseña estará disponible en la versión con backend. Actualmente, contacte al administrador para restablecer su contraseña._

### Cierre de sesión

1. En la barra lateral izquierda, al final, se encuentra su perfil con su nombre y rol.
2. Haga clic en el botón **"Cerrar sesión"** (icono de salida).
3. Confirme la acción en el modal emergente.

---

## 4. Descripción General de la Interfaz

### Pantalla principal

Al iniciar sesión, se presenta una interfaz dividida en tres áreas principales:

```
┌─────────────────────────────────────────────────────────────┐
│  Logo Qori   │  [Título de página]        │ 🔔 │ Usuario   │  ← Topbar
├──────────────┼──────────────────────────────────────────────┤
│              │                                              │
│  ● Inicio    │                                              │
│  ● Dashboard │           CONTENIDO PRINCIPAL               │
│  ● Insumos   │                                              │
│  ● Inventario│                                              │
│  ● 3D        │                                              │
│  ● Usuarios  │                                              │
│  ● Tareas    │                                              │
│              │                                              │
│  ┌────────┐  │                                              │
│  │ Perfil  │  │                                              │
│  │ Cerrar  │  │                                              │
│  └────────┘  │                                              │
├──────────────┴──────────────────────────────────────────────┤
│  [Footer / notificaciones Toast]                            │
└─────────────────────────── sidebar (240px) ─────────────────┘
```

### Elementos de la interfaz

| Elemento              | Descripción                                                              |
|-----------------------|--------------------------------------------------------------------------|
| **Sidebar (menú lateral)** | Navegación principal. Contiene los enlaces a las páginas según el rol del usuario. |
| **Topbar (barra superior)** | Muestra el título de la página actual, el ícono de campana (alertas activas, solo supervisores) y el nombre del usuario logueado. |
| **Área de contenido** | Muestra la página o funcionalidad seleccionada.                          |
| **Toast (notificación)** | Mensaje emergente temporal (esquina superior derecha) que confirma acciones o muestra errores. |
| **Badge (etiqueta)**  | Indicador de estado con colores (verde = normal, ámbar = advertencia, rojo = crítico, azul = informativo). |
| **Modal (ventana emergente)** | Diálogo que aparece sobre el contenido para confirmar acciones, editar o crear registros. |

### Mapa de navegación

```
                    ┌─────────────────┐
                    │   Inicio de     │
                    │   Sesión (/)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Inicio      │
                    │   (/inicio)     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐
   │    Jefe      │  │  Supervisor  │  │   Operario   │
   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
          │                  │                  │
   ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
   │• Dashboard  │   │• Requerim.  │   │• Ingreso    │
   │• Insumos    │   │• Inventario │   │  de Lote    │
   │• Inventario │   │• Almacén 3D │   │• Requerim.  │
   │• Almacén 3D │   │• Alertas    │   │• Inventario │
   │• Usuarios   │   └─────────────┘   │• Almacén 3D │
   │• Tareas     │                      └─────────────┘
   └─────────────┘
```

---

## 5. Operaciones Básicas del Sistema

### 5.1 Inicio (Página principal)

**Roles**: Todos

**¿Qué hace?** Muestra un resumen adaptado al rol del usuario:

- **Operario**: Lista de tareas pendientes asignadas por el jefe.
- **Supervisor**: Tareas pendientes + contador de alertas activas con enlace directo.
- **Jefe**: Conteo total de lotes registrados en el inventario.

**Pasos**:
1. Inicie sesión con sus credenciales.
2. Automáticamente será redirigido a la página de Inicio.
3. Visualice la información correspondiente a su rol.
4. (Operario/Supervisor) Marque una tarea como completada haciendo clic en el círculo vacío junto a la tarea.

**Resultado esperado**: La tarea se marca como completada (texto tachado, círculo con check verde).

---

### 5.2 Dashboard (Solo Jefe)

**Roles**: Jefe de Almacén

**¿Qué hace?** Proporciona una vista ejecutiva con indicadores clave, tabla de existencias, movimientos recientes, productos próximos a vencer, distribución de stock por insumo, requerimientos activos y actividad del equipo.

**Pasos**:
1. Haga clic en **"Dashboard"** en el menú lateral.
2. Visualice los indicadores (KPI) en la parte superior:
   - Insumos registrados
   - Lotes activos
   - Stock crítico
   - Requerimientos pendientes
   - Alertas activas
3. Explore las secciones:
   - **Existencias**: Tabla de todos los insumos con stock actual. Haga clic en una fila para expandir y ver los lotes individuales y requerimientos relacionados.
   - **Vencimientos**: Productos que caducan pronto (rojo ≤ 7 días, ámbar ≤ 30 días).
   - **Distribución**: Barras de stock por cada insumo.
   - **Requerimientos**: Lista de pedidos pendientes y en atención.
   - **Equipo**: Miembros del personal con su tarea más reciente.

**Resultado esperado**: Vista completa del estado del almacén para la toma de decisiones.

---

### 5.3 Registrar Insumo (Solo Jefe)

**Roles**: Jefe de Almacén

**¿Qué hace?** Permite dar de alta un nuevo insumo (materia prima) en el catálogo del sistema.

**Pasos**:
1. Haga clic en **"Registrar Insumo"** en el menú lateral.
2. Complete el formulario:
   - **Nombre del insumo**: Ej: "Azúcar blanca".
   - **Proveedor**: Ej: "Agroindustrias del Sur SAC".
   - **Unidad de medida**: Seleccione "kg" (kilogramos) o "L" (litros).
   - **Punto de reorden**: Cantidad mínima de stock que activará una alerta (ej: 100).
   - **Lead time**: Días que tarda el proveedor en entregar (ej: 5).
3. Haga clic en **"Registrar insumo"**.
4. El nuevo insumo aparecerá en la lista de la parte inferior.

**Resultado esperado**: Insumo agregado al catálogo. Mensaje de confirmación "Insumo registrado".

**Para editar**:
1. En la lista de insumos registrados, haga clic en **"Editar"** junto al insumo deseado.
2. Modifique los campos necesarios.
3. Haga clic en **"Guardar cambios"**.

---

### 5.4 Registrar Ingreso de Lote (Solo Operario)

**Roles**: Operario de Almacén

**¿Qué hace?** Registra la entrada física de un nuevo lote de insumo al almacén.

**Pasos**:
1. Haga clic en **"Registrar Ingreso de Lote"** en el menú lateral.
2. Complete el formulario:
   - **Insumo**: Seleccione el insumo del catálogo (el proveedor y unidad se autocompletan).
   - **Cantidad que ingresa**: Número positivo (ej: 500).
   - **Fecha de vencimiento**: Seleccione la fecha del lote.
   - **Ubicación**: Seleccione Pasillo (A–D), Rack (1–6) y Nivel (1–5).
   - También puede hacer clic en **"Seleccionar en 3D"** para elegir la ubicación visualmente en el almacén tridimensional.
3. El sistema muestra cuántos lotes hay actualmente en ese nivel **(X/5 ocupados · Y libres)**.
4. Verifique que el nivel tenga espacio disponible (máximo 5 lotes por nivel).
5. Haga clic en **"Registrar ingreso"**.

**Resultado esperado**: Nuevo lote agregado al inventario con código de lote generado automáticamente. Mensaje de confirmación "Lote registrado exitosamente".

**Validaciones**:
- No se puede registrar si el nivel ya tiene 5 lotes.
- Todos los campos son obligatorios.
- La cantidad debe ser mayor a cero.

---

### 5.5 Consulta de Inventario (Todos los roles)

**Roles**: Todos

**¿Qué hace?** Permite consultar el inventario actual agrupado por insumo con filtros por nombre, ubicación y estado de stock.

**Pasos**:
1. Haga clic en **"Consulta de Inventario"** en el menú lateral.
2. Use los filtros disponibles para refinar la búsqueda:
   - **Filtrar por insumo**: Seleccione un insumo específico.
   - **Pasillo**: Seleccione un pasillo (A–D).
   - **Rack**: Seleccione un rack (1–6).
   - **Nivel**: Seleccione un nivel (1–5).
   - **Estado del stock**: Normal, Stock bajo o Agotado.
3. Haga clic en **"Buscar"** para aplicar los filtros.
4. La tabla muestra:
   - **Insumo**: Nombre del insumo.
   - **Cantidad total disponible**: Suma de todos los lotes.
   - **Punto de reorden**: Umbral definido.
   - **Estado**: Badge verde (Normal), ámbar (Stock bajo) o rojo (Agotado).
   - **Lotes**: Número de lotes. Haga clic en **"Ver lotes"** para abrir un panel lateral con el detalle de cada lote (código, cantidad, vencimiento, ubicación, fecha de ingreso).
5. Los vencimientos se muestran con código de colores:
   - **Rojo**: ≤ 7 días para vencer.
   - **Ámbar**: ≤ 30 días para vencer.
   - **Color normal**: Más de 30 días.

**Resultado esperado**: Vista detallada del inventario filtrado según los criterios seleccionados.

---

### 5.6 Gestión de Requerimientos (Supervisor y Operario)

**Roles**: Supervisor, Operario

**¿Qué hace?** Lista todos los requerimientos de producción registrados.

**Pasos**:
1. Haga clic en **"Gestión de Requerimientos"** en el menú lateral.
2. Visualice la tabla con los requerimientos:
   - **Número**: Código del requerimiento (ej: REQ-047).
   - **Fecha**: Fecha de solicitud.
   - **Registrado por**: Quién lo creó.
   - **Estado**: Pendiente (ámbar), Parcial (azul) o Atendido (verde).
   - **Acciones**: Botón para crear nuevo (supervisor) o atender (operario).

**Resultado esperado**: Lista completa de requerimientos de producción.

---

### 5.7 Nuevo Requerimiento (Solo Supervisor)

**Roles**: Supervisor de Almacén

**¿Qué hace?** Crea un nuevo pedido de insumos solicitado por producción.

**Pasos**:
1. Desde la página de Requerimientos, haga clic en **"Nuevo Requerimiento"**.
2. El formulario se carga con dos filas de ejemplo.
3. Complete:
   - **Número de requerimiento**: Ej: "REQ-048" (no puede repetirse).
   - **Fecha de solicitud**: Fecha del pedido.
   - **Insumos**: Para cada fila, seleccione el insumo, ingrese la cantidad solicitada y la unidad. El stock disponible se muestra automáticamente.
4. Agregue más filas con el botón **"Agregar insumo"** o elimine filas con el botón **"✕"**.
5. Haga clic en **"Registrar requerimiento"**.

**Resultado esperado**: Requerimiento registrado con estado "Pendiente". Visible para los operarios que lo atenderán.

---

### 5.8 Atender Requerimiento (Solo Operario)

**Roles**: Operario de Almacén

**¿Qué hace?** Despacha inventario para cubrir un requerimiento de producción. Soporta atención parcial (se puede atender en varias veces).

**Pasos**:
1. Desde la página de Requerimientos, haga clic en **"Atender"** junto a un requerimiento pendiente o parcial.
2. Para cada insumo solicitado:
   - El sistema sugiere los lotes a despachar siguiendo el método **FEFO** (First Expiry, First Out — primero en vencer, primero en salir).
   - Ingrese la cantidad a despachar (no puede exceder el stock disponible ni la cantidad solicitada pendiente).
3. Revise el resumen en el modal de confirmación.
4. Haga clic en **"Confirmar despacho"**.

**Resultado esperado**:
- El inventario se descuenta de los lotes correspondientes.
- El requerimiento actualiza su estado:
  - **Atendido**: si se cubrió todo.
  - **Parcial**: si solo se cubrió parte.
- Historial de atenciones registrado con fecha y responsable.

---

### 5.9 Alertas y Monitoreo (Solo Supervisor)

**Roles**: Supervisor de Almacén

**¿Qué hace?** Muestra las alertas generadas automáticamente cuando el stock de un insumo está por debajo de su punto de reorden.

**Pasos**:
1. Haga clic en **"Alertas y Monitoreo"** en el menú lateral, o en el ícono de campana 🔔 en la barra superior.
2. Visualice la lista de insumos con stock bajo:
   - **Insumo**: Nombre del insumo.
   - **Stock actual**: Cantidad disponible.
   - **Punto de reorden**: Umbral mínimo.
   - **Déficit**: Cuánto falta para alcanzar el punto de reorden.
   - **Lead time**: Días de reposición.
   - **Atendida**: Fecha y quién la atendió (si fue atendida).
3. Para atender una alerta, haga clic en **"Atender alerta"**.
4. Confirme en el modal.

**Resultado esperado**: Alerta marcada como atendida con fecha y responsable. El supervisor sabe qué insumos requieren reposición.

---

### 5.10 Gestión de Usuarios (Solo Jefe)

**Roles**: Jefe de Almacén

**¿Qué hace?** Administra los usuarios del sistema: crear, editar y desactivar cuentas.

**Pasos**:
1. Haga clic en **"Gestión de Usuarios"** en el menú lateral.
2. Visualice la tabla de usuarios con nombre, correo, rol y estado.
3. **Crear usuario**:
   - Haga clic en **"Crear usuario"**.
   - Complete: nombre, correo, contraseña, confirmar contraseña, rol.
   - Haga clic en **"Crear usuario"**.
4. **Editar usuario**:
   - Haga clic en **"Editar"** junto al usuario.
   - Modifique nombre, rol y opcionalmente contraseña.
   - El correo no se puede cambiar.
   - Haga clic en **"Guardar cambios"**.
5. **Desactivar usuario**:
   - Haga clic en **"Desactivar"** junto al usuario activo.
   - Confirme la desactivación. Si tiene tareas pendientes, el sistema lo advertirá.

**Resultado esperado**: Usuario creado, editado o desactivado según la acción.

---

### 5.11 Asignar Responsabilidades (Solo Jefe)

**Roles**: Jefe de Almacén

**¿Qué hace?** Asigna tareas a los miembros del personal (operarios y supervisores).

**Pasos**:
1. Haga clic en **"Asignar Responsabilidades"** en el menú lateral.
2. Visualice la lista de miembros del personal (excluye al jefe).
3. Haga clic en un miembro para ver sus tareas actuales en un panel lateral.
4. Para asignar una nueva tarea:
   - Escriba la descripción (máximo 300 caracteres).
   - Haga clic en **"Asignar"**.

**Resultado esperado**: Tarea asignada al miembro seleccionado con estado "Pendiente". Aparece en su página de Inicio.

---

### 5.12 Visualización 3D del Almacén (Todos los roles)

**Roles**: Todos

**¿Qué hace?** Muestra una representación tridimensional del almacén con los racks, estantes y lotes de inventario.

**Pasos**:
1. Haga clic en **"Visualización 3D"** en el menú lateral.
2. Se cargará el almacén en 3D con:
   - **4 pasillos** (A–D) con sus respectivos racks.
   - **6 racks** por pasillo, **5 niveles** por rack.
   - **Cajas** de colores representando los lotes (cada insumo tiene un color distinto).
   - El tamaño de cada caja es proporcional a la cantidad de llenado.

**Controles**:

| Acción                | Mouse / Teclado                          |
|-----------------------|------------------------------------------|
| Rotar vista           | Clic + arrastrar                         |
| Acercar/Alejar        | Rueda del mouse (scroll)                 |
| Desplazar vista       | Clic derecho + arrastrar                 |
| Navegar cursor        | Flechas ← → ↑ ↓ (pasillo/rack)          |
| Subir/Bajar nivel     | Teclas W / S                             |
| Seleccionar ubicación | Tecla Enter                              |
| Restaurar cámara      | Tecla R o botón "Restaurar cámara"       |

**Al hacer clic en un lote**:
- Se abre un panel con los detalles del lote (insumo, cantidad, vencimiento, ubicación, código).
- El lote seleccionado se ilumina con un resplandor y gira lentamente.

**Al pasar el cursor sobre un lote vacío (ubicación libre)**:
- Se muestra un área dorada indicando que el espacio está disponible.

**Barra de posición**: En la parte superior se muestra la posición actual del cursor (Pasillo, Rack, Nivel) y la ocupación (X/5 ocupados · Y libres).

**Resultado esperado**: Visualización interactiva del estado del almacén en 3D.

---

## 6. Mensajes del Sistema y Manejo de Errores

### Mensajes comunes

| Mensaje                                 | Significado                                        | Qué hacer                              |
|-----------------------------------------|----------------------------------------------------|----------------------------------------|
| "Correo o contraseña incorrectos"       | Credenciales inválidas                             | Verifique sus datos e intente de nuevo |
| "Cuenta desactivada"                    | Su usuario fue desactivado por el jefe             | Contacte al administrador              |
| "Lote registrado exitosamente"          | Ingreso de lote completado                         | (correcto)                             |
| "Insumo registrado"                     | Nuevo insumo agregado al catálogo                  | (correcto)                             |
| "Requerimiento registrado"              | Nuevo requerimiento creado                         | (correcto)                             |
| "Despacho registrado"                   | Atención de requerimiento completada               | (correcto)                             |
| "Insumo editado correctamente"          | Cambios guardados en el catálogo                   | (correcto)                             |
| "Usuario creado exitosamente"           | Nuevo usuario registrado                           | (correcto)                             |
| "Este nivel ya tiene 5 lotes"           | La ubicación seleccionada está llena               | Seleccione otra ubicación              |
| "El número de requerimiento ya existe"  | Número duplicado                                   | Use otro número                        |
| "Completa todos los campos"             | Hay campos obligatorios vacíos                     | Revise y complete el formulario        |

### Errores frecuentes

1. **No carga la visualización 3D**:
   - Verifique que WebGL esté activado en su navegador.
   - Actualice el navegador a la versión más reciente.
   - Pruebe con Chrome o Edge.

2. **La sesión se cierra inesperadamente**:
   - Refresque la página e inicie sesión nuevamente.
   - Si persiste, contacte al administrador.

3. **No veo todas las opciones del menú**:
   - Cada rol tiene acceso a funcionalidades específicas (ver mapa de navegación).
   - Si cree que le falta un permiso, contacte al jefe de almacén.

---

## 7. Preguntas Frecuentes (FAQ)

**¿Qué hago si no puedo iniciar sesión?**
Verifique que su correo y contraseña sean correctos. Si olvidó su contraseña, contacte al jefe de almacén para que la restablezca.

**¿Cómo cambio mi contraseña?**
Actualmente, solo el jefe de almacén puede cambiar contraseñas desde la gestión de usuarios. Contacte a su jefe para solicitar el cambio.

**¿Puedo imprimir un reporte del inventario?**
La versión actual no incluye impresión directa. Puede usar la función de impresión del navegador (Ctrl+P) en la página de Consulta de Inventario.

**¿Qué significa el color de las etiquetas de estado?**
- **Verde**: Stock normal (por encima del punto de reorden).
- **Ámbar**: Stock bajo (igual o por debajo del punto de reorden).
- **Rojo**: Agotado (stock en cero).

**¿Cómo sé si un lote está próximo a vencer?**
En la Consulta de Inventario, al expandir los lotes de un insumo, las fechas de vencimiento aparecen en rojo (≤ 7 días) o ámbar (≤ 30 días).

**¿Puedo atender un requerimiento en varias veces?**
Sí. El sistema soporta atención parcial. Cada vez que atiende, se registra la fecha, el responsable y las cantidades despachadas. El requerimiento cambia a estado "Parcial" hasta que se complete.

---

## 8. Glosario de Términos

| Término                  | Definición                                                                 |
|--------------------------|---------------------------------------------------------------------------|
| **Almacén 3D**           | Visualización tridimensional del almacén con todos los racks y lotes.    |
| **Badge**                | Etiqueta visual de estado (colores: verde, ámbar, rojo, azul).           |
| **FEFO**                 | First Expiry, First Out — método de despacho que prioriza los lotes con vencimiento más cercano. |
| **Insumo**               | Materia prima o material almacenado (ej: harina, aceite, sal).           |
| **KPI**                  | Key Performance Indicator — indicador clave de rendimiento.              |
| **Lead Time**            | Tiempo (en días) que tarda el proveedor en entregar un insumo.           |
| **Lote**                 | Conjunto de unidades de un insumo con un mismo código, fecha de vencimiento y ubicación. |
| **Pasillo**              | Corredor del almacén identificado con una letra (A–D).                  |
| **Punto de Reorden (ROP)** | Cantidad mínima de stock que, al alcanzarse, dispara una alerta de reposición. |
| **Rack**                 | Estantería numerada dentro de un pasillo (1–6).                         |
| **Nivel**                | Altura dentro de un rack (1–5). Cada nivel puede albergar hasta 5 lotes. |
| **Requerimiento**        | Solicitud de insumos realizada por producción.                          |
| **Toast**                | Notificación temporal que aparece en la esquina superior derecha.       |
| **Ubicación**            | Posición física en el almacén: Pasillo + Rack + Nivel.                  |

---

## 9. Contacto para Soporte Técnico

| Canal          | Detalle                          |
|----------------|----------------------------------|
| Correo         | [soporte@qorifoods.com]          |
| Teléfono       | [+51 XXX XXX XXX]                |
| Horarios       | Lunes a viernes, 8:00 a 18:00    |

Para reportar incidencias o solicitar mejoras, contacte al equipo de soporte indicando:
- Su nombre de usuario.
- La funcionalidad donde ocurre el problema.
- Una descripción clara del error.
- Captura de pantalla (si aplica).
