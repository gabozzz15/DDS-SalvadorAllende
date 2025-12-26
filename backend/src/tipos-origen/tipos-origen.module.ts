import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposOrigenService } from './tipos-origen.service';
import { TiposOrigenController } from './tipos-origen.controller';
import { TipoOrigen } from './entities/tipo-origen.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TipoOrigen])],
    controllers: [TiposOrigenController],
    providers: [TiposOrigenService],
    exports: [TiposOrigenService],
})
export class TiposOrigenModule { }
