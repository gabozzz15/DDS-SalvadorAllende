import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Responsable } from './entities/responsable.entity';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import { UnidadesAdministrativasService } from '../unidades-administrativas/unidades-administrativas.service';

@Injectable()
export class ResponsablesService {
    constructor(
        @InjectRepository(Responsable)
        private responsablesRepository: Repository<Responsable>,
        private unidadesAdministrativasService: UnidadesAdministrativasService,
    ) { }

    async create(createResponsableDto: CreateResponsableDto): Promise<Responsable> {
        // Verificar que la cédula no exista
        const existing = await this.responsablesRepository.findOne({
            where: { cedula: createResponsableDto.cedula },
        });

        if (existing) {
            throw new ConflictException('Ya existe un responsable con esta cédula');
        }

        // Validar que la unidad administrativa exista
        await this.unidadesAdministrativasService.findOne(createResponsableDto.idUnidadAdscripcion);

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
            relations: ['unidadAdscripcion'],
            order: { apellidos: 'ASC', nombres: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Responsable> {
        const responsable = await this.responsablesRepository.findOne({
            where: { id },
            relations: ['unidadAdscripcion'],
        });

        if (!responsable) {
            throw new NotFoundException(`Responsable con ID ${id} no encontrado`);
        }

        return responsable;
    }

    async findByCedula(cedula: string): Promise<Responsable | null> {
        return this.responsablesRepository.findOne({
            where: { cedula },
            relations: ['unidadAdscripcion'],
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

        // Si se actualiza la unidad administrativa, validar que exista
        if (updateResponsableDto.idUnidadAdscripcion) {
            await this.unidadesAdministrativasService.findOne(updateResponsableDto.idUnidadAdscripcion);
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
        responsable.activo = false;
        await this.responsablesRepository.save(responsable);
    }

    async uploadFirma(id: number, firmaBase64: string): Promise<Responsable> {
        const responsable = await this.findOne(id);
        responsable.firmaDigital = firmaBase64;

        if (!responsable.aceptaResponsabilidad) {
            responsable.aceptaResponsabilidad = true;
            responsable.fechaAceptacion = new Date();
        }

        return this.responsablesRepository.save(responsable);
    }
}
