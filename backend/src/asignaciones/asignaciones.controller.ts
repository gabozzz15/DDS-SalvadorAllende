import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionesController {
    constructor(private readonly asignacionesService: AsignacionesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createAsignacionDto: CreateAsignacionDto, @Request() req) {
        return this.asignacionesService.create(createAsignacionDto, req.user.id);
    }

    @Get()
    findAll() {
        return this.asignacionesService.findAll();
    }

    @Get('statistics')
    getStatistics() {
        return this.asignacionesService.getStatistics();
    }

    @Get('bienes-pendientes')
    getBienesPendientes() {
        return this.asignacionesService.getBienesPendientesEnAlmacen();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.asignacionesService.findOne(+id);
    }
}
