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

export enum TipoProceso {
    REGISTRO = 'REGISTRO',
    TRANSFERENCIA = 'TRANSFERENCIA',
    DESINCORPORACION = 'DESINCORPORACION',
    MANTENIMIENTO = 'MANTENIMIENTO',
    OTRO = 'OTRO',
}

@Entity('fotos')
export class Foto {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'bien_id' })
    @Index()
    bienId: number;

    @ManyToOne(() => Bien)
    @JoinColumn({ name: 'bien_id' })
    bien: Bien;

    @Column({ name: 'ruta_archivo', length: 255 })
    rutaArchivo: string;

    @Column({ name: 'nombre_original', length: 255 })
    nombreOriginal: string;

    @Column({
        name: 'tipo_proceso',
        type: 'enum',
        enum: TipoProceso,
    })
    @Index()
    tipoProceso: TipoProceso;

    @Column({ name: 'proceso_id', nullable: true })
    @Index()
    procesoId: number;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'tamano_bytes', nullable: true })
    tamanoBytes: number;

    @Column({ name: 'mime_type', length: 50, nullable: true })
    mimeType: string;

    @Column({ name: 'uploaded_by', nullable: true })
    uploadedBy: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'uploaded_by' })
    uploader: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
