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
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BienesService } from './bienes.service';
import { FotosService } from './services/fotos.service';
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
    constructor(
        private readonly bienesService: BienesService,
        private readonly fotosService: FotosService,
    ) { }

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

    // ========== ENDPOINTS DE FOTOS ==========

    @Post(':id/fotos')
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('fotos', 10)) // Máximo 10 fotos
    async subirFotos(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req,
    ) {
        const fotosGuardadas = [];

        for (let i = 0; i < files.length; i++) {
            const foto = await this.fotosService.guardarFoto(
                files[i],
                +id,
                req.user.id,
                undefined,
                i === 0, // Primera foto es principal
            );
            fotosGuardadas.push(foto);
        }

        return fotosGuardadas;
    }

    @Get(':id/fotos')
    async obtenerFotos(@Param('id') id: string) {
        return this.fotosService.obtenerFotosPorBien(+id);
    }

    @Delete('fotos/:fotoId')
    @Roles(UserRole.ADMIN)
    async eliminarFoto(@Param('fotoId') fotoId: string) {
        await this.fotosService.eliminarFoto(+fotoId);
        return { message: 'Foto eliminada exitosamente' };
    }

    @Patch('fotos/:fotoId/principal')
    @Roles(UserRole.ADMIN)
    async marcarComoPrincipal(@Param('fotoId') fotoId: string) {
        return this.fotosService.marcarComoPrincipal(+fotoId);
    }
}
