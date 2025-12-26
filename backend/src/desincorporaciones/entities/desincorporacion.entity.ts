import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Bien } from '../../bienes/entities/bien.entity';
import { User } from '../../users/entities/user.entity';

export enum MotivoDesincorporacion {
    PERDIDA = 'PERDIDA',
    DAÑO = 'DAÑO',
    OBSOLESCENCIA = 'OBSOLESCENCIA',
    DONACION_BAJA = 'DONACION_BAJA',
    OTRO = 'OTRO',
}

export enum EstatusDesincorporacion {
    PENDIENTE = 'PENDIENTE',
    APROBADA = 'APROBADA',
    RECHAZADA = 'RECHAZADA',
    EJECUTADA = 'EJECUTADA',
}

@Entity('desincorporaciones')
export class Desincorporacion {
    @PrimaryGeneratedColumn({ name: 'id_desincorporacion' })
    id: number;

    @Column({ name: 'id_bien', unique: true })
    @Index()
    idBien: number;

    @ManyToOne(() => Bien)
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @Column({
        type: 'enum',
        enum: MotivoDesincorporacion,
    })
    @Index()
    motivo: MotivoDesincorporacion;

    @Column({ name: 'descripcion_motivo', type: 'text' })
    descripcionMotivo: string;

    @CreateDateColumn({ name: 'fecha_solicitud' })
    @Index()
    fechaSolicitud: Date;

    @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
    fechaAprobacion: Date;

    @Column({ name: 'fecha_ejecucion', type: 'timestamp', nullable: true })
    fechaEjecucion: Date;

    @Column({
        type: 'enum',
        enum: EstatusDesincorporacion,
        default: EstatusDesincorporacion.PENDIENTE,
    })
    @Index()
    estatus: EstatusDesincorporacion;

    @Column({ name: 'valor_residual', type: 'decimal', precision: 15, scale: 2, default: 0 })
    valorResidual: number;

    @Column({ name: 'documento_respaldo', length: 255, nullable: true })
    documentoRespaldo: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ name: 'solicitado_por' })
    solicitadoPor: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'solicitado_por' })
    solicitante: User;

    @Column({ name: 'aprobado_por', nullable: true })
    aprobadoPor: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'aprobado_por' })
    aprobador: User;
}
