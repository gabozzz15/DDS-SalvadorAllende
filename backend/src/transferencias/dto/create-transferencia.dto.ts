<<<<<<< HEAD
import { IsInt, IsString, IsOptional, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTransferencia } from '../entities/transferencia.entity';
=======
<<<<<<< HEAD
import { IsInt, IsString, IsOptional, IsEnum, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoTransferencia } from '../entities/transferencia.entity';
=======
import { IsInt, IsString, IsOptional } from 'class-validator';
>>>>>>> ca424ea38c59b96b95880a6defa06896a7349021
>>>>>>> 61d4e9edfdb687db41539bd19fe705bdba5008a5

export class CreateTransferenciaDto {
    @IsInt()
    idBien: number;

    @IsInt()
    ubicacionDestinoId: number;

    @IsInt()
    responsableDestinoId: number;

    @IsString()
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 61d4e9edfdb687db41539bd19fe705bdba5008a5
    @IsNotEmpty()
    motivo: string;

    @IsEnum(TipoTransferencia)
    @IsOptional()
    tipoTransferencia?: TipoTransferencia;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    fechaRetornoEsperada?: Date;

<<<<<<< HEAD
=======
=======
    motivo: string;

>>>>>>> ca424ea38c59b96b95880a6defa06896a7349021
>>>>>>> 61d4e9edfdb687db41539bd19fe705bdba5008a5
    @IsString()
    @IsOptional()
    observaciones?: string;
}
