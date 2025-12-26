import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './entities/ubicacion.entity';

@Injectable()
export class UbicacionesService {
    constructor(
        @InjectRepository(Ubicacion)
        private ubicacionesRepository: Repository<Ubicacion>,
    ) { }

    async findAll(): Promise<Ubicacion[]> {
        return this.ubicacionesRepository.find({
            where: { activo: true },
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Ubicacion> {
        const ubicacion = await this.ubicacionesRepository.findOne({
            where: { id },
        });

        if (!ubicacion) {
            throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
        }

        return ubicacion;
    }
}
