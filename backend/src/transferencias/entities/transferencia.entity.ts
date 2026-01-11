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
import { UnidadAdministrativa } from '../../unidades-administrativas/entities/unidad-administrativa.entity';
import { Responsable } from '../../responsables/entities/responsable.entity';
import { User } from '../../users/entities/user.entity';

export enum EstatusTransferencia {
    PENDIENTE = 'PENDIENTE',
    APROBADA = 'APROBADA',
    RECHAZADA = 'RECHAZADA',
    EJECUTADA = 'EJECUTADA',
}

export enum TipoTransferencia {
    PERMANENTE = 'PERMANENTE',
    TEMPORAL = 'TEMPORAL',
}

@Entity('transferencias')
export class Transferencia {
    @PrimaryGeneratedColumn({ name: 'id_solicitud' })
    id: number;

    @Column({ name: 'id_bien' })
    @Index()
    idBien: number;

    @ManyToOne(() => Bien)
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @Column({ name: 'ubicacion_origen_id' })
    @Index()
    ubicacionOrigenId: number;

    @ManyToOne(() => UnidadAdministrativa)
    @JoinColumn({ name: 'ubicacion_origen_id' })
    ubicacionOrigen: UnidadAdministrativa;

    @Column({ name: 'ubicacion_destino_id' })
    @Index()
    ubicacionDestinoId: number;

    @ManyToOne(() => UnidadAdministrativa)
    @JoinColumn({ name: 'ubicacion_destino_id' })
    ubicacionDestino: UnidadAdministrativa;

    @Column({ name: 'responsable_origen_id' })
    responsableOrigenId: number;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'responsable_origen_id' })
    responsableOrigen: Responsable;

    @Column({ name: 'responsable_destino_id' })
    responsableDestinoId: number;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'responsable_destino_id' })
    responsableDestino: Responsable;

    @Column({ type: 'text' })
    motivo: string;

    @CreateDateColumn({ name: 'fecha_solicitud' })
    @Index()
    fechaSolicitud: Date;

    @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
    fechaAprobacion: Date;

    @Column({ name: 'fecha_ejecucion', type: 'timestamp', nullable: true })
    fechaEjecucion: Date;

    @Column({
        type: 'enum',
        enum: EstatusTransferencia,
        default: EstatusTransferencia.PENDIENTE,
    })
    @Index()
    estatus: EstatusTransferencia;

    @Column({
        name: 'tipo_transferencia',
        type: 'enum',
        enum: TipoTransferencia,
        default: TipoTransferencia.PERMANENTE,
    })
    @Index()
    tipoTransferencia: TipoTransferencia;

    @Column({ name: 'fecha_retorno_esperada', type: 'timestamp', nullable: true })
    fechaRetornoEsperada: Date;

    @Column({ name: 'fecha_devolucion', type: 'timestamp', nullable: true })
    fechaDevolucion: Date;

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
