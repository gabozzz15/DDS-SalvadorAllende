import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria } from './entities/log-auditoria.entity';

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(LogAuditoria)
        private logsRepository: Repository<LogAuditoria>,
    ) { }

    async log(
        userId: number | null,
        accion: string,
        entidad: string,
        entidadId: number | null,
        detalles: any,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<LogAuditoria> {
        const log = new LogAuditoria();
        if (userId !== null) log.userId = userId;
        log.accion = accion;
        log.entidad = entidad;
        if (entidadId !== null) log.entidadId = entidadId;
        log.detalles = detalles;
        if (ipAddress) log.ipAddress = ipAddress;
        if (userAgent) log.userAgent = userAgent;

        return this.logsRepository.save(log);
    }

    async findAll(filters?: {
        userId?: number;
        accion?: string;
        entidad?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<LogAuditoria[]> {
        const queryBuilder = this.logsRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user');

        if (filters?.userId) {
            queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
        }

        if (filters?.accion) {
            queryBuilder.andWhere('log.accion = :accion', { accion: filters.accion });
        }

        if (filters?.entidad) {
            queryBuilder.andWhere('log.entidad = :entidad', { entidad: filters.entidad });
        }

        if (filters?.startDate) {
            queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
        }

        if (filters?.endDate) {
            queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
        }

        return queryBuilder
            .orderBy('log.createdAt', 'DESC')
            .limit(1000) // Limitar a 1000 registros
            .getMany();
    }

    async getStatistics(): Promise<any> {
        const total = await this.logsRepository.count();

        const porAccion = await this.logsRepository
            .createQueryBuilder('log')
            .select('log.accion', 'accion')
            .addSelect('COUNT(*)', 'count')
            .groupBy('log.accion')
            .getRawMany();

        const porEntidad = await this.logsRepository
            .createQueryBuilder('log')
            .select('log.entidad', 'entidad')
            .addSelect('COUNT(*)', 'count')
            .groupBy('log.entidad')
            .getRawMany();

        return {
            total,
            porAccion,
            porEntidad,
        };
    }
}
