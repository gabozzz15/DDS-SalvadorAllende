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

@Entity('fotos')
@Index(['idBien'])
@Index(['esPrincipal'])
@Index(['createdAt'])
export class Foto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_bien' })
    idBien: number;

    @Column({ name: 'nombre_archivo', length: 255 })
    nombreArchivo: string;

    @Column({ name: 'ruta_archivo', length: 500 })
    rutaArchivo: string;

    @Column({ name: 'tamano_bytes' })
    tamanoBytes: number;

    @Column({ name: 'tipo_mime', length: 100 })
    tipoMime: string;

    @Column({ name: 'es_principal', default: false })
    esPrincipal: boolean;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'uploaded_by', nullable: true })
    uploadedBy: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relaciones
    @ManyToOne(() => Bien, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_bien' })
    bien: Bien;

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'uploaded_by' })
    uploader: User;
}
