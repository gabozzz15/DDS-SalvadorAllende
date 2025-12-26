import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesAdministrativasService } from './unidades-administrativas.service';
import { UnidadesAdministrativasController } from './unidades-administrativas.controller';
import { UnidadAdministrativa } from './entities/unidad-administrativa.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UnidadAdministrativa])],
    controllers: [UnidadesAdministrativasController],
    providers: [UnidadesAdministrativasService],
    exports: [UnidadesAdministrativasService],
})
export class UnidadesAdministrativasModule { }
