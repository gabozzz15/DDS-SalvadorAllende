# Sistema de Gestión de Bienes - Ambulatorio Salvador Allende

Sistema web para la gestión y seguimiento de bienes institucionales del Ambulatorio Urbano Tipo III "Dr. Salvador Allende", cumpliendo con las normativas del Manual SUDEBIP (2014).

## 📋 Características Principales

- ✅ Registro de bienes con códigos SUDEBIP jerárquicos (10 caracteres)
- ✅ Generación automática de códigos de barras Code128
- ✅ Gestión de transferencias internas con aprobación previa
- ✅ Registro de desincorporaciones con trazabilidad completa
- ✅ Reportes automáticos en PDF y Excel
- ✅ Dashboard con métricas y estadísticas
- ✅ Sistema de alertas para bienes vencidos y sin trazabilidad
- ✅ Auditoría completa de operaciones
- ✅ Control de acceso por roles (Administrador, Usuario)

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x
- **ORM**: TypeORM
- **Base de datos**: MySQL 8.x
- **Autenticación**: JWT + Bcrypt
- **Códigos de barras**: bwip-js (Code128)
- **Reportes**: pdfmake, xlsx

### Frontend
- **Framework**: React 18.x
- **Build tool**: Vite
- **Estilos**: TailwindCSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts

## 📦 Requisitos del Sistema

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd DDS-SalvadorAllende
```

### 2. Configurar la base de datos

#### Opción A: Usando Laragon (Recomendado para desarrollo local)
1. Abrir Laragon
2. Iniciar MySQL
3. Abrir HeidiSQL o phpMyAdmin
4. Ejecutar el script de creación:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

#### Opción B: MySQL directo
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=bienes_salvador_allende

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=development
```

Iniciar el servidor:
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 4. Configurar el Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 👤 Credenciales por Defecto

**⚠️ IMPORTANTE: Cambiar estas credenciales en producción**

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador

## 📁 Estructura del Proyecto

```
DDS-SalvadorAllende/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── users/          # Gestión de usuarios
│   │   ├── bienes/         # Gestión de bienes
│   │   ├── transferencias/ # Transferencias internas
│   │   ├── desincorporaciones/ # Desincorporaciones
│   │   ├── reportes/       # Generación de reportes
│   │   ├── auditoria/      # Logs de auditoría
│   │   ├── alertas/        # Sistema de alertas
│   │   └── database/       # Configuración de BD
│   └── package.json
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── layouts/       # Layouts
│   │   ├── contexts/      # Context API
│   │   └── services/      # Servicios API
│   └── package.json
└── database/              # Scripts SQL
    ├── schema.sql         # Esquema de base de datos
    └── seeds.sql          # Datos iniciales
```

## 🔧 Comandos Útiles

### Backend
```bash
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run start:prod   # Ejecutar en producción
npm run test         # Ejecutar tests
npm run lint         # Linter
```

### Frontend
```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar para producción
npm run preview      # Vista previa de producción
npm run lint         # Linter
```

## 📊 Procesos de Negocio (BPMN)

El sistema implementa los siguientes procesos según BPMN 2.0:

1. **Registro de Bien**: Captura, validación, generación de código de barras y aprobación
2. **Transferencia Interna**: Solicitud → Aprobación → Ejecución → Acta digital
3. **Desincorporación**: Solicitud → Aprobación → Cambio de estado → Reporte
4. **Generación de Reportes**: Inventario, transferencias, desincorporaciones y auditoría

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds: 10)
- Autenticación JWT con expiración configurable
- Control de acceso basado en roles (RBAC)
- Validación de datos en backend y frontend
- Logs de auditoría para todas las operaciones críticas
- Protección contra SQL injection (TypeORM)

## 📈 Cumplimiento Normativo

El sistema cumple con:
- Manual SUDEBIP 2014
- Códigos de clasificación jerárquicos de 10 caracteres
- Trazabilidad completa de bienes
- Documentación de transferencias y desincorporaciones
- Reportes para auditorías internas y externas

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Puerto en uso
- Cambiar el puerto en `.env` (backend) o `vite.config.ts` (frontend)

### Errores de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Licencia

Este proyecto es de uso interno del Ambulatorio Salvador Allende.

## 👥 Equipo de Desarrollo

Proyecto desarrollado como parte del Desarrollo de Software (DDS) para la gestión de bienes del Ambulatorio Salvador Allende.
