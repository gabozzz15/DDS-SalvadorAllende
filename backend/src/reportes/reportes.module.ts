import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { BienesModule } from '../bienes/bienes.module';
import { TransferenciasModule } from '../transferencias/transferencias.module';
import { DesincorporacionesModule } from '../desincorporaciones/desincorporaciones.module';
import { ResponsablesModule } from '../responsables/responsables.module';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';

@Module({
    imports: [BienesModule, TransferenciasModule, DesincorporacionesModule, ResponsablesModule, UbicacionesModule],
    controllers: [ReportesController],
    providers: [ReportesService],
})
export class ReportesModule { }
