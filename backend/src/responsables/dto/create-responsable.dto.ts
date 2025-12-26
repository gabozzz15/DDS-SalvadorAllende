import { IsString, IsEmail, IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { TipoResponsableSudebip } from '../entities/responsable.entity';

export class CreateResponsableDto {
    @IsString()
    cedula: string;

    @IsString()
    nombres: string;

    @IsString()
    apellidos: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsInt()
    idUnidadAdscripcion: number;

    @IsString()
    @IsOptional()
    cargo?: string;

    @IsEnum(TipoResponsableSudebip)
    @IsOptional()
    tipoResponsableSudebip?: TipoResponsableSudebip;

    @IsString()
    @IsOptional()
    firmaDigital?: string;

    @IsBoolean()
    @IsOptional()
    aceptaResponsabilidad?: boolean;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
