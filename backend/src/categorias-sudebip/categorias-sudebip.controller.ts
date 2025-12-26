import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriasSudebipService } from './categorias-sudebip.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NivelCategoria } from './entities/categoria-sudebip.entity';

@Controller('categorias-sudebip')
@UseGuards(JwtAuthGuard)
export class CategoriasSudebipController {
    constructor(private readonly categoriasService: CategoriasSudebipService) { }

    @Get()
    findAll(@Query('nivel') nivel?: NivelCategoria) {
        return this.categoriasService.findAll(nivel);
    }

    @Get('especificas')
    findEspecificas() {
        return this.categoriasService.findEspecificas();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriasService.findOne(+id);
    }

    @Get('codigo/:codigo')
    findByCodigo(@Param('codigo') codigo: string) {
        return this.categoriasService.findByCodigo(codigo);
    }
}
