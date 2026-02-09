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

export enum AccionUsuarioBien {
    CREACION = 'CREACION',
    MODIFICACION = 'MODIFICACION',
    TRANSFERENCIA = 'TRANSFERENCIA',
    DESINCORPORACION = 'DESINCORPORACION',
    ASIGNACION = 'ASIGNACION',
    MANTENIMIENTO = 'MANTENIMIENTO',
}

@Entity('bienes_usuarios_historico')
@Index(['idBien'])
@Index(['idUsuario'])
@Index(['accion'])
@Index(['fechaAccion'])
export class BienUsuarioHistorico {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_bien' })
    idBien: number;

    @Column({ name: 'id_usuario' })
    idUsuario: number;

    @Column({
        type: 'enum',
        enum: AccionUsuarioBien,
    })
    accion: AccionUsuarioBien;

    @CreateDateColumn({ name: 'fecha_accion' })
    fechaAccion: Date;

    @Column({ type: 'json', nullable: true })
    detalles: any;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress: string;

    // Relaciones
    @ManyToOne(() => Bien, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'id_usuario' })
    usuario: User;
}
