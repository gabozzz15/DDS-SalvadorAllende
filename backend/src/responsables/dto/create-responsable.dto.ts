import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, Matches, MinLength } from 'class-validator';

export class CreateResponsableDto {
    @IsString()
    @Matches(/^[VEJ]-\d{7,8}$/, {
        message: 'Cédula debe tener formato V-12345678, E-12345678 o J-12345678',
    })
    cedula: string;

    @IsString()
    @MinLength(2)
    nombres: string;

    @IsString()
    @MinLength(2)
    apellidos: string;

    @IsString()
    @IsOptional()
    @Matches(/^0\d{3}-\d{7}$/, {
        message: 'Teléfono debe tener formato 0XXX-XXXXXXX',
    })
    telefono?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsInt()
    departamentoId: number;

    @IsString()
    @IsOptional()
    cargo?: string;

    @IsString()
    @IsOptional()
    firmaDigital?: string;

    @IsBoolean()
    @IsOptional()
    aceptaResponsabilidad?: boolean;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
