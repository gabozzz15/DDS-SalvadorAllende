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
import { UpdateDesincorporacionDto } from './dto/update-desincorporacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EstadoDesincorporacion } from './entities/desincorporacion.entity';

@Controller('desincorporaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesincorporacionesController {
    constructor(private readonly desincorporacionesService: DesincorporacionesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createDesincorporacionDto: CreateDesincorporacionDto, @Request() req) {
        return this.desincorporacionesService.create(createDesincorporacionDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('estado') estado?: EstadoDesincorporacion,
        @Query('bienId') bienId?: string,
    ) {
        return this.desincorporacionesService.findAll({
            estado,
            bienId: bienId ? +bienId : undefined,
        });
    }

    @Get('statistics')
    @Roles(UserRole.ADMIN)
    getStatistics() {
        return this.desincorporacionesService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.desincorporacionesService.findOne(+id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateDesincorporacionDto: UpdateDesincorporacionDto) {
        return this.desincorporacionesService.update(+id, updateDesincorporacionDto);
    }

    @Post(':id/approve')
    @Roles(UserRole.ADMIN)
    approve(@Param('id') id: string, @Request() req) {
        return this.desincorporacionesService.approve(+id, req.user.id);
    }

    @Post(':id/reject')
    @Roles(UserRole.ADMIN)
    reject(
        @Param('id') id: string,
        @Body('observaciones') observaciones: string,
        @Request() req,
    ) {
        return this.desincorporacionesService.reject(+id, req.user.id, observaciones);
    }

    @Post(':id/execute')
    @Roles(UserRole.ADMIN)
    execute(@Param('id') id: string) {
        return this.desincorporacionesService.execute(+id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    cancel(@Param('id') id: string, @Request() req) {
        return this.desincorporacionesService.cancel(+id, req.user.id);
    }
}
