import { IsInt, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { MotivoDesincorporacion } from '../entities/desincorporacion.entity';

export class CreateDesincorporacionDto {
    @IsInt()
    idBien: number;

    @IsEnum(MotivoDesincorporacion)
    motivo: MotivoDesincorporacion;

    @IsString()
    descripcionMotivo: string;

    @IsNumber()
    @IsOptional()
    valorResidual?: number;

    @IsString()
    @IsOptional()
    documentoRespaldo?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
