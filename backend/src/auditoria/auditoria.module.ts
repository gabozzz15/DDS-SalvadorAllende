import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { LogAuditoria } from './entities/log-auditoria.entity';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([LogAuditoria])],
    controllers: [AuditoriaController],
    providers: [AuditoriaService],
    exports: [AuditoriaService],
})
export class AuditoriaModule { }
