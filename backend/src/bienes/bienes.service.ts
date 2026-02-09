import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien, EstatusUso } from './entities/bien.entity';
import { CreateBienDto } from './dto/create-bien.dto';
import { UpdateBienDto } from './dto/update-bien.dto';
import { BarcodeService } from './services/barcode.service';
import { CodigosService } from './services/codigos.service';
import { CategoriasSudebipService } from '../categorias-sudebip/categorias-sudebip.service';
import { UnidadesAdministrativasService } from '../unidades-administrativas/unidades-administrativas.service';
import { ResponsablesService } from '../responsables/responsables.service';
import { TiposOrigenService } from '../tipos-origen/tipos-origen.service';

@Injectable()
export class BienesService {
    constructor(
        @InjectRepository(Bien)
        private bienesRepository: Repository<Bien>,
        private barcodeService: BarcodeService,
        private codigosService: CodigosService,
        private categoriasSudebipService: CategoriasSudebipService,
        private unidadesAdministrativasService: UnidadesAdministrativasService,
        private responsablesService: ResponsablesService,
        private tiposOrigenService: TiposOrigenService,
    ) { }

    async create(createBienDto: CreateBienDto, userId: number): Promise<Bien> {
        // Verificar que el código interno no exista
        const existingBien = await this.bienesRepository.findOne({
            where: { codigoInterno: createBienDto.codigoInterno },
        });

        if (existingBien) {
            throw new ConflictException('Ya existe un bien con este código interno');
        }

        // Si el estatus es INACTIVO, asignar al Departamento de Bienes (UA-009)
        if (createBienDto.estatusUso === 'INACTIVO') {
            const departamentoBienes = await this.unidadesAdministrativasService.findByCode('UA-009');
            if (departamentoBienes) {
                createBienDto.idUnidadAdministrativa = departamentoBienes.id;
            }
        }

        // Validar que la categoría específica exista
        await this.categoriasSudebipService.findOne(createBienDto.idCategoriaEspecifica);

        // Validar unidad administrativa
        await this.unidadesAdministrativasService.findOne(createBienDto.idUnidadAdministrativa);

        // Validar responsable
        await this.responsablesService.findOne(createBienDto.idResponsableUso);

        // Validar tipo de origen
        await this.tiposOrigenService.findOne(createBienDto.idTipoOrigen);

        // Crear el bien
        const bien = this.bienesRepository.create({
            ...createBienDto,
            createdBy: userId,
            fechaFinalizaRegistro: new Date(), // Marcar fin de registro
        });

        // Guardar para obtener el ID
        const savedBien = await this.bienesRepository.save(bien);

        // Generar código de barras Code128
        const barcodeData = await this.barcodeService.generateCode128(savedBien.codigoInterno);
        savedBien.codigoBarras = barcodeData;

        return this.bienesRepository.save(savedBien);
    }

    async findAll(filters?: {
        estatusUso?: EstatusUso;
        idUnidadAdministrativa?: number;
        idResponsableUso?: number;
        search?: string;
    }): Promise<Bien[]> {
        const queryBuilder = this.bienesRepository.createQueryBuilder('bien')
            .leftJoinAndSelect('bien.unidadAdministrativa', 'unidad')
            .leftJoinAndSelect('bien.responsableUso', 'responsable')
            .leftJoinAndSelect('bien.categoriaEspecifica', 'categoria')
            .leftJoinAndSelect('bien.tipoOrigen', 'tipoOrigen')
            .leftJoinAndSelect('bien.creator', 'creator');

        if (filters?.estatusUso) {
            queryBuilder.andWhere('bien.estatusUso = :estatusUso', { estatusUso: filters.estatusUso });
        }

        if (filters?.idUnidadAdministrativa) {
            queryBuilder.andWhere('bien.idUnidadAdministrativa = :idUnidadAdministrativa', {
                idUnidadAdministrativa: filters.idUnidadAdministrativa
            });
        }

        if (filters?.idResponsableUso) {
            queryBuilder.andWhere('bien.idResponsableUso = :idResponsableUso', {
                idResponsableUso: filters.idResponsableUso
            });
        }

        if (filters?.search) {
            queryBuilder.andWhere(
                '(bien.codigoInterno LIKE :search OR bien.descripcion LIKE :search OR bien.marca LIKE :search OR bien.modelo LIKE :search OR bien.serialBien LIKE :search)',
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
            relations: ['unidadAdministrativa', 'responsableUso', 'categoriaEspecifica', 'tipoOrigen', 'creator'],
        });

        if (!bien) {
            throw new NotFoundException(`Bien con ID ${id} no encontrado`);
        }

        return bien;
    }

    async findByCodigoInterno(codigoInterno: string): Promise<Bien | null> {
        return this.bienesRepository.findOne({
            where: { codigoInterno },
            relations: ['unidadAdministrativa', 'responsableUso', 'categoriaEspecifica', 'tipoOrigen'],
        });
    }

