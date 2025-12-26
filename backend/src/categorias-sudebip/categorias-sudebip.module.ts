import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasSudebipService } from './categorias-sudebip.service';
import { CategoriasSudebipController } from './categorias-sudebip.controller';
import { CategoriaSudebip } from './entities/categoria-sudebip.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoriaSudebip])],
    controllers: [CategoriasSudebipController],
    providers: [CategoriasSudebipService],
    exports: [CategoriasSudebipService],
})
export class CategoriasSudebipModule { }
