import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('ubicaciones')
export class Ubicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    @Index()
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ length: 150, nullable: true })
    responsable: string;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
