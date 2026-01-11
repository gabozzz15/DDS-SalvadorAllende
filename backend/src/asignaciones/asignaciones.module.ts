import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { Asignacion } from './entities/asignacion.entity';
import { BienesModule } from '../bienes/bienes.module';
import { UnidadesAdministrativasModule } from '../unidades-administrativas/unidades-administrativas.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asignacion]),
        BienesModule,
        UnidadesAdministrativasModule,
    ],
    controllers: [AsignacionesController],
    providers: [AsignacionesService],
    exports: [AsignacionesService],
})
export class AsignacionesModule { }
