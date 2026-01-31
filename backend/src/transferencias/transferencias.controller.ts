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
import { UpdateTransferenciaDto } from './dto/update-transferencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EstadoTransferencia } from './entities/transferencia.entity';

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
        @Query('estado') estado?: EstadoTransferencia,
        @Query('bienId') bienId?: string,
    ) {
        return this.transferenciasService.findAll({
            estado,
            bienId: bienId ? +bienId : undefined,
        });
    }

    @Get('statistics')
    @Roles(UserRole.ADMIN)
    getStatistics() {
        return this.transferenciasService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transferenciasService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTransferenciaDto: UpdateTransferenciaDto) {
        return this.transferenciasService.update(+id, updateTransferenciaDto);
    }

    @Post(':id/approve')
    @Roles(UserRole.ADMIN)
    approve(@Param('id') id: string, @Request() req) {
        return this.transferenciasService.approve(+id, req.user.id);
    }

    @Post(':id/reject')
    @Roles(UserRole.ADMIN)
    reject(
        @Param('id') id: string,
        @Body('observaciones') observaciones: string,
        @Request() req,
    ) {
        return this.transferenciasService.reject(+id, req.user.id, observaciones);
    }

    @Post(':id/execute')
    @Roles(UserRole.ADMIN)
    execute(@Param('id') id: string) {
        return this.transferenciasService.execute(+id);
    }

    @Delete(':id')
    cancel(@Param('id') id: string, @Request() req) {
        return this.transferenciasService.cancel(+id, req.user.id);
    }
}
