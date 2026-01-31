import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsablesService } from './responsables.service';
import { ResponsablesController } from './responsables.controller';
import { Responsable } from './entities/responsable.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Responsable])],
    controllers: [ResponsablesController],
    providers: [ResponsablesService],
    exports: [ResponsablesService],
})
export class ResponsablesModule { }
