import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertasService } from './alertas.service';
import { AlertasController } from './alertas.controller';
import { Alerta } from './entities/alerta.entity';
import { BienesModule } from '../bienes/bienes.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Alerta]),
        BienesModule,
    ],
    controllers: [AlertasController],
    providers: [AlertasService],
    exports: [AlertasService],
})
export class AlertasModule { }
