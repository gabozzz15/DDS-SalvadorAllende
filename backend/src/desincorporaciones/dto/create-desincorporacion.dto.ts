import { IsInt, IsString, IsEnum, IsNumber, IsOptional, MinLength } from 'class-validator';
import { MotivoDesincorporacion } from '../entities/desincorporacion.entity';

export class CreateDesincorporacionDto {
    @IsInt()
    bienId: number;

    @IsEnum(MotivoDesincorporacion)
    motivo: MotivoDesincorporacion;

    @IsString()
    @MinLength(10)
    descripcionMotivo: string;

    @IsNumber()
    @IsOptional()
    valorResidual?: number;

    @IsString()
    @IsOptional()
    documentoRespaldo?: string;
}
