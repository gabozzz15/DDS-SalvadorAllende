import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum NivelCategoria {
    GENERAL = 'GENERAL',
    SUBCATEGORIA = 'SUBCATEGORIA',
    ESPECIFICA = 'ESPECIFICA',
}

@Entity('categorias_sudebip')
export class CategoriaSudebip {
    @PrimaryGeneratedColumn({ name: 'id_categoria' })
    id: number;

    @Column({ unique: true, length: 10 })
    @Index()
    codigo: string;

    @Column({
        type: 'enum',
        enum: NivelCategoria,
    })
    @Index()
    nivel: NivelCategoria;

    @Column({ length: 255 })
    descripcion: string;

    @Column({ name: 'categoria_padre_id', nullable: true })
    @Index()
    categoriaPadreId: number;

    @ManyToOne(() => CategoriaSudebip, { nullable: true })
    @JoinColumn({ name: 'categoria_padre_id' })
    categoriaPadre: CategoriaSudebip;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
