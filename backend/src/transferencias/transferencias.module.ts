import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferenciasService } from './transferencias.service';
import { TransferenciasController } from './transferencias.controller';
import { Transferencia } from './entities/transferencia.entity';
import { BienesModule } from '../bienes/bienes.module';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';
import { ResponsablesModule } from '../responsables/responsables.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transferencia]),
        BienesModule,
        UbicacionesModule,
        ResponsablesModule,
    ],
    controllers: [TransferenciasController],
    providers: [TransferenciasService],
    exports: [TransferenciasService],
})
export class TransferenciasModule { }
