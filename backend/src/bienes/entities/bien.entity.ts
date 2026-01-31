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
import { CategoriaSudebip } from '../../categorias-sudebip/entities/categoria-sudebip.entity';
import { UnidadAdministrativa } from '../../unidades-administrativas/entities/unidad-administrativa.entity';
import { Responsable } from '../../responsables/entities/responsable.entity';
import { TipoOrigen } from '../../tipos-origen/entities/tipo-origen.entity';
import { User } from '../../users/entities/user.entity';

export enum EstatusUso {
    ACTIVO = 'ACTIVO',
    INACTIVO = 'INACTIVO',
    EN_REPARACION = 'EN_REPARACION',
    DESINCORPORADO = 'DESINCORPORADO',
}

export enum CondicionFisica {
    EXCELENTE = 'EXCELENTE',
    BUENO = 'BUENO',
    REGULAR = 'REGULAR',
    MALO = 'MALO',
    OBSOLETO = 'OBSOLETO',
}

@Entity('bienes')
export class Bien {
    @PrimaryGeneratedColumn({ name: 'id_bien' })
    id: number;

    @Column({ name: 'codigo_interno', length: 50, unique: true })
    @Index()
    codigoInterno: string;

    @Column({ name: 'codigo_barras', length: 100, unique: true, nullable: true })
    @Index()
    codigoBarras: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ name: 'serial_bien', length: 100, nullable: true })
    serialBien: string;

    @Column({ length: 100, nullable: true })
    marca: string;

    @Column({ length: 100, nullable: true })
    modelo: string;

    // Relaciones (Llaves Foráneas)
    @Column({ name: 'id_categoria_especifica' })
    @Index()
    idCategoriaEspecifica: number;

    @ManyToOne(() => CategoriaSudebip)
    @JoinColumn({ name: 'id_categoria_especifica' })
    categoriaEspecifica: CategoriaSudebip;

    @Column({ name: 'id_unidad_administrativa' })
    @Index()
    idUnidadAdministrativa: number;

    @ManyToOne(() => UnidadAdministrativa)
    @JoinColumn({ name: 'id_unidad_administrativa' })
    unidadAdministrativa: UnidadAdministrativa;

    @Column({ name: 'id_responsable_uso' })
    @Index()
    idResponsableUso: number;

    @ManyToOne(() => Responsable)
    @JoinColumn({ name: 'id_responsable_uso' })
    responsableUso: Responsable;

    @Column({ name: 'id_tipo_origen' })
    idTipoOrigen: number;

    @ManyToOne(() => TipoOrigen)
    @JoinColumn({ name: 'id_tipo_origen' })
    tipoOrigen: TipoOrigen;

    // Estatus / Fechas / Valores
    @Column({
        name: 'estatus_uso',
        type: 'enum',
        enum: EstatusUso,
        default: EstatusUso.ACTIVO,
    })
    @Index()
    estatusUso: EstatusUso;

    @Column({
        name: 'condicion_fisica',
        type: 'enum',
        enum: CondicionFisica,
        default: CondicionFisica.BUENO,
    })
    condicionFisica: CondicionFisica;

    @Column({ name: 'fecha_adquisicion', type: 'date', nullable: true })
    fechaAdquisicion: Date;

    @Column({ name: 'fecha_ingreso', type: 'date', nullable: true })
    fechaIngreso: Date;

    // KPI Fields
    @Column({ name: 'fecha_inicio_registro', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaInicioRegistro: Date;

    @Column({ name: 'fecha_finaliza_registro', type: 'timestamp', nullable: true })
    fechaFinalizaRegistro: Date;

    @Column({ type: 'text', nullable: true })
    observacion: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator: User;
}
