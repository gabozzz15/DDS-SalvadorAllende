import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ResponsablesService } from './responsables.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('responsables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResponsablesController {
    constructor(private readonly responsablesService: ResponsablesService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createResponsableDto: CreateResponsableDto) {
        return this.responsablesService.create(createResponsableDto);
    }

    @Get()
    findAll(@Query('activo') activo?: string) {
        const activoBoolean = activo === 'true' ? true : activo === 'false' ? false : undefined;
        return this.responsablesService.findAll(activoBoolean);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.responsablesService.findOne(+id);
    }

    @Get('cedula/:cedula')
    findByCedula(@Param('cedula') cedula: string) {
        return this.responsablesService.findByCedula(cedula);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateResponsableDto: UpdateResponsableDto) {
        return this.responsablesService.update(+id, updateResponsableDto);
    }

    @Post(':id/firma')
    @Roles(UserRole.ADMIN)
    uploadFirma(@Param('id') id: string, @Body('firmaBase64') firmaBase64: string) {
        return this.responsablesService.uploadFirma(+id, firmaBase64);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.responsablesService.remove(+id);
    }
}
