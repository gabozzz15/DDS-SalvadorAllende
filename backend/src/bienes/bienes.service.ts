import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Bien, EstadoBien } from './entities/bien.entity';
import { CreateBienDto } from './dto/create-bien.dto';
import { UpdateBienDto } from './dto/update-bien.dto';
import { BarcodeService } from './services/barcode.service';
import { CategoriasSudebipService } from '../categorias-sudebip/categorias-sudebip.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import { ResponsablesService } from '../responsables/responsables.service';

@Injectable()
export class BienesService {
    constructor(
        @InjectRepository(Bien)
        private bienesRepository: Repository<Bien>,
        private barcodeService: BarcodeService,
        private categoriasSudebipService: CategoriasSudebipService,
        private ubicacionesService: UbicacionesService,
        private responsablesService: ResponsablesService,
    ) { }

    async create(createBienDto: CreateBienDto, userId: number): Promise<Bien> {
        // Verificar que el código interno no exista
        const existingBien = await this.bienesRepository.findOne({
            where: { codigoInterno: createBienDto.codigoInterno },
        });

        if (existingBien) {
            throw new ConflictException('Ya existe un bien con este código interno');
        }

        // Validar que la categoría SUDEBIP exista
        const categoria = await this.categoriasSudebipService.findByCodigo(createBienDto.codigoSudebip);
        if (!categoria) {
            throw new BadRequestException('Código SUDEBIP no válido');
        }

        // Validar ubicación
        await this.ubicacionesService.findOne(createBienDto.ubicacionId);

        // Validar responsable
        await this.responsablesService.findOne(createBienDto.responsableId);

        // Crear el bien
        const bien = this.bienesRepository.create({
            ...createBienDto,
            categoriaSudebipId: categoria.id,
            createdBy: userId,
        });

        // Guardar para obtener el ID
        const savedBien = await this.bienesRepository.save(bien);

        // Generar código de barras Code128
        const barcodeData = await this.barcodeService.generateCode128(savedBien.codigoInterno);
        savedBien.codigoBarras = barcodeData;

        return this.bienesRepository.save(savedBien);
    }

    async findAll(filters?: {
        estado?: EstadoBien;
        ubicacionId?: number;
        responsableId?: number;
        search?: string;
    }): Promise<Bien[]> {
        const where: any = {};

        if (filters?.estado) {
            where.estado = filters.estado;
        }

        if (filters?.ubicacionId) {
            where.ubicacionId = filters.ubicacionId;
        }

        if (filters?.responsableId) {
            where.responsableId = filters.responsableId;
        }

        const queryBuilder = this.bienesRepository.createQueryBuilder('bien')
            .leftJoinAndSelect('bien.ubicacion', 'ubicacion')
            .leftJoinAndSelect('bien.responsable', 'responsable')
            .leftJoinAndSelect('bien.categoriaSudebip', 'categoria')
            .leftJoinAndSelect('bien.creator', 'creator');

        if (filters?.estado) {
            queryBuilder.andWhere('bien.estado = :estado', { estado: filters.estado });
        }

        if (filters?.ubicacionId) {
            queryBuilder.andWhere('bien.ubicacionId = :ubicacionId', { ubicacionId: filters.ubicacionId });
        }

        if (filters?.responsableId) {
            queryBuilder.andWhere('bien.responsableId = :responsableId', { responsableId: filters.responsableId });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(bien.codigoInterno LIKE :search OR bien.descripcion LIKE :search OR bien.marca LIKE :search OR bien.modelo LIKE :search OR bien.serial LIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        return queryBuilder
            .orderBy('bien.createdAt', 'DESC')
            .getMany();
    }

    async findOne(id: number): Promise<Bien> {
        const bien = await this.bienesRepository.findOne({
            where: { id },
            relations: ['ubicacion', 'responsable', 'categoriaSudebip', 'creator'],
        });

        if (!bien) {
            throw new NotFoundException(`Bien con ID ${id} no encontrado`);
        }

        return bien;
    }

    async findByCodigoInterno(codigoInterno: string): Promise<Bien | null> {
        return this.bienesRepository.findOne({
            where: { codigoInterno },
            relations: ['ubicacion', 'responsable', 'categoriaSudebip'],
        });
    }

    async update(id: number, updateBienDto: UpdateBienDto): Promise<Bien> {
        const bien = await this.findOne(id);

        // Si se actualiza el código interno, verificar que no exista
        if (updateBienDto.codigoInterno && updateBienDto.codigoInterno !== bien.codigoInterno) {
            const existing = await this.findByCodigoInterno(updateBienDto.codigoInterno);
            if (existing) {
                throw new ConflictException('Ya existe un bien con este código interno');
            }
        }

        // Validar ubicación si se actualiza
        if (updateBienDto.ubicacionId) {
            await this.ubicacionesService.findOne(updateBienDto.ubicacionId);
        }

        // Validar responsable si se actualiza
        if (updateBienDto.responsableId) {
            await this.responsablesService.findOne(updateBienDto.responsableId);
        }

        // Validar categoría SUDEBIP si se actualiza
        if (updateBienDto.categoriaSudebipId) {
            await this.categoriasSudebipService.findOne(updateBienDto.categoriaSudebipId);
        }

        Object.assign(bien, updateBienDto);
        return this.bienesRepository.save(bien);
    }

    async remove(id: number): Promise<void> {
        const bien = await this.findOne(id);

        // No eliminar físicamente, cambiar estado a DESINCORPORADO
        bien.estado = EstadoBien.DESINCORPORADO;
        await this.bienesRepository.save(bien);
    }

    async getStatistics(): Promise<any> {
        const total = await this.bienesRepository.count();
        const activos = await this.bienesRepository.count({ where: { estado: EstadoBien.ACTIVO } });
        const inactivos = await this.bienesRepository.count({ where: { estado: EstadoBien.INACTIVO } });
        const enReparacion = await this.bienesRepository.count({ where: { estado: EstadoBien.EN_REPARACION } });
        const desincorporados = await this.bienesRepository.count({ where: { estado: EstadoBien.DESINCORPORADO } });

        return {
            total,
            porEstado: {
                activos,
                inactivos,
                enReparacion,
                desincorporados,
            },
        };
    }
}
