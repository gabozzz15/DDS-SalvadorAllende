# Guía de Actualización Frontend - Migración SUDEBIP

## Cambios Necesarios en Componentes

### 1. BienModal.tsx

**Cambios en formData y tipos:**
```typescript
// ANTES:
codigoSudebip: '',
ubicacionId: '',
responsableId: '',
categoriaSudebipId: '',
estado: 'ACTIVO',
condicion: 'BUENO',
serial: '',
observaciones: '',
tipoOrigen: 'COMPRA',

// DESPUÉS:
codigoInterno: '',
idUnidadAdministrativa: '',
idResponsableUso: '',
idCategoriaEspecifica: '',
idTipoOrigen: 1,
estatusUso: 'ACTIVO',
condicionFisica: 'BUENO',
serialBien: '',
observacion: '',
```

**Cambios en API calls:**
```typescript
// ANTES:
api.get('/ubicaciones')
api.get('/categorias-sudebip')

// DESPUÉS:
api.get('/unidades-administrativas')
api.get('/categorias-sudebip') // Sin cambio
api.get('/tipos-origen') // Nuevo
```

**Cambios en JSX:**
```typescript
// ANTES:
<select name="ubicacionId">
<select name="responsableId">
<select name="estado">
<select name="condicion">
<input name="serial">
<textarea name="observaciones">

// DESPUÉS:
<select name="idUnidadAdministrativa">
<select name="idResponsableUso">
<select name="estatusUso">
<select name="condicionFisica">
<input name="serialBien">
<textarea name="observacion">
```

### 2. Bienes.tsx

**Cambios en filtros:**
```typescript
// ANTES:
const [filters, setFilters] = useState({
  estado: '',
  ubicacionId: '',
  responsableId: '',
  search: ''
});

// DESPUÉS:
const [filters, setFilters] = useState({
  estatusUso: '',
  idUnidadAdministrativa: '',
  idResponsableUso: '',
  search: ''
});
```

**Cambios en tabla:**
```typescript
// ANTES:
<td>{bien.ubicacion?.nombre}</td>
<td>{bien.responsable?.nombreCompleto}</td>
<td>{bien.estado}</td>
<td>{bien.condicion}</td>

// DESPUÉS:
<td>{bien.unidadAdministrativa?.nombre}</td>
<td>{bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'N/A'}</td>
<td>{bien.estatusUso}</td>
<td>{bien.condicionFisica}</td>
```

### 3. Responsables.tsx

**Cambios en formData:**
```typescript
// ANTES:
departamentoId: '',

// DESPUÉS:
idUnidadAdscripcion: '',
tipoResponsableSudebip: 'U',
```

### 4. Transferencias.tsx

**Cambios en formData:**
```typescript
// ANTES:
bienId: '',
estado: 'PENDIENTE',

// DESPUÉS:
idBien: '',
estatus: 'PENDIENTE',
```

**Cambios en métodos:**
```typescript
// ANTES:
api.post(`/transferencias/${id}/approve`)
api.post(`/transferencias/${id}/reject`)

// DESPUÉS:
api.patch(`/transferencias/${id}/aprobar`)
api.patch(`/transferencias/${id}/rechazar`)
```

### 5. Desincorporaciones.tsx

**Cambios en formData:**
```typescript
// ANTES:
bienId: '',
estado: 'PENDIENTE',

// DESPUÉS:
idBien: '',
estatus: 'PENDIENTE',
```

**Cambios en métodos:**
```typescript
// ANTES:
api.post(`/desincorporaciones/${id}/approve`)
api.post(`/desincorporaciones/${id}/reject`)

// DESPUÉS:
api.patch(`/desincorporaciones/${id}/aprobar`)
api.patch(`/desincorporaciones/${id}/rechazar`)
```

## Búsqueda y Reemplazo Global

Usa estos reemplazos en VS Code (Ctrl+Shift+H):

1. `ubicacionId` → `idUnidadAdministrativa`
2. `responsableId` → `idResponsableUso`
3. `categoriaSudebipId` → `idCategoriaEspecifica`
4. `bienId` → `idBien`
5. `\.estado` → `.estatusUso` (con regex)
6. `\.condicion` → `.condicionFisica` (con regex)
7. `\.serial` → `.serialBien` (con regex)
8. `observaciones` → `observacion` (solo en Bien)
9. `/ubicaciones` → `/unidades-administrativas`
10. `departamentoId` → `idUnidadAdscripcion`

## Nuevos Endpoints

- `GET /unidades-administrativas` (reemplaza `/ubicaciones`)
- `GET /tipos-origen` (nuevo)
- `PATCH /transferencias/:id/aprobar` (reemplaza `/approve`)
- `PATCH /transferencias/:id/rechazar` (reemplaza `/reject`)
- `PATCH /desincorporaciones/:id/aprobar` (reemplaza `/approve`)
- `PATCH /desincorporaciones/:id/rechazar` (reemplaza `/reject`)
