export interface RegistrarResponsableDto {
    idBien: number;
    idResponsable: number;
    motivoAsignacion: string;
    asignadoPor: number;
    observaciones?: string;
}

export interface RegistrarAccionUsuarioDto {
    idBien: number;
    idUsuario: number;
    accion: 'CREACION' | 'MODIFICACION' | 'TRANSFERENCIA' | 'DESINCORPORACION' | 'ASIGNACION' | 'MANTENIMIENTO';
    detalles?: any;
    ipAddress?: string;
}

export interface CambiarResponsableDto {
    idBien: number;
    idResponsableAnterior: number;
    idResponsableNuevo: number;
    motivo: string;
    cambiadoPor: number;
}
