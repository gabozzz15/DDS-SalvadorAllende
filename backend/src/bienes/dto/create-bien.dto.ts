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
import { EstatusUso, CondicionFisica } from '../entities/bien.entity';

export class CreateBienDto {
    @IsString()
    @MinLength(3)
    codigoInterno: string;

    @IsString()
    descripcion: string;

    @IsString()
    @IsOptional()
    serialBien?: string;

    @IsString()
    @IsOptional()
    marca?: string;

    @IsString()
    @IsOptional()
    modelo?: string;

    @IsInt()
    idCategoriaEspecifica: number;

    @IsInt()
    idUnidadAdministrativa: number;

    @IsInt()
    idResponsableUso: number;

    @IsInt()
    idTipoOrigen: number;

    @IsEnum(EstatusUso)
    @IsOptional()
    estatusUso?: EstatusUso;

    @IsEnum(CondicionFisica)
    @IsOptional()
    condicionFisica?: CondicionFisica;

    @IsDateString()
    @IsOptional()
    fechaAdquisicion?: string;

    @IsDateString()
    @IsOptional()
    fechaIngreso?: string;

    @IsString()
    @IsOptional()
    observacion?: string;

    @IsInt()
    @IsOptional()
    tiempoRegistro?: number; // Tiempo en segundos para KPI
}
