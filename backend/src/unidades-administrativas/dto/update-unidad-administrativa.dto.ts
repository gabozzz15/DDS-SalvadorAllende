import { PartialType } from '@nestjs/mapped-types';
import { CreateUnidadAdministrativaDto } from './create-unidad-administrativa.dto';

export class UpdateUnidadAdministrativaDto extends PartialType(CreateUnidadAdministrativaDto) { }
