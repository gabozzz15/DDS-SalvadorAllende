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

@Entity('asignaciones')
export class Asignacion {
    @PrimaryGeneratedColumn({ name: 'id_asignacion' })
    id: number;

    @Column({ name: 'id_bien' })
    @Index()
    idBien: number;

    @ManyToOne(() => Bien)
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @Column({ name: 'ubicacion_destino_id' })
    @Index()
    ubicacionDestinoId: number;

    @ManyToOne(() => UnidadAdministrativa)
    @JoinColumn({ name: 'ubicacion_destino_id' })
    ubicacionDestino: UnidadAdministrativa;

    @Column({ name: 'responsable_destino_id' })
    responsableDestinoId: number;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'responsable_destino_id' })
    responsableDestino: Responsable;

    @Column({ type: 'text' })
    motivo: string;

    @CreateDateColumn({ name: 'fecha_asignacion' })
    @Index()
    fechaAsignacion: Date;

    @Column({ name: 'asignado_por' })
    asignadoPor: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'asignado_por' })
    asignador: User;

    @Column({ type: 'text', nullable: true })
    observaciones: string;
}
