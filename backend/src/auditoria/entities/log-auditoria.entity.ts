import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('logs_auditoria')
export class LogAuditoria {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: number;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 50 })
    @Index()
    accion: string;

    @Column({ length: 50 })
    @Index()
    entidad: string;

    @Column({ name: 'entidad_id', nullable: true })
    entidadId: number;

    @Column({ type: 'json', nullable: true })
    detalles: any;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;
}
