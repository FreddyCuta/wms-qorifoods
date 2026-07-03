# Manual de configuración actual y despliegue del proyecto WMS Qori Foods

## 1. Resumen del proyecto

Este proyecto es un sistema web de gestión de almacén con arquitectura monolítica simple dividida en dos partes:

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express
- Base de datos: PostgreSQL

## 2. Estructura actual del repositorio

- [frontend](frontend): aplicación web
- [backend](backend): API REST
- [database/db.sql](database/db.sql): esquema y datos iniciales de PostgreSQL
- [README.md](README.md): documentación básica inicial

## 3. Configuración actual del proyecto

### 3.1 Frontend

Ubicación: [frontend](frontend)

Tecnologías:
- Vite
- React 19
- JavaScript
- Tailwind CSS v4
- Axios para peticiones HTTP

Comandos locales:
```bash
cd frontend
npm install
npm run dev
```

Puerto local esperado:
- http://localhost:5173

Archivo importante:
- [frontend/src/lib/api.js](frontend/src/lib/api.js)

Configuración actual:
- La URL base de la API se toma desde la variable de entorno `VITE_API_URL`.
- Si no existe, usa por defecto `http://localhost:3000/api`.

### 3.2 Backend

Ubicación: [backend](backend)

Tecnologías:
- Node.js
- Express
- PostgreSQL client (`pg`)
- dotenv
- CORS

Comandos locales:
```bash
cd backend
npm install
npm run dev
```

Puerto local esperado:
- http://localhost:3000

Archivos importantes:
- [backend/src/index.js](backend/src/index.js)
- [backend/src/db.js](backend/src/db.js)
- [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js)

Configuración actual:
- El backend expone rutas bajo `/api`.
- Usa `DATABASE_URL` para conectarse a PostgreSQL.
- CORS está configurado para permitir orígenes definidos en `CORS_ORIGINS`.
- En producción se debe permitir el dominio de Vercel.

### 3.3 Base de datos

Ubicación: [database/db.sql](database/db.sql)

Características:
- Esquema PostgreSQL completo.
- Inserta usuarios iniciales, insumos, ubicaciones, lotes, requerimientos y tareas.
- Está pensado para PostgreSQL 15+.

## 4. Estado actual del proyecto

### 4.1 Lo que ya está preparado para despliegue

Se ajustó lo siguiente:
- [frontend/src/lib/api.js](frontend/src/lib/api.js): ahora usa una URL configurable para el backend.
- [backend/src/index.js](backend/src/index.js): ahora soporta CORS configurable para entornos de producción.

### 4.2 Limitaciones actuales

- La autenticación es simple y compara correo/contraseña directamente contra la base de datos.
- No hay JWT ni sesiones seguras aún.
- La contraseña se almacena de forma simple en la base de datos.
- El proyecto está pensado como una primera versión funcional y no como un sistema enterprise de alto nivel.

## 5. Especificaciones de despliegue recomendadas

### Opción recomendada
- Frontend: Vercel
- Backend: Render
- Base de datos: Supabase Postgres

## 6. Despliegue del frontend en Vercel

### Requisitos
- Cuenta en Vercel
- Repositorio GitHub conectado

### Configuración en Vercel
- Framework: Vite
- Root Directory: [frontend](frontend)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Variables de entorno en Vercel
- `VITE_API_URL=https://tu-backend.onrender.com/api`

### Resultado esperado
- URL pública tipo:
```txt
https://tu-app.vercel.app
```

## 7. Despliegue del backend en Render

### Requisitos
- Cuenta en Render
- Repositorio GitHub conectado

### Configuración en Render
- Tipo de servicio: Web Service
- Root Directory: [backend](backend)
- Build Command: `npm install`
- Start Command: `npm start`

### Variables de entorno en Render
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`
- `CORS_ORIGINS=https://tu-app.vercel.app,http://localhost:5173`

### Resultado esperado
- URL pública tipo:
```txt
https://tu-backend.onrender.com
```

## 8. Despliegue de la base de datos en Supabase

### Requisitos
- Cuenta en Supabase
- Nuevo proyecto creado

### Pasos
1. Crear proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar el contenido de [database/db.sql](database/db.sql).
4. Obtener la URL de conexión PostgreSQL.

### Formato esperado de la URL
```txt
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

### Variable de entorno para el backend
```txt
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
```

## 9. Flujo de comunicación entre servicios

### Frontend -> Backend
- El frontend llama al backend usando `VITE_API_URL`.
- Ejemplo real:
```txt
https://tu-backend.onrender.com/api/auth/login
```

### Backend -> Base de datos
- El backend usa `DATABASE_URL` para conectar a Supabase.

## 10. Variables de entorno necesarias

### Frontend
```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

### Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
CORS_ORIGINS=https://tu-app.vercel.app,http://localhost:5173
```

## 11. Prompt listo para pasarle a una IA

Puedes copiar este texto y pasárselo a una IA:

"Actúa como un asistente de despliegue para este proyecto. Debes desplegar una aplicación web full stack con frontend en Vercel, backend en Render y base de datos en Supabase. El proyecto está en una carpeta con frontend, backend y database. El frontend usa Vite + React + JavaScript; el backend usa Node.js + Express; la base de datos es PostgreSQL. El backend debe conectarse a la base de datos usando la variable DATABASE_URL. El frontend debe usar la variable VITE_API_URL para apuntar al backend. El backend debe permitir CORS desde el dominio de Vercel. Revisa los archivos relevantes: frontend/src/lib/api.js, backend/src/index.js, backend/src/db.js, database/db.sql, backend/package.json, frontend/package.json. Luego explica paso a paso cómo desplegarlo, qué variables de entorno crear y qué comandos usar."

## 12. Checklist final antes de subir a producción

- [ ] Crear proyecto en Supabase y ejecutar [database/db.sql](database/db.sql)
- [ ] Obtener `DATABASE_URL` válida
- [ ] Desplegar backend en Render con `DATABASE_URL`
- [ ] Obtener URL pública del backend
- [ ] Desplegar frontend en Vercel con `VITE_API_URL`
- [ ] Añadir el dominio de Vercel a `CORS_ORIGINS`
- [ ] Probar login y pantallas principales

## 13. Nota importante

El proyecto actual está preparado para una primera versión pública, pero aún no implementa medidas de seguridad avanzadas como JWT, hashing de contraseñas o protección fuerte de sesiones.
