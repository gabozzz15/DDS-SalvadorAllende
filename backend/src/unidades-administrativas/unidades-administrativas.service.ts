import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadAdministrativa } from './entities/unidad-administrativa.entity';
import { CreateUnidadAdministrativaDto } from './dto/create-unidad-administrativa.dto';
import { UpdateUnidadAdministrativaDto } from './dto/update-unidad-administrativa.dto';

@Injectable()
export class UnidadesAdministrativasService {
    constructor(
        @InjectRepository(UnidadAdministrativa)
        private readonly unidadesRepository: Repository<UnidadAdministrativa>,
    ) { }

    async create(createDto: CreateUnidadAdministrativaDto): Promise<UnidadAdministrativa> {
        const unidad = this.unidadesRepository.create(createDto);
        return this.unidadesRepository.save(unidad);
    }

    async findAll(): Promise<UnidadAdministrativa[]> {
        return this.unidadesRepository.find({
            where: { activo: true },
            order: { nombre: 'ASC' },
        });
    }

    async findOne(id: number): Promise<UnidadAdministrativa> {
        const unidad = await this.unidadesRepository.findOne({ where: { id } });
        if (!unidad) {
            throw new NotFoundException(`Unidad Administrativa con ID ${id} no encontrada`);
        }
        return unidad;
    }

    async findByCode(codigo: string): Promise<UnidadAdministrativa | null> {
        return this.unidadesRepository.findOne({
            where: { codigoUnidadSudebip: codigo },
        });
    }

    async update(id: number, updateDto: UpdateUnidadAdministrativaDto): Promise<UnidadAdministrativa> {
        const unidad = await this.findOne(id);
        Object.assign(unidad, updateDto);
        return this.unidadesRepository.save(unidad);
    }

    async remove(id: number): Promise<void> {
        const unidad = await this.findOne(id);
        unidad.activo = false;
        await this.unidadesRepository.save(unidad);
    }
}
