import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transferencia, EstatusTransferencia, TipoTransferencia } from './entities/transferencia.entity';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { BienesService } from '../bienes/bienes.service';
import { UnidadesAdministrativasService } from '../unidades-administrativas/unidades-administrativas.service';
import { ResponsablesService } from '../responsables/responsables.service';

@Injectable()
export class TransferenciasService {
    constructor(
        @InjectRepository(Transferencia)
        private transferenciasRepository: Repository<Transferencia>,
        private bienesService: BienesService,
        private unidadesAdministrativasService: UnidadesAdministrativasService,
        private responsablesService: ResponsablesService,
    ) { }

    async create(createTransferenciaDto: CreateTransferenciaDto, userId: number): Promise<Transferencia> {
        // Validar que el bien existe
        const bien = await this.bienesService.findOne(createTransferenciaDto.idBien);

        // Validar ubicación destino
        await this.unidadesAdministrativasService.findOne(createTransferenciaDto.ubicacionDestinoId);

        // Validar responsable destino
        await this.responsablesService.findOne(createTransferenciaDto.responsableDestinoId);

        // Verificar que no haya una transferencia pendiente para este bien
        const pendingTransfer = await this.transferenciasRepository.findOne({
            where: {
                idBien: createTransferenciaDto.idBien,
                estatus: EstatusTransferencia.PENDIENTE,
            },
        });

        if (pendingTransfer) {
            throw new BadRequestException('Ya existe una transferencia pendiente para este bien');
        }

        // Crear la transferencia
        const transferencia = this.transferenciasRepository.create({
            ...createTransferenciaDto,
            ubicacionOrigenId: bien.idUnidadAdministrativa,
            responsableOrigenId: bien.idResponsableUso,
            solicitadoPor: userId,
            estatus: EstatusTransferencia.PENDIENTE,
        });

        return this.transferenciasRepository.save(transferencia);
    }

    async findAll(filters?: {
        estatus?: EstatusTransferencia;
        idBien?: number;
    }): Promise<Transferencia[]> {
        const queryBuilder = this.transferenciasRepository.createQueryBuilder('transferencia')
            .leftJoinAndSelect('transferencia.bien', 'bien')
            .leftJoinAndSelect('transferencia.ubicacionOrigen', 'ubicacionOrigen')
            .leftJoinAndSelect('transferencia.ubicacionDestino', 'ubicacionDestino')
            .leftJoinAndSelect('transferencia.responsableOrigen', 'responsableOrigen')
            .leftJoinAndSelect('transferencia.responsableDestino', 'responsableDestino')
            .leftJoinAndSelect('transferencia.solicitante', 'solicitante')
            .leftJoinAndSelect('transferencia.aprobador', 'aprobador');

        if (filters?.estatus) {
            queryBuilder.andWhere('transferencia.estatus = :estatus', { estatus: filters.estatus });
        }

        if (filters?.idBien) {
            queryBuilder.andWhere('transferencia.idBien = :idBien', { idBien: filters.idBien });
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

    async aprobar(id: number, userId: number): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estatus !== EstatusTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden aprobar transferencias pendientes');
        }

        transferencia.estatus = EstatusTransferencia.APROBADA;
        transferencia.fechaAprobacion = new Date();
        transferencia.aprobadoPor = userId;

        const savedTransferencia = await this.transferenciasRepository.save(transferencia);

        // Solo actualizar ubicación y responsable si es transferencia PERMANENTE
        if (transferencia.tipoTransferencia === TipoTransferencia.PERMANENTE) {
            await this.bienesService.update(transferencia.idBien, {
                idUnidadAdministrativa: transferencia.ubicacionDestinoId,
                idResponsableUso: transferencia.responsableDestinoId,
            });

            transferencia.estatus = EstatusTransferencia.EJECUTADA;
            transferencia.fechaEjecucion = new Date();

            return this.transferenciasRepository.save(transferencia);
        }

        // Para transferencias temporales, solo se aprueba sin ejecutar
        return savedTransferencia;
    }

    async rechazar(id: number, userId: number, observaciones?: string): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        if (transferencia.estatus !== EstatusTransferencia.PENDIENTE) {
            throw new BadRequestException('Solo se pueden rechazar transferencias pendientes');
        }

        transferencia.estatus = EstatusTransferencia.RECHAZADA;
        transferencia.aprobadoPor = userId;
        if (observaciones) {
            transferencia.observaciones = observaciones;
        }

        return this.transferenciasRepository.save(transferencia);
    }

    async registrarDevolucion(id: number, userId: number): Promise<Transferencia> {
        const transferencia = await this.findOne(id);

        // Validar que sea una transferencia temporal aprobada
        if (transferencia.tipoTransferencia !== TipoTransferencia.TEMPORAL) {
            throw new BadRequestException('Solo se pueden registrar devoluciones de transferencias temporales');
        }

        if (transferencia.estatus !== EstatusTransferencia.APROBADA) {
            throw new BadRequestException('Solo se pueden registrar devoluciones de transferencias aprobadas');
        }

        if (transferencia.fechaDevolucion) {
            throw new BadRequestException('Esta transferencia temporal ya fue devuelta');
        }

        transferencia.fechaDevolucion = new Date();
        transferencia.estatus = EstatusTransferencia.EJECUTADA;

        return this.transferenciasRepository.save(transferencia);
    }

    async getStatistics(): Promise<any> {
        const total = await this.transferenciasRepository.count();
        const pendientes = await this.transferenciasRepository.count({
            where: { estatus: EstatusTransferencia.PENDIENTE }
        });
        const aprobadas = await this.transferenciasRepository.count({
            where: { estatus: EstatusTransferencia.APROBADA }
        });
        const ejecutadas = await this.transferenciasRepository.count({
            where: { estatus: EstatusTransferencia.EJECUTADA }
        });
        const temporalesActivas = await this.transferenciasRepository.count({
            where: {
                tipoTransferencia: TipoTransferencia.TEMPORAL,
                estatus: EstatusTransferencia.APROBADA,
                fechaDevolucion: null as any
            }
        });

        // Tiempo promedio de aprobación
        const tiempoAprobacionResult = await this.transferenciasRepository
            .createQueryBuilder('transferencia')
            .select('AVG(TIMESTAMPDIFF(SECOND, transferencia.fechaSolicitud, transferencia.fechaAprobacion))', 'promedio')
            .where('transferencia.fechaAprobacion IS NOT NULL')
            .getRawOne();

        const tiempoPromedioAprobacionSegundos = tiempoAprobacionResult?.promedio ? Math.round(tiempoAprobacionResult.promedio) : 0;
        const tiempoPromedioHoras = tiempoPromedioAprobacionSegundos > 0 ? (tiempoPromedioAprobacionSegundos / 3600).toFixed(2) : 0;


        return {
            total,
            pendientes,
            aprobadas,
            ejecutadas,
            temporalesActivas,
            tiempoPromedioAprobacion: tiempoPromedioHoras,
        };
    }
}