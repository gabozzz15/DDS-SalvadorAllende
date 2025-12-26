import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateTransferenciaDto {
    @IsInt()
    idBien: number;

    @IsInt()
    ubicacionDestinoId: number;

    @IsInt()
    responsableDestinoId: number;

    @IsString()
    motivo: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