    async update(id: number, updateBienDto: UpdateBienDto): Promise<Bien> {
        const bien = await this.findOne(id);

        // Si el estatus cambia a INACTIVO, asignar al Departamento de Bienes (UA-009)
        if (updateBienDto.estatusUso === 'INACTIVO') {
            const departamentoBienes = await this.unidadesAdministrativasService.findByCode('UA-009');
            if (departamentoBienes) {
                updateBienDto.idUnidadAdministrativa = departamentoBienes.id;
            }
        }

        // Si se actualiza el código interno, verificar que no exista
        if (updateBienDto.codigoInterno && updateBienDto.codigoInterno !== bien.codigoInterno) {
            const existing = await this.findByCodigoInterno(updateBienDto.codigoInterno);
            if (existing) {
                throw new ConflictException('Ya existe un bien con este código interno');
            }
        }

        // Validar unidad administrativa si se actualiza
        if (updateBienDto.idUnidadAdministrativa) {
            const unidad = await this.unidadesAdministrativasService.findOne(updateBienDto.idUnidadAdministrativa);
            bien.unidadAdministrativa = unidad;
            bien.idUnidadAdministrativa = unidad.id;
        }

        // Validar responsable si se actualiza
        if (updateBienDto.idResponsableUso) {
            const responsable = await this.responsablesService.findOne(updateBienDto.idResponsableUso);
            bien.responsableUso = responsable;
            bien.idResponsableUso = responsable.id;
        }

        // Validar categoría específica si se actualiza
        if (updateBienDto.idCategoriaEspecifica) {
            const categoria = await this.categoriasSudebipService.findOne(updateBienDto.idCategoriaEspecifica);
            bien.categoriaEspecifica = categoria;
            bien.idCategoriaEspecifica = categoria.id;
        }

        // Validar tipo de origen si se actualiza
        if (updateBienDto.idTipoOrigen) {
            const tipoOrigen = await this.tiposOrigenService.findOne(updateBienDto.idTipoOrigen);
            bien.tipoOrigen = tipoOrigen;
            bien.idTipoOrigen = tipoOrigen.id;
        }

        Object.assign(bien, updateBienDto);
        return this.bienesRepository.save(bien);
    }

    async remove(id: number): Promise<void> {
        const bien = await this.findOne(id);
        bien.estatusUso = EstatusUso.DESINCORPORADO;
        await this.bienesRepository.save(bien);
    }

    async getStatistics() {
        const total = await this.bienesRepository.count();
        const activos = await this.bienesRepository.count({ where: { estatusUso: EstatusUso.ACTIVO } });
        const inactivos = await this.bienesRepository.count({ where: { estatusUso: EstatusUso.INACTIVO } });
        const enReparacion = await this.bienesRepository.count({ where: { estatusUso: EstatusUso.EN_REPARACION } });
        const desincorporados = await this.bienesRepository.count({ where: { estatusUso: EstatusUso.DESINCORPORADO } });

        // Estadísticas por origen
        const porOrigen = await this.bienesRepository
            .createQueryBuilder('bien')
            .leftJoin('bien.tipoOrigen', 'origen')
            .select('origen.nombre', 'origen')
            .addSelect('COUNT(bien.id)', 'cantidad')
            .groupBy('origen.nombre')
            .getRawMany();

        // Tiempo promedio de registro (en segundos)
        const tiempoRegistroResult = await this.bienesRepository
            .createQueryBuilder('bien')
            .select('AVG(TIMESTAMPDIFF(SECOND, bien.fechaInicioRegistro, bien.fechaFinalizaRegistro))', 'promedio')
            .where('bien.fechaFinalizaRegistro IS NOT NULL')
            .getRawOne();

        const tiempoPromedioRegistro = tiempoRegistroResult?.promedio ? Math.round(tiempoRegistroResult.promedio) : 0;

        return {
            total,
            activos,
            inactivos,
            enReparacion,
            desincorporados,
            porOrigen,
            tiempoPromedioRegistro,
        };
    }

    /**
     * Genera códigos de barras y QR para un bien
     */
    async generarCodigos(id: number) {
        const bien = await this.findOne(id);

        // Datos completos para el QR (incluye más información)
        const datosQR = {
            id: bien.id,
            codigoInterno: bien.codigoInterno,
            descripcion: bien.descripcion,
            marca: bien.marca,
            modelo: bien.modelo,
            serial: bien.serialBien,
            ubicacion: bien.unidadAdministrativa?.nombre,
            responsable: bien.responsableUso ?
                `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : null,
        };

        const codigos = await this.codigosService.generarCodigosCompletos(
            bien.codigoInterno,
            datosQR
        );

        return {
            bien: {
                id: bien.id,
                codigoInterno: bien.codigoInterno,
                descripcion: bien.descripcion,
            },
            ...codigos,
        };
    }
}
