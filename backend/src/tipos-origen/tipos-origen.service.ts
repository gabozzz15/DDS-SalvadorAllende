import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoOrigen } from './entities/tipo-origen.entity';

@Injectable()
export class TiposOrigenService {
    constructor(
        @InjectRepository(TipoOrigen)
        private readonly tiposOrigenRepository: Repository<TipoOrigen>,
    ) { }

    async findAll(): Promise<TipoOrigen[]> {
        return this.tiposOrigenRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number): Promise<TipoOrigen> {
        const tipo = await this.tiposOrigenRepository.findOne({ where: { id } });
        if (!tipo) {
            throw new NotFoundException(`Tipo de Origen con ID ${id} no encontrado`);
        }
        return tipo;
    }

    async findByNombre(nombre: string): Promise<TipoOrigen> {
        const tipo = await this.tiposOrigenRepository.findOne({ where: { nombre } });
        if (!tipo) {
            throw new NotFoundException(`Tipo de Origen "${nombre}" no encontrado`);
        }
        return tipo;
    }
}
