import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UbicacionesService } from './ubicaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ubicaciones')
@UseGuards(JwtAuthGuard)
export class UbicacionesController {
    constructor(private readonly ubicacionesService: UbicacionesService) { }

    @Get()
    findAll() {
        return this.ubicacionesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ubicacionesService.findOne(+id);
    }
}
