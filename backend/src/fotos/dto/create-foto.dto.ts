import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';
import { TipoProceso } from '../entities/foto.entity';

export class CreateFotoDto {
    @IsInt()
    bienId: number;

    @IsEnum(TipoProceso)
    tipoProceso: TipoProceso;

    @IsInt()
    @IsOptional()
    procesoId?: number;

    @IsString()
    @IsOptional()
    descripcion?: string;
}
