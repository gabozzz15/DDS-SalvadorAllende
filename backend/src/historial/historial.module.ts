import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialService } from './historial.service';
import { HistorialController } from './historial.controller';
import { BienResponsableHistorico } from './entities/bien-responsable-historico.entity';
import { BienUsuarioHistorico } from './entities/bien-usuario-historico.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            BienResponsableHistorico,
            BienUsuarioHistorico,
        ]),
    ],
    controllers: [HistorialController],
    providers: [HistorialService],
    exports: [HistorialService], // Exportar para usar en otros módulos
})
export class HistorialModule { }
