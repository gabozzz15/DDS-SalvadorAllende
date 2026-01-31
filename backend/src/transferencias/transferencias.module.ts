import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferenciasService } from './transferencias.service';
import { TransferenciasController } from './transferencias.controller';
import { Transferencia } from './entities/transferencia.entity';
import { BienesModule } from '../bienes/bienes.module';
import { UnidadesAdministrativasModule } from '../unidades-administrativas/unidades-administrativas.module';
import { ResponsablesModule } from '../responsables/responsables.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Transferencia]),
        BienesModule,
        UnidadesAdministrativasModule,
        ResponsablesModule,
    ],
    controllers: [TransferenciasController],
    providers: [TransferenciasService],
    exports: [TransferenciasService],
})
export class TransferenciasModule { }
