import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    nombreCompleto: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
