import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { UnidadAdministrativa } from '../../unidades-administrativas/entities/unidad-administrativa.entity';

export enum TipoResponsableSudebip {
    D = 'D', // Administrativo
    U = 'U', // Uso Directo
    C = 'C', // Cuido Directo
}

@Entity('responsables')
export class Responsable {
    @PrimaryGeneratedColumn({ name: 'id_responsable' })
    id: number;

    @Column({ length: 20, unique: true })
    @Index()
    cedula: string;

    @Column({ length: 100 })
    @Index()
    nombres: string;

    @Column({ length: 100 })
    @Index()
    apellidos: string;

    @Column({ length: 20, nullable: true })
    telefono: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Column({ name: 'id_unidad_adscripcion' })
    @Index()
    idUnidadAdscripcion: number;

    @ManyToOne(() => UnidadAdministrativa)
    @JoinColumn({ name: 'id_unidad_adscripcion' })
    unidadAdscripcion: UnidadAdministrativa;

    @Column({ length: 100, nullable: true })
    cargo: string;

    @Column({
        name: 'tipo_responsable_sudebip',
        type: 'enum',
        enum: TipoResponsableSudebip,
        default: TipoResponsableSudebip.U,
    })
    @Index()
    tipoResponsableSudebip: TipoResponsableSudebip;

    @Column({ name: 'firma_digital', type: 'longtext', nullable: true })
    firmaDigital: string;

    @Column({ name: 'fecha_aceptacion', type: 'timestamp', nullable: true })
    fechaAceptacion: Date;

    @Column({ name: 'acepta_responsabilidad', default: false })
    aceptaResponsabilidad: boolean;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ default: true })
    @Index()
    activo: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
