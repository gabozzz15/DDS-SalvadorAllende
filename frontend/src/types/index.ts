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
    codigoSudebip: string;
    codigoInterno: string;
    codigoBarras?: string;
    descripcion: string;
    marca?: string;
    modelo?: string;
    serial?: string;
    fechaAdquisicion?: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'EN_REPARACION' | 'DESINCORPORADO';
    condicion: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO' | 'OBSOLETO';
    ubicacionId: number;
    responsableId: number;
    categoriaSudebipId: number;
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Responsable {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    telefono?: string;
    email?: string;
    departamentoId: number;
    cargo?: string;
    firmaDigital?: string;
    aceptaResponsabilidad: boolean;
    fechaAceptacion?: string;
    activo: boolean;
}

export interface Transferencia {
    id: number;
    bienId: number;
    ubicacionOrigenId: number;
    ubicacionDestinoId: number;
    responsableOrigenId: number;
    responsableDestinoId: number;
    motivo: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
    fechaSolicitud: string;
    fechaAprobacion?: string;
    fechaEjecucion?: string;
    solicitadoPor: number;
    aprobadoPor?: number;
    observaciones?: string;
}

export interface Desincorporacion {
    id: number;
    bienId: number;
    motivo: 'PERDIDA' | 'DAÑO' | 'OBSOLESCENCIA' | 'DONACION' | 'OTRO';
    descripcionMotivo: string;
    valorResidual?: number;
    documentoRespaldo?: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
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
