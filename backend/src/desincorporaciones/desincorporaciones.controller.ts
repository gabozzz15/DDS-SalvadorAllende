import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { DesincorporacionesService } from './desincorporaciones.service';
import { CreateDesincorporacionDto } from './dto/create-desincorporacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EstatusDesincorporacion } from './entities/desincorporacion.entity';

@Controller('desincorporaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesincorporacionesController {
    constructor(private readonly desincorporacionesService: DesincorporacionesService) { }

    @Post()
    create(@Body() createDesincorporacionDto: CreateDesincorporacionDto, @Request() req) {
        return this.desincorporacionesService.create(createDesincorporacionDto, req.user.id);
    }

    @Get()
    findAll(@Query('estatus') estatus?: EstatusDesincorporacion) {
        return this.desincorporacionesService.findAll({
            estatus,
        });
    }

    @Get('statistics')
    getStatistics() {
        return this.desincorporacionesService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.desincorporacionesService.findOne(+id);
    }

    @Patch(':id/aprobar')
    @Roles(UserRole.ADMIN)
    aprobar(@Param('id') id: string, @Request() req) {
        return this.desincorporacionesService.aprobar(+id, req.user.id);
    }

    @Patch(':id/rechazar')
    @Roles(UserRole.ADMIN)
    rechazar(
        @Param('id') id: string,
        @Request() req,
        @Body('observaciones') observaciones?: string,
    ) {
        return this.desincorporacionesService.rechazar(+id, req.user.id, observaciones);
    }

    @Patch(':id/execute')
    @Roles(UserRole.ADMIN)
    execute(@Param('id') id: string, @Request() req) {
        return this.desincorporacionesService.execute(+id, req.user.id);
    }
}
