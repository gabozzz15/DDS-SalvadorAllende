import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Responsable } from './entities/responsable.entity';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@Injectable()
export class ResponsablesService {
    constructor(
        @InjectRepository(Responsable)
        private responsablesRepository: Repository<Responsable>,
    ) { }

    async create(createResponsableDto: CreateResponsableDto): Promise<Responsable> {
        // Verificar si la cédula ya existe
        const existingResponsable = await this.responsablesRepository.findOne({
            where: { cedula: createResponsableDto.cedula },
        });

        if (existingResponsable) {
            throw new ConflictException('Ya existe un responsable con esta cédula');
        }

        // Crear el responsable
        const responsable = this.responsablesRepository.create(createResponsableDto);

        // Si acepta responsabilidad, establecer fecha de aceptación
        if (createResponsableDto.aceptaResponsabilidad) {
            responsable.fechaAceptacion = new Date();
        }

        return this.responsablesRepository.save(responsable);
    }

    async findAll(activo?: boolean): Promise<Responsable[]> {
        const where = activo !== undefined ? { activo } : {};

        return this.responsablesRepository.find({
            where,
            relations: ['departamento'],
            order: { apellidos: 'ASC', nombres: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Responsable> {
        const responsable = await this.responsablesRepository.findOne({
            where: { id },
            relations: ['departamento'],
        });

        if (!responsable) {
            throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
        }

        return responsable;
    }

    async findByCedula(cedula: string): Promise<Responsable | null> {
        return this.responsablesRepository.findOne({
            where: { cedula },
            relations: ['departamento'],
        });
    }

    async update(id: number, updateResponsableDto: UpdateResponsableDto): Promise<Responsable> {
        const responsable = await this.findOne(id);

        // Si se está actualizando la cédula, verificar que no exista
        if (updateResponsableDto.cedula && updateResponsableDto.cedula !== responsable.cedula) {
            const existing = await this.findByCedula(updateResponsableDto.cedula);
            if (existing) {
                throw new ConflictException('Ya existe un responsable con esta cédula');
            }
        }

        // Si cambia aceptaResponsabilidad a true, actualizar fecha
        if (updateResponsableDto.aceptaResponsabilidad && !responsable.aceptaResponsabilidad) {
            responsable.fechaAceptacion = new Date();
        }

        Object.assign(responsable, updateResponsableDto);
        return this.responsablesRepository.save(responsable);
    }

    async remove(id: number): Promise<void> {
        const responsable = await this.findOne(id);
        // Desactivar en lugar de eliminar para mantener integridad referencial
        responsable.activo = false;
        await this.responsablesRepository.save(responsable);
    }

    async uploadFirma(id: number, firmaBase64: string): Promise<Responsable> {
        const responsable = await this.findOne(id);
        responsable.firmaDigital = firmaBase64;

        // Si sube firma, automáticamente acepta responsabilidad
        if (!responsable.aceptaResponsabilidad) {
            responsable.aceptaResponsabilidad = true;
            responsable.fechaAceptacion = new Date();
        }

        return this.responsablesRepository.save(responsable);
    }
}
