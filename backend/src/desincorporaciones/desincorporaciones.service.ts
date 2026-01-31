import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Desincorporacion, EstadoDesincorporacion } from './entities/desincorporacion.entity';
import { CreateDesincorporacionDto } from './dto/create-desincorporacion.dto';
import { UpdateDesincorporacionDto } from './dto/update-desincorporacion.dto';
import { BienesService } from '../bienes/bienes.service';
import { EstadoBien } from '../bienes/entities/bien.entity';

@Injectable()
export class DesincorporacionesService {
    constructor(
        @InjectRepository(Desincorporacion)
        private desincorporacionesRepository: Repository<Desincorporacion>,
        private bienesService: BienesService,
    ) { }

    async create(createDesincorporacionDto: CreateDesincorporacionDto, userId: number): Promise<Desincorporacion> {
        // Validar que el bien existe
        const bien = await this.bienesService.findOne(createDesincorporacionDto.bienId);

        // Verificar que el bien no esté ya desincorporado
        if (bien.estado === EstadoBien.DESINCORPORADO) {
            throw new BadRequestException('El bien ya está desincorporado');
        }

        // Verificar que no haya una desincorporación pendiente para este bien
        const pendingDecommission = await this.desincorporacionesRepository.findOne({
            where: {
                bienId: createDesincorporacionDto.bienId,
                estado: EstadoDesincorporacion.PENDIENTE,
            },
        });

        if (pendingDecommission) {
            throw new BadRequestException('Ya existe una desincorporación pendiente para este bien');
        }

        // Crear la desincorporación
        const desincorporacion = this.desincorporacionesRepository.create({
            ...createDesincorporacionDto,
            solicitadoPor: userId,
            estado: EstadoDesincorporacion.PENDIENTE,
        });

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async findAll(filters?: {
        estado?: EstadoDesincorporacion;
        bienId?: number;
    }): Promise<Desincorporacion[]> {
        const queryBuilder = this.desincorporacionesRepository.createQueryBuilder('desincorporacion')
            .leftJoinAndSelect('desincorporacion.bien', 'bien')
            .leftJoinAndSelect('desincorporacion.solicitante', 'solicitante')
            .leftJoinAndSelect('desincorporacion.aprobador', 'aprobador');

        if (filters?.estado) {
            queryBuilder.andWhere('desincorporacion.estado = :estado', { estado: filters.estado });
        }

        if (filters?.bienId) {
            queryBuilder.andWhere('desincorporacion.bienId = :bienId', { bienId: filters.bienId });
        }

        return queryBuilder
            .orderBy('desincorporacion.fechaSolicitud', 'DESC')
            .getMany();
    }

    async findOne(id: number): Promise<Desincorporacion> {
        const desincorporacion = await this.desincorporacionesRepository.findOne({
            where: { id },
            relations: ['bien', 'solicitante', 'aprobador'],
        });

        if (!desincorporacion) {
            throw new NotFoundException(`Desincorporación con ID ${id} no encontrada`);
        }

        return desincorporacion;
    }

    async update(id: number, updateDesincorporacionDto: UpdateDesincorporacionDto): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estado !== EstadoDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden actualizar desincorporaciones pendientes');
        }

        Object.assign(desincorporacion, updateDesincorporacionDto);
        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async approve(id: number, userId: number): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estado !== EstadoDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden aprobar desincorporaciones pendientes');
        }

        desincorporacion.estado = EstadoDesincorporacion.APROBADA;
        desincorporacion.fechaAprobacion = new Date();
        desincorporacion.aprobadoPor = userId;

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async reject(id: number, userId: number, observaciones: string): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estado !== EstadoDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden rechazar desincorporaciones pendientes');
        }

        desincorporacion.estado = EstadoDesincorporacion.RECHAZADA;
        desincorporacion.aprobadoPor = userId;
        desincorporacion.observaciones = observaciones;

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async execute(id: number): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estado !== EstadoDesincorporacion.APROBADA) {
            throw new BadRequestException('Solo se pueden ejecutar desincorporaciones aprobadas');
        }

        // Actualizar el estado del bien a DESINCORPORADO
        await this.bienesService.update(desincorporacion.bienId, {
            estado: EstadoBien.DESINCORPORADO,
        });

        // Marcar la desincorporación como ejecutada
        desincorporacion.estado = EstadoDesincorporacion.EJECUTADA;
        desincorporacion.fechaEjecucion = new Date();

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async cancel(id: number, userId: number): Promise<void> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.solicitadoPor !== userId) {
            throw new ForbiddenException('Solo el solicitante puede cancelar la desincorporación');
        }

        if (desincorporacion.estado !== EstadoDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden cancelar desincorporaciones pendientes');
        }

        await this.desincorporacionesRepository.remove(desincorporacion);
    }

    async getStatistics(): Promise<any> {
        const total = await this.desincorporacionesRepository.count();
        const pendientes = await this.desincorporacionesRepository.count({ where: { estado: EstadoDesincorporacion.PENDIENTE } });
        const aprobadas = await this.desincorporacionesRepository.count({ where: { estado: EstadoDesincorporacion.APROBADA } });
        const ejecutadas = await this.desincorporacionesRepository.count({ where: { estado: EstadoDesincorporacion.EJECUTADA } });
        const rechazadas = await this.desincorporacionesRepository.count({ where: { estado: EstadoDesincorporacion.RECHAZADA } });

        return {
            total,
            porEstado: {
                pendientes,
                aprobadas,
                ejecutadas,
                rechazadas,
            },
        };
    }
}
