import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    @Get('inventario/pdf')
    async downloadInventoryPDF(@Res() res: Response) {
        const buffer = await this.reportesService.generateInventoryPDF();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=inventario.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('inventario/excel')
    async downloadInventoryExcel(@Res() res: Response) {
        const buffer = await this.reportesService.generateInventoryExcel();

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=inventario.xlsx',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
