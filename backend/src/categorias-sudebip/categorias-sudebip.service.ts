import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaSudebip, NivelCategoria } from './entities/categoria-sudebip.entity';

@Injectable()
export class CategoriasSudebipService {
    constructor(
        @InjectRepository(CategoriaSudebip)
        private categoriasRepository: Repository<CategoriaSudebip>,
    ) { }

    async findAll(nivel?: NivelCategoria): Promise<CategoriaSudebip[]> {
        const where = nivel ? { nivel, activo: true } : { activo: true };

        return this.categoriasRepository.find({
            where,
            relations: ['categoriaPadre'],
            order: { codigo: 'ASC' },
        });
    }

    async findOne(id: number): Promise<CategoriaSudebip> {
        const categoria = await this.categoriasRepository.findOne({
            where: { id },
            relations: ['categoriaPadre'],
        });

        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }

        return categoria;
    }

    async findByCodigo(codigo: string): Promise<CategoriaSudebip | null> {
        return this.categoriasRepository.findOne({
            where: { codigo },
            relations: ['categoriaPadre'],
        });
    }

    async findEspecificas(): Promise<CategoriaSudebip[]> {
        return this.findAll(NivelCategoria.ESPECIFICA);
    }
}
