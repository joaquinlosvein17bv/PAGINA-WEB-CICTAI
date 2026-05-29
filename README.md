# CICTAI 2026 — I Congreso Internacional UNTELS

Sistema de registro, ponencias y matrículas para el **I Congreso Internacional Científico de Ciencias y Tecnologías Aplicadas a la Ingeniería**, organizado por la Universidad Nacional Tecnológica de Lima Sur.

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL
- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JS
- **Infra:** Docker Compose (PostgreSQL + pgAdmin)

## Requisitos

- Node.js >= 18
- Docker Desktop (para la base de datos)
- npm

## Instalación y despliegue

```bash
# 1. Clonar e instalar dependencias
cd backend
npm install

# 2. Configurar variables de entorno
cp .env.template .env
# Editar .env si es necesario (por defecto funciona con Docker)
```

## Base de datos

```bash
# Levantar PostgreSQL y pgAdmin con Docker
docker compose up -d

# PostgreSQL: puerto 5427, usuario cictai_user, pass cictai_pass
# pgAdmin:    http://localhost:5050 (admin@cictai.com / admin123)
```

## Iniciar servidor

```bash
cd backend
npm run start:dev    # Modo desarrollo (con watch)
```

El servidor se levanta en **http://localhost:3000** y sirve tanto el frontend como la API.

## Sembrar datos iniciales

```bash
cd backend
npm run seed
```

Esto inserta:

- **3 códigos OTIC** para ponentes: `UNTELS2026`, `OTIC-CICTAI`, `PONENTE2026`
- **8 ejes temáticos** con sus iconos
- **1 usuario demo:** `ponente@demo.com` / `123456`
- **8 ponencias de ejemplo** (una por cada eje)

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Iniciar en producción |
| `npm run start:dev` | Iniciar en desarrollo con watch |
| `npm run build` | Compilar TypeScript |
| `npm run seed` | Ejecutar seed de datos |

## Rutas de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/validate-otic` | Validar código OTIC |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/ejes-tematicos` | Listar ejes temáticos |
| POST | `/ponencias` | Crear ponencia |
| GET | `/ponencias` | Listar ponencias |
| POST | `/matriculas` | Crear matrícula |
