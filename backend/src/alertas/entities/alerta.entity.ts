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

export enum TipoAlerta {
    INVENTARIO_VENCIDO = 'INVENTARIO_VENCIDO',
    SIN_TRAZABILIDAD = 'SIN_TRAZABILIDAD',
    AUDITORIA_PROXIMA = 'AUDITORIA_PROXIMA',
    OTRO = 'OTRO',
}

export enum SeveridadAlerta {
    BAJA = 'BAJA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA',
}

@Entity('alertas')
export class Alerta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: TipoAlerta,
    })
    @Index()
    tipo: TipoAlerta;

    @Column({
        type: 'enum',
        enum: SeveridadAlerta,
        default: SeveridadAlerta.MEDIA,
    })
    @Index()
    severidad: SeveridadAlerta;

    @Column({ length: 255 })
    titulo: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ name: 'bien_id', nullable: true })
    @Index()
    bienId: number;

    @ManyToOne(() => Bien, { nullable: true })
    @JoinColumn({ name: 'bien_id' })
    bien: Bien;

    @Column({ default: false })
    @Index()
    leida: boolean;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_lectura', type: 'timestamp', nullable: true })
    fechaLectura: Date;
}
