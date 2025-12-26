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

    async getActivityTimeline(period: 'day' | 'week' | 'month' = 'day', days: number = 30): Promise<any[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let dateFormat: string;
        switch (period) {
            case 'week':
                dateFormat = '%Y-%u'; // Year-Week
                break;
            case 'month':
                dateFormat = '%Y-%m'; // Year-Month
                break;
            default:
                dateFormat = '%Y-%m-%d'; // Year-Month-Day
        }

        const timeline = await this.logsRepository
            .createQueryBuilder('log')
            .select(`DATE_FORMAT(log.createdAt, '${dateFormat}')`, 'period')
            .addSelect('COUNT(*)', 'count')
            .addSelect('log.accion', 'accion')
            .where('log.createdAt >= :startDate', { startDate })
            .groupBy('period, log.accion')
            .orderBy('period', 'ASC')
            .getRawMany();

        return timeline;
    }

    async getMostActiveUsers(limit: number = 10): Promise<any[]> {
        const users = await this.logsRepository
            .createQueryBuilder('log')
            .leftJoin('log.user', 'user')
            .select('log.userId', 'userId')
            .addSelect('user.nombreCompleto', 'nombreCompleto')
            .addSelect('user.username', 'username')
            .addSelect('COUNT(*)', 'totalActions')
            .addSelect('SUM(CASE WHEN log.accion = "CREATE" THEN 1 ELSE 0 END)', 'createCount')
            .addSelect('SUM(CASE WHEN log.accion = "UPDATE" THEN 1 ELSE 0 END)', 'updateCount')
            .addSelect('SUM(CASE WHEN log.accion = "DELETE" THEN 1 ELSE 0 END)', 'deleteCount')
            .where('log.userId IS NOT NULL')
            .groupBy('log.userId')
            .orderBy('totalActions', 'DESC')
            .limit(limit)
            .getRawMany();

        return users;
    }

    async getMostModifiedEntities(limit: number = 10): Promise<any[]> {
        const entities = await this.logsRepository
            .createQueryBuilder('log')
            .select('log.entidad', 'entidad')
            .addSelect('log.entidadId', 'entidadId')
            .addSelect('COUNT(*)', 'totalChanges')
            .addSelect('MAX(log.createdAt)', 'lastModified')
            .where('log.entidadId IS NOT NULL')
            .groupBy('log.entidad, log.entidadId')
            .orderBy('totalChanges', 'DESC')
            .limit(limit)
            .getRawMany();

        // Enriquecer con nombres de las entidades
        for (const entity of entities) {
            if (entity.entidad === 'bienes') {
                const bien = await this.logsRepository.query(
                    'SELECT descripcion FROM bienes WHERE id_bien = ?',
                    [entity.entidadId]
                );
                entity.nombre = bien[0]?.descripcion || `Bien #${entity.entidadId}`;
            } else if (entity.entidad === 'responsables') {
                const responsable = await this.logsRepository.query(
                    'SELECT CONCAT(nombres, " ", apellidos) as nombre FROM responsables WHERE id_responsable = ?',
                    [entity.entidadId]
                );
                entity.nombre = responsable[0]?.nombre || `Responsable #${entity.entidadId}`;
            } else {
                entity.nombre = `${entity.entidad} #${entity.entidadId}`;
            }
        }

        return entities;
    }

    async getUsagePatterns(): Promise<any[]> {
        const patterns = await this.logsRepository
            .createQueryBuilder('log')
            .select('HOUR(log.createdAt)', 'hour')
            .addSelect('DAYOFWEEK(log.createdAt)', 'dayOfWeek')
            .addSelect('COUNT(*)', 'count')
            .groupBy('hour, dayOfWeek')
            .orderBy('hour', 'ASC')
            .addOrderBy('dayOfWeek', 'ASC')
            .getRawMany();

        return patterns;
    }

    async getEntityHistory(entidad: string, entidadId: number): Promise<LogAuditoria[]> {
        return this.logsRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .where('log.entidad = :entidad', { entidad })
            .andWhere('log.entidadId = :entidadId', { entidadId })
            .orderBy('log.createdAt', 'ASC')
            .getMany();
    }
}
