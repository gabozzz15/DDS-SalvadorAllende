export interface User {
    id: number;
    username: string;
    nombreCompleto: string;
    email: string;
    role: 'ADMIN' | 'USER';
    activo: boolean;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface Bien {
    id: number;
    codigoInterno: string;
    codigoBarras?: string;
    descripcion: string;
    serialBien?: string;
    marca?: string;
    modelo?: string;
    idCategoriaEspecifica: number;
    idUnidadAdministrativa: number;
    idResponsableUso: number;
    idTipoOrigen: number;
    estatusUso: 'ACTIVO' | 'INACTIVO' | 'EN_REPARACION' | 'DESINCORPORADO';
    condicionFisica: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO' | 'OBSOLETO';
    fechaAdquisicion?: string;
    fechaIngreso?: string;
    fechaInicioRegistro: string;
    fechaFinalizaRegistro?: string;
    observacion?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: number;
}

export interface UnidadAdministrativa {
    id: number;
    codigoUnidadSudebip: string;
    nombre: string;
    descripcion?: string;
    responsableUnidad?: string;
    activo: boolean;
}

export interface Responsable {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    email?: string;
    idUnidadAdscripcion: number;
    cargo?: string;
    tipoResponsableSudebip: 'D' | 'U' | 'C';
    firmaDigital?: string;
    aceptaResponsabilidad: boolean;
    fechaAceptacion?: string;
    observaciones?: string;
    activo: boolean;
}

export interface TipoOrigen {
    id: number;
    nombre: string;
}

export interface Transferencia {
    id: number;
    idBien: number;
    ubicacionOrigenId: number;
    ubicacionDestinoId: number;
    responsableOrigenId: number;
    responsableDestinoId: number;
    motivo: string;
    estatus: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
    fechaSolicitud: string;
    fechaAprobacion?: string;
    fechaEjecucion?: string;
    solicitadoPor: number;
    aprobadoPor?: number;
    observaciones?: string;
}

export interface Desincorporacion {
    id: number;
    idBien: number;
    motivo: 'PERDIDA' | 'DAÑO' | 'OBSOLESCENCIA' | 'DONACION_BAJA' | 'OTRO';
    descripcionMotivo: string;
    valorResidual?: number;
    documentoRespaldo?: string;
    estatus: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
    fechaSolicitud: string;
    fechaAprobacion?: string;
    fechaEjecucion?: string;
    solicitadoPor: number;
    aprobadoPor?: number;
    observaciones?: string;
}

export interface Alerta {
    id: number;
    tipo: 'INVENTARIO_VENCIDO' | 'SIN_TRAZABILIDAD' | 'AUDITORIA_PROXIMA' | 'OTRO';
    severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    titulo: string;
    descripcion: string;
    bienId?: number;
    leida: boolean;
    fechaCreacion: string;
    fechaLectura?: string;
}

export interface CategoriaSudebip {
    id: number;
    codigo: string;
    nivel: 'GENERAL' | 'SUBCATEGORIA' | 'ESPECIFICA';
    descripcion: string;
    categoriaPadreId?: number;
}
