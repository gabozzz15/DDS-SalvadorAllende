import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateUnidadAdministrativaDto {
    @IsString()
    @IsOptional()
    codigoUnidadSudebip?: string;

    @IsString()
    @MinLength(3)
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    responsableUnidad?: string;
}
