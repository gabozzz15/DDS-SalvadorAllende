# ✅ Verificación Rápida del Sistema

## Estado Actual
- ✅ Base de datos creada y con datos
- ✅ Backend corriendo en puerto 3000
- ✅ Frontend corriendo en puerto 5173

## Pasos Finales

### 1. Verificar que el backend está conectado a la BD

El backend ya está corriendo. Verifica en la terminal que no haya errores de conexión.

### 2. Probar el Login

Abre tu navegador en: **http://localhost:5173**

**Credenciales:**
- Usuario: `admin`
- Contraseña: `admin123`

### 3. Si ves errores en el navegador

Abre la consola del navegador (F12) y verifica:

**Error común:** "Network Error" o "CORS"
**Solución:** Verifica que `backend/.env` tenga:
```
CORS_ORIGIN=http://localhost:5173
```

**Error común:** "Cannot connect to database"
**Solución:** El backend no puede conectarse a MySQL. Verifica `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_aqui
DB_DATABASE=bienes_salvador_allende
```

### 4. Probar la API directamente

Si el frontend no funciona, prueba el backend directamente:

**Opción A - Desde el navegador:**
```
http://localhost:3000/api/auth/login
```

**Opción B - Desde PowerShell:**
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

Si esto funciona, recibirás un token JWT.

## ¿Qué hacer ahora?

1. **Abre el navegador** en http://localhost:5173
2. **Inicia sesión** con admin/admin123
3. **Explora el sistema:**
   - Dashboard con estadísticas
   - Módulo de Bienes
   - Sidebar responsivo

## Si algo no funciona

Dime qué error ves exactamente:
- ¿Error en el navegador? (muéstrame la consola F12)
- ¿Error en el backend? (muéstrame la terminal)
- ¿Página en blanco? (verifica la consola del navegador)
