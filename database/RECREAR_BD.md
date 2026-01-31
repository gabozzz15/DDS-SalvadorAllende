# Recrear Base de Datos - Migración SUDEBIP

## Pasos para recrear la base de datos

### 1. Detener los servidores
```powershell
# En las terminales de backend y frontend, presiona Ctrl+C
```

### 2. Acceder a MySQL
```powershell
# Abre una terminal y ejecuta:
mysql -u root -p
```

### 3. Eliminar y recrear la base de datos
```sql
DROP DATABASE IF EXISTS bienes_salvador_allende;
CREATE DATABASE bienes_salvador_allende CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 4. Ejecutar el schema
```powershell
cd c:\laragon\www\DDS-SalvadorAllende\database
mysql -u root -p bienes_salvador_allende < schema.sql
```

### 5. Cargar los seeds
```powershell
mysql -u root -p bienes_salvador_allende < seeds.sql
```

### 6. Reiniciar los servidores
```powershell
# Terminal 1 - Backend
cd c:\laragon\www\DDS-SalvadorAllende\backend
npm run start:dev

# Terminal 2 - Frontend
cd c:\laragon\www\DDS-SalvadorAllende\frontend
npm run dev
```

## Notas Importantes

- ⚠️ **TODOS LOS DATOS ACTUALES SE PERDERÁN**
- ✅ El schema.sql ya está actualizado con la estructura normalizada
- ✅ El seeds.sql contiene datos de prueba
- 🔄 El backend aún tiene algunos servicios pendientes de actualizar
- 🔄 El frontend necesita actualizarse completamente

## Próximos pasos después de recrear la BD

1. Esperar a que se completen las actualizaciones del backend
2. Actualizar el frontend
3. Probar la funcionalidad completa
