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
import { Ubicacion } from '../../ubicaciones/entities/ubicacion.entity';

@Entity('responsables')
export class Responsable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 20 })
    @Index()
    cedula: string;

    @Column({ length: 100 })
    nombres: string;

    @Column({ length: 100 })
    apellidos: string;

    @Column({ length: 20, nullable: true })
    telefono: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Column({ name: 'departamento_id' })
    @Index()
    departamentoId: number;

    @ManyToOne(() => Ubicacion)
    @JoinColumn({ name: 'departamento_id' })
    departamento: Ubicacion;

    @Column({ length: 100, nullable: true })
    cargo: string;

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

    // Computed property
    get nombreCompleto(): string {
        return `${this.nombres} ${this.apellidos}`;
    }
}
