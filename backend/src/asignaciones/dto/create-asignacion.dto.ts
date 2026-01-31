import { IsInt, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAsignacionDto {
    @IsInt()
    idBien: number;

    @IsInt()
    ubicacionDestinoId: number;

    @IsInt()
    responsableDestinoId: number;

    @IsString()
    @IsNotEmpty()
    motivo: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
