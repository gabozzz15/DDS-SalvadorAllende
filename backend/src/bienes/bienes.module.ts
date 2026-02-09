import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BienesService } from './bienes.service';
import { BienesController } from './bienes.controller';
import { Bien } from './entities/bien.entity';
import { Foto } from './entities/foto.entity';
import { BarcodeService } from './services/barcode.service';
import { CodigosService } from './services/codigos.service';
import { FotosService } from './services/fotos.service';
import { CategoriasSudebipModule } from '../categorias-sudebip/categorias-sudebip.module';
import { UnidadesAdministrativasModule } from '../unidades-administrativas/unidades-administrativas.module';
import { ResponsablesModule } from '../responsables/responsables.module';
import { TiposOrigenModule } from '../tipos-origen/tipos-origen.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Bien, Foto]),
        CategoriasSudebipModule,
        UnidadesAdministrativasModule,
        ResponsablesModule,
        TiposOrigenModule,
    ],
    controllers: [BienesController],
    providers: [BienesService, BarcodeService, CodigosService, FotosService],
    exports: [BienesService],
})
export class BienesModule { }
