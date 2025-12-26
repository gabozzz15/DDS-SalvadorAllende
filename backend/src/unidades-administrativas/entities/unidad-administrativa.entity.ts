import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('unidades_administrativas')
export class UnidadAdministrativa {
    @PrimaryGeneratedColumn({ name: 'id_unidad' })
    id: number;

    @Column({ name: 'codigo_unidad_sudebip', length: 10, unique: true, nullable: true })
    @Index()
    codigoUnidadSudebip: string;

    @Column({ length: 100 })
    @Index()
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'responsable_unidad', length: 150, nullable: true })
    responsableUnidad: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
