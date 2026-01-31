import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransferenciaDto {
    @IsInt()
    @IsNotEmpty()
    bienId: number;

    @IsInt()
    @IsNotEmpty()
    ubicacionDestinoId: number;

    @IsInt()
    @IsNotEmpty()
    responsableDestinoId: number;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
