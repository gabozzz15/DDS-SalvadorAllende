import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Desincorporacion, EstatusDesincorporacion } from './entities/desincorporacion.entity';
import { CreateDesincorporacionDto } from './dto/create-desincorporacion.dto';
import { BienesService } from '../bienes/bienes.service';
import { EstatusUso } from '../bienes/entities/bien.entity';

@Injectable()
export class DesincorporacionesService {
    constructor(
        @InjectRepository(Desincorporacion)
        private desincorporacionesRepository: Repository<Desincorporacion>,
        private bienesService: BienesService,
    ) { }

    async create(createDesincorporacionDto: CreateDesincorporacionDto, userId: number): Promise<Desincorporacion> {
        // Validar que el bien existe
        const bien = await this.bienesService.findOne(createDesincorporacionDto.idBien);

        // Verificar que el bien no esté ya desincorporado
        if (bien.estatusUso === EstatusUso.DESINCORPORADO) {
            throw new BadRequestException('El bien ya está desincorporado');
        }

        // Verificar que no haya una desincorporación pendiente para este bien
        const existing = await this.desincorporacionesRepository.findOne({
            where: { idBien: createDesincorporacionDto.idBien },
        });

        if (existing) {
            throw new BadRequestException('Ya existe una solicitud de desincorporación para este bien');
        }

        // Crear la desincorporación
        const desincorporacion = this.desincorporacionesRepository.create({
            ...createDesincorporacionDto,
            solicitadoPor: userId,
            estatus: EstatusDesincorporacion.PENDIENTE,
        });

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async findAll(filters?: {
        estatus?: EstatusDesincorporacion;
    }): Promise<Desincorporacion[]> {
        const queryBuilder = this.desincorporacionesRepository.createQueryBuilder('desincorporacion')
            .leftJoinAndSelect('desincorporacion.bien', 'bien')
            .leftJoinAndSelect('desincorporacion.solicitante', 'solicitante')
            .leftJoinAndSelect('desincorporacion.aprobador', 'aprobador');

        if (filters?.estatus) {
            queryBuilder.andWhere('desincorporacion.estatus = :estatus', { estatus: filters.estatus });
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

    async aprobar(id: number, userId: number): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estatus !== EstatusDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden aprobar desincorporaciones pendientes');
        }

        desincorporacion.estatus = EstatusDesincorporacion.APROBADA;
        desincorporacion.fechaAprobacion = new Date();
        desincorporacion.aprobadoPor = userId;

        const savedDesincorporacion = await this.desincorporacionesRepository.save(desincorporacion);

        // Actualizar el estado del bien a DESINCORPORADO
        await this.bienesService.update(desincorporacion.idBien, {
            estatusUso: EstatusUso.DESINCORPORADO,
        });

        desincorporacion.estatus = EstatusDesincorporacion.EJECUTADA;
        desincorporacion.fechaEjecucion = new Date();

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async rechazar(id: number, userId: number, observaciones?: string): Promise<Desincorporacion> {
        const desincorporacion = await this.findOne(id);

        if (desincorporacion.estatus !== EstatusDesincorporacion.PENDIENTE) {
            throw new BadRequestException('Solo se pueden rechazar desincorporaciones pendientes');
        }

        desincorporacion.estatus = EstatusDesincorporacion.RECHAZADA;
        desincorporacion.aprobadoPor = userId;
        if (observaciones) {
            desincorporacion.observaciones = observaciones;
        }

        return this.desincorporacionesRepository.save(desincorporacion);
    }

    async getStatistics(): Promise<any> {
        const total = await this.desincorporacionesRepository.count();
        const pendientes = await this.desincorporacionesRepository.count({
            where: { estatus: EstatusDesincorporacion.PENDIENTE }
        });
        const aprobadas = await this.desincorporacionesRepository.count({
            where: { estatus: EstatusDesincorporacion.APROBADA }
        });
        const ejecutadas = await this.desincorporacionesRepository.count({
            where: { estatus: EstatusDesincorporacion.EJECUTADA }
        });

        return {
            total,
            pendientes,
            aprobadas,
            ejecutadas,
        };
    }
}
