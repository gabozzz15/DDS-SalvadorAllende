import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transferencia, EstadoTransferencia } from './entities/transferencia.entity';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { BienesService } from '../bienes/bienes.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import { ResponsablesService } from '../responsables/responsables.service';

@Injectable()
export class TransferenciasService {
    constructor(
        @InjectRepository(Transferencia)
        private transferenciasRepository: Repository<Transferencia>,
        private bienesService: BienesService,
        private ubicacionesService: UbicacionesService,
        private responsablesService: ResponsablesService,
    ) { }

    async create(createTransferenciaDto: CreateTransferenciaDto, userId: number): Promise<Transferencia> {
        // Validar que el bien existe
        const bien = await this.bienesService.findOne(createTransferenciaDto.bienId);

        // Validar ubicación destino
        await this.ubicacionesService.findOne(createTransferenciaDto.ubicacionDestinoId);

        // Validar responsable destino
        await this.responsablesService.findOne(createTransferenciaDto.responsableDestinoId);

        // Verificar que no haya una transferencia pendiente para este bien
        const pendingTransfer = await this.transferenciasRepository.findOne({
            where: {
                bienId: createTransferenciaDto.bienId,
                estado: EstadoTransferencia.PENDIENTE,
            },
        });

        if (pendingTransfer) {
            throw new BadRequestException('Ya existe una transferencia pendiente para este bien');
        }

        // Crear la transferencia
        const transferencia = this.transferenciasRepository.create({
            ...createTransferenciaDto,
            ubicacionOrigenId: bien.ubicacionId,
            responsableOrigenId: bien.responsableId,
            solicitadoPor: userId,
            estado: EstadoTransferencia.PENDIENTE,
        });

        return this.transferenciasRepository.save(transferencia);
    }

    async findAll(filters?: {
        estado?: EstadoTransferencia;
        bienId?: number;
    }): Promise<Transferencia[]> {
        const queryBuilder = this.transferenciasRepository.createQueryBuilder('transferencia')
            .leftJoinAndSelect('transferencia.bien', 'bien')
            .leftJoinAndSelect('transferencia.ubicacionOrigen', 'ubicacionOrigen')
            .leftJoinAndSelect('transferencia.ubicacionDestino', 'ubicacionDestino')
            .leftJoinAndSelect('transferencia.responsableOrigen', 'responsableOrigen')
            .leftJoinAndSelect('transferencia.responsableDestino', 'responsableDestino')
            .leftJoinAndSelect('transferencia.solicitante', 'solicitante')
            .leftJoinAndSelect('transferencia.aprobador', 'aprobador');

        if (filters?.estado) {
            queryBuilder.andWhere('transferencia.estado = :estado', { estado: filters.estado });
        }

        if (filters?.bienId) {
            queryBuilder.andWhere('transferencia.bienId = :bienId', { bienId: filters.bienId });
        }

        return queryBuilder
            .orderBy('transferencia.fechaSolicitud', 'DESC')
            .getMany();
    }

    async findOne(id: number): Promise<Transferencia> {
        const transferencia = await this.transferenciasRepository.findOne({
            where: { id },
            relations: [
                'bien',
                'ubicacionOrigen',
                'ubicacionDestino',
                'responsableOrigen',
                'responsableDestino',
                'solicitante',
                'aprobador',
            ],
        });

        if (!transferencia) {
            throw new NotFoundException(`Transferencia con ID ${id} no encontrada`);
        }

        return transferencia;
    }

    async update(id: number, updateTransferenciaDto: UpdateTransferenciaDto): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden actualizar transferencias pendientes');
        }

        Object.assign(transferencia, updateTransferenciaDto);
        return this.transferenciasRepository.save(transferencia);
    }

    async approve(id: number, userId: number): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden aprobar transferencias pendientes');
        }

        // Actualizar el bien con la nueva ubicación y responsable
        const bien = await this.bienesService.findOne(transferencia.bienId);
        await this.bienesService.update(bien.id, {
            ubicacionId: transferencia.ubicacionDestinoId,
            responsableId: transferencia.responsableDestinoId,
        });

        // Marcar como aprobada y ejecutada
        transferencia.estado = EstadoTransferencia.APROBADA;
        transferencia.fechaAprobacion = new Date();
        transferencia.fechaEjecucion = new Date();
        transferencia.aprobadoPor = userId;

        return this.transferenciasRepository.save(transferencia);
    }

    async reject(id: number, userId: number, observaciones?: string): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden rechazar transferencias pendientes');
        }

        transferencia.estado = EstadoTransferencia.RECHAZADA;
        transferencia.aprobadoPor = userId;
        if (observaciones) {
            transferencia.observaciones = observaciones;
        }

        return this.transferenciasRepository.save(transferencia);
    }

    async execute(id: number): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estado !== EstadoTransferencia.APROBADA) {
            throw new BadRequestException('Solo se pueden ejecutar transferencias aprobadas');
        }

        // Actualizar el bien con la nueva ubicación y responsable
        const bien = await this.bienesService.findOne(transferencia.bienId);
        await this.bienesService.update(bien.id, {
            ubicacionId: transferencia.ubicacionDestinoId,
            responsableId: transferencia.responsableDestinoId,
        });

        // Marcar la transferencia como ejecutada
        transferencia.estado = EstadoTransferencia.EJECUTADA;
        transferencia.fechaEjecucion = new Date();

        return this.transferenciasRepository.save(transferencia);
    }

    async cancel(id: number, userId: number): Promise<void> {
        const transferencia = await this.findOne(id);

        if (transferencia.solicitadoPor !== userId) {
            throw new ForbiddenException('Solo el solicitante puede cancelar la transferencia');
        }

        if (transferencia.estado !== EstadoTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden cancelar transferencias pendientes');
        }

        await this.transferenciasRepository.remove(transferencia);
    }

    async getStatistics(): Promise<any> {
        const total = await this.transferenciasRepository.count();
        const pendientes = await this.transferenciasRepository.count({ where: { estado: EstadoTransferencia.PENDIENTE } });
        const aprobadas = await this.transferenciasRepository.count({ where: { estado: EstadoTransferencia.APROBADA } });
        const ejecutadas = await this.transferenciasRepository.count({ where: { estado: EstadoTransferencia.EJECUTADA } });
        const rechazadas = await this.transferenciasRepository.count({ where: { estado: EstadoTransferencia.RECHAZADA } });

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
