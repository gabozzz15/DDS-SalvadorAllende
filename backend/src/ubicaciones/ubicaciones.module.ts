import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbicacionesService } from './ubicaciones.service';
import { UbicacionesController } from './ubicaciones.controller';
import { Ubicacion } from './entities/ubicacion.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Ubicacion])],
    controllers: [UbicacionesController],
    providers: [UbicacionesService],
    exports: [UbicacionesService],
})
export class UbicacionesModule { }
