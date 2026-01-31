import { IsInt, IsString, IsOptional, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTransferencia } from '../entities/transferencia.entity';

export class CreateTransferenciaDto {
    @IsInt()
    idBien: number;

    @IsInt()
    ubicacionDestinoId: number;

    @IsInt()
    responsableDestinoId: number;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsEnum(TipoTransferencia)
    @IsOptional()
    tipoTransferencia?: TipoTransferencia;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    fechaRetornoEsperada?: Date;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
