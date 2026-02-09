import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('historial')
@UseGuards(JwtAuthGuard)
export class HistorialController {
    constructor(private readonly historialService: HistorialService) { }

    @Get('bien/:id/responsables')
    async obtenerHistorialResponsables(@Param('id') id: string) {
        return await this.historialService.obtenerHistorialResponsables(+id);
    }

    @Get('bien/:id/usuarios')
    async obtenerHistorialUsuarios(@Param('id') id: string) {
        return await this.historialService.obtenerHistorialUsuarios(+id);
    }

    @Get('bien/:id/responsable-actual')
    async obtenerResponsableActual(@Param('id') id: string) {
        return await this.historialService.obtenerResponsableActual(+id);
    }

    @Get('responsable/:id/bienes')
    async obtenerBienesPorResponsable(@Param('id') id: string) {
        return await this.historialService.obtenerBienesPorResponsable(+id);
    }

    @Get('usuario/:id/acciones')
    async obtenerAccionesPorUsuario(@Param('id') id: string) {
        return await this.historialService.obtenerAccionesPorUsuario(+id);
    }
}
