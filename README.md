# WMS Qori Foods

Sistema web de gestión de almacén de insumos (WMS) para Qori Foods, empresa peruana productora de pasta con quinua orgánica.

## Stack tecnológico

- **Frontend:** Vite + React 19 + JavaScript puro + Tailwind CSS v4
- **Backend:** Node.js + Express (endpoints mock)
- **Base de datos:** PostgreSQL (futura implementación)

## Requisitos

- Node.js 18+
- npm

## Instalación y ejecución

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecuta en `http://localhost:5173`.

### Backend (opcional — actualmente solo endpoints mock)

```bash
cd backend
npm install
npm run dev
```

El backend se ejecuta en `http://localhost:3000`.

## Usuarios de prueba

| Rol | Nombre | Email | Contraseña |
|---|---|---|---|
| Jefe de Almacén | María Flores | maria@qorifoods.com | jefe123 |
| Supervisor de Almacén | Pedro Salas | pedro@qorifoods.com | super123 |
| Operario de Almacén | Carlos Quispe | carlos@qorifoods.com | operario123 |
| Operario de Almacén | Luis Mamani | luis@qorifoods.com | operario123 |
| Supervisor (inactivo) | Ana Torres | ana@qorifoods.com | super123 |
