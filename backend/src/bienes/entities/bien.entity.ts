import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { Ubicacion } from '../../ubicaciones/entities/ubicacion.entity';
import { Responsable } from '../../responsables/entities/responsable.entity';
import { CategoriaSudebip } from '../../categorias-sudebip/entities/categoria-sudebip.entity';
import { User } from '../../users/entities/user.entity';

export enum EstadoBien {
    ACTIVO = 'ACTIVO',
    INACTIVO = 'INACTIVO',
    EN_REPARACION = 'EN_REPARACION',
    DESINCORPORADO = 'DESINCORPORADO',
}

export enum CondicionBien {
    EXCELENTE = 'EXCELENTE',
    BUENO = 'BUENO',
    REGULAR = 'REGULAR',
    MALO = 'MALO',
    OBSOLETO = 'OBSOLETO',
}

@Entity('bienes')
export class Bien {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'codigo_sudebip', length: 10 })
    @Index()
    codigoSudebip: string;

    @Column({ name: 'codigo_interno', unique: true, length: 50 })
    @Index()
    codigoInterno: string;

    @Column({ name: 'codigo_barras', unique: true, length: 100, nullable: true })
    @Index()
    codigoBarras: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ length: 100, nullable: true })
    marca: string;

    @Column({ length: 100, nullable: true })
    modelo: string;

    @Column({ length: 100, nullable: true })
    serial: string;

    @Column({ name: 'fecha_adquisicion', type: 'date', nullable: true })
    fechaAdquisicion: Date;

    @Column({
        type: 'enum',
        enum: EstadoBien,
        default: EstadoBien.ACTIVO,
    })
    @Index()
    estado: EstadoBien;

    @Column({
        type: 'enum',
        enum: CondicionBien,
        default: CondicionBien.BUENO,
    })
    condicion: CondicionBien;

    @Column({ name: 'ubicacion_id' })
    @Index()
    ubicacionId: number;

    @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'ubicacion_id' })
    ubicacion: Ubicacion;

    @Column({ name: 'responsable_id' })
    responsableId: number;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'responsable_id' })
    responsable: Responsable;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ name: 'categoria_sudebip_id' })
    @Index()
    categoriaSudebipId: number;

    @ManyToOne(() => CategoriaSudebip)
    @JoinColumn({ name: 'categoria_sudebip_id' })
    categoriaSudebip: CategoriaSudebip;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    creator: User;
}
