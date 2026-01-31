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
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EstatusTransferencia } from './entities/transferencia.entity';

@Controller('transferencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransferenciasController {
    constructor(private readonly transferenciasService: TransferenciasService) { }

    @Post()
    create(@Body() createTransferenciaDto: CreateTransferenciaDto, @Request() req) {
        return this.transferenciasService.create(createTransferenciaDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('estatus') estatus?: EstatusTransferencia,
        @Query('idBien') idBien?: string,
    ) {
        return this.transferenciasService.findAll({
            estatus,
            idBien: idBien ? +idBien : undefined,
        });
    }

    @Get('statistics')
    getStatistics() {
        return this.transferenciasService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transferenciasService.findOne(+id);
    }

    @Patch(':id/aprobar')
    @Roles(UserRole.ADMIN)
    aprobar(@Param('id') id: string, @Request() req) {
        return this.transferenciasService.aprobar(+id, req.user.id);
    }

    @Patch(':id/rechazar')
    @Roles(UserRole.ADMIN)
    rechazar(
        @Param('id') id: string,
        @Request() req,
        @Body('observaciones') observaciones?: string,
    ) {
        return this.transferenciasService.rechazar(+id, req.user.id, observaciones);
    }

    @Patch(':id/devolver')
    @Roles(UserRole.ADMIN, UserRole.USER)
    devolverTemporal(@Param('id') id: string, @Request() req) {
        return this.transferenciasService.registrarDevolucion(+id, req.user.id);
    }
}
