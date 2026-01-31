import { PartialType } from '@nestjs/mapped-types';
import { CreateResponsableDto } from './create-responsable.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateResponsableDto extends PartialType(CreateResponsableDto) {
    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
