import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateFotoDto {
    @IsNotEmpty()
    idBien: number;

    @IsOptional()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    esPrincipal?: boolean;
}

export class UpdateFotoDto {
    @IsOptional()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    esPrincipal?: boolean;
}
