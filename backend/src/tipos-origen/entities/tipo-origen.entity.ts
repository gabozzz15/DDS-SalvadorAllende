import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipos_origen')
export class TipoOrigen {
    @PrimaryGeneratedColumn({ name: 'id_tipo_origen' })
    id: number;

    @Column({ length: 50, unique: true })
    nombre: string; // COMPRA, DONACION, PRESTAMO_FUNDASALUD
}
