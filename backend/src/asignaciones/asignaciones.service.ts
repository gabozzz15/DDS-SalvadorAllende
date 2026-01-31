import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { BienesService } from '../bienes/bienes.service';
import { UnidadesAdministrativasService } from '../unidades-administrativas/unidades-administrativas.service';

@Injectable()
export class AsignacionesService {
    constructor(
        @InjectRepository(Asignacion)
        private asignacionesRepository: Repository<Asignacion>,
        private bienesService: BienesService,
        private unidadesService: UnidadesAdministrativasService,
    ) { }

    async create(createAsignacionDto: CreateAsignacionDto, userId: number): Promise<Asignacion> {
        // Validar que el bien existe
        const bien = await this.bienesService.findOne(createAsignacionDto.idBien);

        // Obtener el ID de Almacén (UA-001)
        const unidades = await this.unidadesService.findAll();
        const almacen = unidades.find(u => u.codigoUnidadSudebip === 'UA-001');

        if (!almacen) {
            throw new BadRequestException('No se encontró la unidad de Almacén (UA-001)');
        }

        // Validar que el bien está en Almacén
        if (bien.idUnidadAdministrativa !== almacen.id) {
            throw new BadRequestException(
                'Solo se pueden asignar bienes que están en Almacén. Este bien ya está en otro departamento.'
            );
        }

        // Validar que el bien no tiene asignaciones previas (es nuevo)
        const asignacionPrevia = await this.asignacionesRepository.findOne({
            where: { idBien: createAsignacionDto.idBien },
        });

        if (asignacionPrevia) {
            throw new BadRequestException(
                'Este bien ya fue asignado previamente. Use el módulo de Transferencias para moverlo.'
            );
        }

        // Crear la asignación
        const asignacion = this.asignacionesRepository.create({
            ...createAsignacionDto,
            asignadoPor: userId,
        });

        const savedAsignacion = await this.asignacionesRepository.save(asignacion);

        // Actualizar el bien con la nueva ubicación y responsable
        await this.bienesService.update(createAsignacionDto.idBien, {
            idUnidadAdministrativa: createAsignacionDto.ubicacionDestinoId,
            idResponsableUso: createAsignacionDto.responsableDestinoId,
        });

        return savedAsignacion;
    }

    async findAll(): Promise<Asignacion[]> {
        return this.asignacionesRepository.find({
            relations: ['bien', 'ubicacionDestino', 'responsableDestino', 'asignador'],
            order: { fechaAsignacion: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Asignacion> {
        const asignacion = await this.asignacionesRepository.findOne({
            where: { id },
            relations: ['bien', 'ubicacionDestino', 'responsableDestino', 'asignador'],
        });

        if (!asignacion) {
            throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
        }

        return asignacion;
    }

    async getBienesPendientesEnAlmacen(): Promise<any[]> {
        // Obtener el ID de Almacén
        const unidades = await this.unidadesService.findAll();
        const almacen = unidades.find(u => u.codigoUnidadSudebip === 'UA-001');

        if (!almacen) {
            return [];
        }

        // Obtener bienes en almacén
        const bienes = await this.bienesService.findAll({
            idUnidadAdministrativa: almacen.id
        });

        // Filtrar solo los que NO tienen asignaciones previas
        const bienesPendientes: any[] = [];
        for (const bien of bienes) {
            const tieneAsignacion = await this.asignacionesRepository.findOne({
                where: { idBien: bien.id },
            });

            if (!tieneAsignacion) {
                bienesPendientes.push(bien);
            }
        }

        return bienesPendientes;
    }

    async getStatistics(): Promise<any> {
        const total = await this.asignacionesRepository.count();

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const esteMes = new Date();
        esteMes.setDate(1);
        esteMes.setHours(0, 0, 0, 0);

        const asignacionesHoy = await this.asignacionesRepository.count({
            where: {
                fechaAsignacion: new Date(),
            },
        });

        const asignacionesMes = await this.asignacionesRepository
            .createQueryBuilder('asignacion')
            .where('asignacion.fechaAsignacion >= :inicio', { inicio: esteMes })
            .getCount();

        const bienesPendientes = await this.getBienesPendientesEnAlmacen();

        return {
            total,
            asignacionesHoy,
            asignacionesMes,
            bienesPendientes: bienesPendientes.length,
        };
    }
}
