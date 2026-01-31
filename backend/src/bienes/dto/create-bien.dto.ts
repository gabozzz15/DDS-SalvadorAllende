import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsInt,
    IsDateString,
    MinLength,
    Matches,
} from 'class-validator';
import { EstadoBien, CondicionBien, TipoOrigen } from '../entities/bien.entity';

export class CreateBienDto {
    @IsString()
    @Matches(/^\d{5}-\d{4}$/, {
        message: 'Código SUDEBIP debe tener formato XXXXX-XXXX (5 dígitos, guión, 4 dígitos)',
    })
    codigoSudebip: string;

    @IsString()
    @MinLength(3)
    codigoInterno: string;

    @IsString()
    descripcion: string;

    @IsString()
    @IsOptional()
    marca?: string;

    @IsString()
    @IsOptional()
    modelo?: string;

    @IsString()
    @IsOptional()
    serial?: string;

    @IsDateString()
    @IsOptional()
    fechaAdquisicion?: string;

    @IsEnum(EstadoBien)
    @IsOptional()
    estado?: EstadoBien;

    @IsEnum(CondicionBien)
    @IsOptional()
    condicion?: CondicionBien;

    @IsInt()
    ubicacionId: number;

    @IsInt()
    responsableId: number;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsInt()
    categoriaSudebipId: number;

    @IsEnum(TipoOrigen)
    @IsOptional()
    tipoOrigen?: TipoOrigen;

    @IsInt()
    @IsOptional()
    tiempoRegistro?: number;
}
