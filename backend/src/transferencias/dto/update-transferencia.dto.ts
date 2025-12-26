import { IsString, IsOptional } from 'class-validator';

export class UpdateTransferenciaDto {
    @IsString()
    @IsOptional()
    observaciones?: string;
}
