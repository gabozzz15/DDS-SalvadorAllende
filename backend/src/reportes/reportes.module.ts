import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { BienesModule } from '../bienes/bienes.module';

@Module({
    imports: [BienesModule],
    controllers: [ReportesController],
    providers: [ReportesService],
})
export class ReportesModule { }
