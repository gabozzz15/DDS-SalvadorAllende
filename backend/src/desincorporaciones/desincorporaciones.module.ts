import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesincorporacionesService } from './desincorporaciones.service';
import { DesincorporacionesController } from './desincorporaciones.controller';
import { Desincorporacion } from './entities/desincorporacion.entity';
import { BienesModule } from '../bienes/bienes.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Desincorporacion]),
        BienesModule,
    ],
    controllers: [DesincorporacionesController],
    providers: [DesincorporacionesService],
    exports: [DesincorporacionesService],
})
export class DesincorporacionesModule { }
