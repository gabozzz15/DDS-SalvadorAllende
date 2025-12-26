import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 50 })
    @Index()
    username: string;

    @Column({ length: 255 })
    password: string;

    @Column({ name: 'nombre_completo', length: 150 })
    nombreCompleto: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    @Index()
    role: UserRole;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
