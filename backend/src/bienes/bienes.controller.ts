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
import { BienesService } from './bienes.service';
import { CreateBienDto } from './dto/create-bien.dto';
import { UpdateBienDto } from './dto/update-bien.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EstatusUso } from './entities/bien.entity';

@Controller('bienes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BienesController {
    constructor(private readonly bienesService: BienesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createBienDto: CreateBienDto, @Request() req) {
        return this.bienesService.create(createBienDto, req.user.id);
    }

    @Get()
    findAll(
        @Query('estatusUso') estatusUso?: EstatusUso,
        @Query('idUnidadAdministrativa') idUnidadAdministrativa?: string,
        @Query('idResponsableUso') idResponsableUso?: string,
        @Query('search') search?: string,
    ) {
        return this.bienesService.findAll({
            estatusUso,
            idUnidadAdministrativa: idUnidadAdministrativa ? +idUnidadAdministrativa : undefined,
            idResponsableUso: idResponsableUso ? +idResponsableUso : undefined,
            search,
        });
    }

    @Get('statistics')
    getStatistics() {
        return this.bienesService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bienesService.findOne(+id);
    }

    @Get('codigo/:codigoInterno')
    findByCodigoInterno(@Param('codigoInterno') codigoInterno: string) {
        return this.bienesService.findByCodigoInterno(codigoInterno);
    }

    @Get(':id/codigos')
    async generarCodigos(@Param('id') id: string) {
        return this.bienesService.generarCodigos(+id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateBienDto: UpdateBienDto) {
        return this.bienesService.update(+id, updateBienDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.bienesService.remove(+id);
    }
}
