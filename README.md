# CICTAI 2026 — I Congreso Internacional UNTELS

Sistema de registro, ponencias y matrículas para el **I Congreso Internacional Científico de Ciencias y Tecnologías Aplicadas a la Ingeniería**, organizado por la Universidad Nacional Tecnológica de Lima Sur.

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL
- **Base de datos:** Vercel Neon (PostgreSQL en la nube)
- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JS

## Requisitos

- Node.js >= 18
- npm

## Configuración de la base de datos (PostgreSQL en Neon)

El proyecto usa **PostgreSQL en la nube** con [Vercel Neon](https://neon.tech). No necesitás Docker ni instalar nada local.

### 1. Crear una base de datos en Neon (si no tenés una)

1. Andá a [console.neon.tech](https://console.neon.tech) e iniciá sesión con tu cuenta de GitHub o Google.
2. Creá un proyecto nuevo (o usá uno existente).
3. En el dashboard del proyecto, andá a **Connect** → **Connection String** → **Prisma / General**.
4. Copiá la URL que se ve así:

   ```
   postgresql://usuario:contraseña@ep-...us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Configurar el archivo `.env`

```bash
cd backend

# Crear el .env a partir del template
cp .env.template .env
```

Abrí `.env` y **reemplazá el valor de `DATABASE_URL`** con la connection string de Neon que copiaste en el paso anterior.

> ⚠️ **Importante:** no compartas tu `.env`. La `DATABASE_URL` contiene la contraseña de la base de datos y nunca debe subirse a git (`.env` ya está en `.gitignore`).

### 3. Iniciar el servidor

```bash
cd backend
npm install
npm run start:dev    # Modo desarrollo (con watch)
```

El servidor se levanta en **http://localhost:3000** y sirve tanto el frontend como la API.

### 4. Sembrar datos iniciales

Con el servidor corriendo, abrí otra terminal y ejecutá:

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
