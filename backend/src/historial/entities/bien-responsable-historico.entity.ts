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
import { Responsable } from '../../responsables/entities/responsable.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bienes_responsables_historico')
@Index(['idBien'])
@Index(['idResponsable'])
@Index(['activo'])
@Index(['fechaAsignacion'])
export class BienResponsableHistorico {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_bien' })
    idBien: number;

    @Column({ name: 'id_responsable' })
    idResponsable: number;

    @CreateDateColumn({ name: 'fecha_asignacion' })
    fechaAsignacion: Date;

    @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
    fechaFin: Date | null;

    @Column({ name: 'motivo_asignacion', type: 'text', nullable: true })
    motivoAsignacion: string;

    @Column({ name: 'asignado_por', nullable: true })
    asignadoPor: number;

    @Column({ default: true })
    activo: boolean;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relaciones
    @ManyToOne(() => Bien, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'id_responsable' })
    responsable: Responsable;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'asignado_por' })
    usuarioAsignador: User;
}
