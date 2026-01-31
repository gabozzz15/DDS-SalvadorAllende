import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsablesService } from './responsables.service';
import { ResponsablesController } from './responsables.controller';
import { Responsable } from './entities/responsable.entity';
import { UnidadesAdministrativasModule } from '../unidades-administrativas/unidades-administrativas.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Responsable]),
        UnidadesAdministrativasModule,
    ],
    controllers: [ResponsablesController],
    providers: [ResponsablesService],
    exports: [ResponsablesService],
})
export class ResponsablesModule { }
