import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    UseInterceptors,
    UploadedFile,
    Res,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto/create-foto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('fotos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FotosController {
    constructor(private readonly fotosService: FotosService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body() createFotoDto: CreateFotoDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        return this.fotosService.create(createFotoDto, file, req.user.id);
    }

    @Get()
    findAll(
        @Query('bienId') bienId?: string,
        @Query('tipoProceso') tipoProceso?: string,
        @Query('procesoId') procesoId?: string,
    ) {
        return this.fotosService.findAll({
            bienId: bienId ? +bienId : undefined,
            tipoProceso,
            procesoId: procesoId ? +procesoId : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fotosService.findOne(+id);
    }

    @Get(':id/file')
    async getFile(@Param('id') id: string, @Res() res: Response) {
        const foto = await this.fotosService.findOne(+id);
        const buffer = await this.fotosService.getFileBuffer(+id);

        res.set({
            'Content-Type': foto.mimeType,
            'Content-Disposition': `inline; filename="${foto.nombreOriginal}"`,
        });

        res.send(buffer);
    }

    @Get(':id/thumbnail')
    async getThumbnail(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.fotosService.getThumbnail(+id);

        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': 'inline',
        });

        res.send(buffer);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.fotosService.remove(+id);
    }
}
