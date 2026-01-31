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
import { Ubicacion } from '../../ubicaciones/entities/ubicacion.entity';
import { Responsable } from '../../responsables/entities/responsable.entity';
import { User } from '../../users/entities/user.entity';

export enum EstadoTransferencia {
    PENDIENTE = 'PENDIENTE',
    APROBADA = 'APROBADA',
    RECHAZADA = 'RECHAZADA',
    EJECUTADA = 'EJECUTADA',
}

@Entity('transferencias')
export class Transferencia {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'bien_id' })
    @Index()
    bienId: number;

    @ManyToOne(() => Bien)
    @JoinColumn({ name: 'bien_id' })
    bien: Bien;

    @Column({ name: 'ubicacion_origen_id' })
    @Index()
    ubicacionOrigenId: number;

    @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'ubicacion_origen_id' })
    ubicacionOrigen: Ubicacion;

    @Column({ name: 'ubicacion_destino_id' })
    @Index()
    ubicacionDestinoId: number;

    @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'ubicacion_destino_id' })
    ubicacionDestino: Ubicacion;

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
        enum: EstadoTransferencia,
        default: EstadoTransferencia.PENDIENTE,
    })
    @Index()
    estado: EstadoTransferencia;

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
