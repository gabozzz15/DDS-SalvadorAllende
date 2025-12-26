-- ============================================
-- Guía de Configuración del Backend
-- Sistema de Gestión de Bienes - Salvador Allende
-- ============================================

# PASO 1: Configurar la Base de Datos MySQL

## 1.1 Crear la base de datos
```bash
# Opción A: Desde la terminal
mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE IF NOT EXISTS bienes_salvador_allende CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

## 1.2 Cargar el esquema
```bash
cd C:\laragon\www\DDS-SalvadorAllende
mysql -u root -p bienes_salvador_allende < database/schema.sql
```

## 1.3 Cargar los datos iniciales
```bash
mysql -u root -p bienes_salvador_allende < database/seeds_fixed.sql
```

**Nota:** He creado un archivo `seeds_fixed.sql` que corrige el error que encontraste.

---

# PASO 2: Configurar el Backend (NestJS)

## 2.1 Verificar el archivo .env
Asegúrate de que existe `backend/.env` con:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=bienes_salvador_allende

# JWT
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion-12345
JWT_EXPIRATION=24h

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**⚠️ IMPORTANTE:** Cambia `DB_PASSWORD` por tu contraseña de MySQL.

## 2.2 Instalar dependencias (si no lo has hecho)
```bash
cd backend
npm install
```

## 2.3 Iniciar el servidor backend
```bash
npm run start:dev
```

Deberías ver:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application is running on: http://localhost:3000
```

---

# PASO 3: Verificar que todo funciona

## 3.1 Probar el endpoint de salud
Abre tu navegador o Postman:
```
GET http://localhost:3000/api
```

Deberías ver: `{"message":"API funcionando correctamente"}`

## 3.2 Probar el login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Deberías recibir un token JWT.

---

# PASO 4: Iniciar el Frontend

## 4.1 Instalar dependencias (si no lo has hecho)
```bash
cd frontend
npm install
```

## 4.2 Iniciar el servidor de desarrollo
```bash
npm run dev
```

Deberías ver:
```
VITE v7.2.2  ready in XXX ms

➜  Local:   http://localhost:5173/
```

## 4.3 Abrir en el navegador
Abre `http://localhost:5173` y deberías ver la página de login.

---

# Solución de Problemas Comunes

## Error: "Cannot connect to database"
- Verifica que MySQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos existe

## Error: "Port 3000 already in use"
- Detén el proceso que usa el puerto 3000
- O cambia el puerto en `backend/.env`

## Error en seeds.sql (línea 70)
- Usa el archivo `seeds_fixed.sql` que he creado
- Este archivo corrige el problema de las subconsultas

## Frontend muestra página en blanco
- Verifica que el backend esté corriendo
- Abre la consola del navegador (F12) para ver errores
- Verifica que `frontend/.env` tenga `VITE_API_URL=http://localhost:3000/api`

---

# Resumen de Comandos

```bash
# Terminal 1 - Base de Datos
mysql -u root -p bienes_salvador_allende < database/schema.sql
mysql -u root -p bienes_salvador_allende < database/seeds_fixed.sql

# Terminal 2 - Backend
cd backend
npm install
npm run start:dev

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

¡Listo! Ahora deberías poder acceder a:
- Backend API: http://localhost:3000/api
- Frontend: http://localhost:5173
