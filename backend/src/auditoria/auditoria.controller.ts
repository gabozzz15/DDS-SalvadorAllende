import {
    Controller,
    Get,
    UseGuards,
    Query,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditoriaController {
    constructor(private readonly auditoriaService: AuditoriaService) { }

    @Get()
    findAll(
        @Query('userId') userId?: string,
        @Query('accion') accion?: string,
        @Query('entidad') entidad?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.auditoriaService.findAll({
            userId: userId ? +userId : undefined,
            accion,
            entidad,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    @Get('statistics')
    getStatistics() {
        return this.auditoriaService.getStatistics();
    }

    @Get('timeline')
    getActivityTimeline(
        @Query('period') period?: 'day' | 'week' | 'month',
        @Query('days') days?: string,
    ) {
        return this.auditoriaService.getActivityTimeline(
            period || 'day',
            days ? +days : 30
        );
    }

    @Get('analysis/users')
    getMostActiveUsers(@Query('limit') limit?: string) {
        return this.auditoriaService.getMostActiveUsers(limit ? +limit : 10);
    }

    @Get('analysis/entities')
    getMostModifiedEntities(@Query('limit') limit?: string) {
        return this.auditoriaService.getMostModifiedEntities(limit ? +limit : 10);
    }

    @Get('analysis/patterns')
    getUsagePatterns() {
        return this.auditoriaService.getUsagePatterns();
    }

    @Get('entity/:entidad/:id/history')
    getEntityHistory(
        @Query('entidad') entidad: string,
        @Query('id') id: string,
    ) {
        return this.auditoriaService.getEntityHistory(entidad, +id);
    }
}
