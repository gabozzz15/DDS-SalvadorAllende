import {
    Controller,
    Get,
    Post,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { AlertasService } from './alertas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TipoAlerta, SeveridadAlerta } from './entities/alerta.entity';

@Controller('alertas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertasController {
    constructor(private readonly alertasService: AlertasService) { }

    @Get()
    findAll(
        @Query('tipo') tipo?: TipoAlerta,
        @Query('severidad') severidad?: SeveridadAlerta,
        @Query('leida') leida?: string,
    ) {
        return this.alertasService.findAll({
            tipo,
            severidad,
            leida: leida === 'true' ? true : leida === 'false' ? false : undefined,
        });
    }

    @Get('statistics')
    getStatistics() {
        return this.alertasService.getStatistics();
    }

    @Post('generate')
    @Roles(UserRole.ADMIN)
    async generateAlerts() {
        await this.alertasService.generateAutomaticAlerts();
        return { message: 'Alertas generadas correctamente' };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.alertasService.findOne(+id);
    }

    @Post(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.alertasService.markAsRead(+id);
    }

    @Post('read-all')
    markAllAsRead() {
        return this.alertasService.markAllAsRead();
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.alertasService.remove(+id);
    }
}
