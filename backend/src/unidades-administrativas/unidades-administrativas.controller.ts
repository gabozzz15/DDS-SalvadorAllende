import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UnidadesAdministrativasService } from './unidades-administrativas.service';
import { CreateUnidadAdministrativaDto } from './dto/create-unidad-administrativa.dto';
import { UpdateUnidadAdministrativaDto } from './dto/update-unidad-administrativa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('unidades-administrativas')
@UseGuards(JwtAuthGuard)
export class UnidadesAdministrativasController {
    constructor(private readonly service: UnidadesAdministrativasService) { }

    @Post()
    create(@Body() createDto: CreateUnidadAdministrativaDto) {
        return this.service.create(createDto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateUnidadAdministrativaDto) {
        return this.service.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
