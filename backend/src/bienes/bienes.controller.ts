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
import { EstadoBien } from './entities/bien.entity';

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
        @Query('estado') estado?: EstadoBien,
        @Query('ubicacionId') ubicacionId?: string,
        @Query('responsableId') responsableId?: string,
        @Query('search') search?: string,
    ) {
        return this.bienesService.findAll({
            estado,
            ubicacionId: ubicacionId ? +ubicacionId : undefined,
            responsableId: responsableId ? +responsableId : undefined,
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
