import { IsString, IsOptional } from 'class-validator';

export class UpdateDesincorporacionDto {
    @IsString()
    @IsOptional()
    observaciones?: string;
}
