import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TiposOrigenService } from './tipos-origen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tipos-origen')
@UseGuards(JwtAuthGuard)
export class TiposOrigenController {
    constructor(private readonly service: TiposOrigenService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }
}
