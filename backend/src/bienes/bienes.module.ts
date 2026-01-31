import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BienesService } from './bienes.service';
import { BienesController } from './bienes.controller';
import { Bien } from './entities/bien.entity';
import { BarcodeService } from './services/barcode.service';
import { CategoriasSudebipModule } from '../categorias-sudebip/categorias-sudebip.module';
import { UbicacionesModule } from '../ubicaciones/ubicaciones.module';
import { ResponsablesModule } from '../responsables/responsables.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Bien]),
        CategoriasSudebipModule,
        UbicacionesModule,
        ResponsablesModule,
    ],
    controllers: [BienesController],
    providers: [BienesService, BarcodeService],
    exports: [BienesService],
})
export class BienesModule { }
