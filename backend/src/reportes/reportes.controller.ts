import { Controller, Get, Res, Query } from '@nestjs/common';
import type { Response } from 'express';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }

    // ==================== INVENTARIO GENERAL ====================
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

    // ==================== INVENTARIO POR UBICACIÓN ====================
    @Get('inventario-ubicacion/pdf')
    async downloadInventoryByLocationPDF(
        @Res() res: Response,
        @Query('ubicacionId') ubicacionId?: string,
    ) {
        const buffer = await this.reportesService.generateInventoryByLocationPDF(
            ubicacionId ? +ubicacionId : undefined
        );

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=inventario-ubicacion.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('inventario-ubicacion/excel')
    async downloadInventoryByLocationExcel(
        @Res() res: Response,
        @Query('ubicacionId') ubicacionId?: string,
    ) {
        const buffer = await this.reportesService.generateInventoryByLocationExcel(
            ubicacionId ? +ubicacionId : undefined
        );

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=inventario-ubicacion.xlsx',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    // ==================== INVENTARIO POR RESPONSABLE ====================
    @Get('inventario-responsable/pdf')
    async downloadInventoryByResponsiblePDF(
        @Res() res: Response,
        @Query('responsableId') responsableId?: string,
    ) {
        const buffer = await this.reportesService.generateInventoryByResponsiblePDF(
            responsableId ? +responsableId : undefined
        );

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=inventario-responsable.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('inventario-responsable/excel')
    async downloadInventoryByResponsibleExcel(
        @Res() res: Response,
        @Query('responsableId') responsableId?: string,
    ) {
        const buffer = await this.reportesService.generateInventoryByResponsibleExcel(
            responsableId ? +responsableId : undefined
        );

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=inventario-responsable.xlsx',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    // ==================== REPORTE DE TRANSFERENCIAS ====================
    @Get('transferencias/pdf')
    async downloadTransfersPDF(
        @Res() res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: string,
    ) {
        const buffer = await this.reportesService.generateTransfersPDF({
            startDate,
            endDate,
            status,
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=transferencias.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('transferencias/excel')
    async downloadTransfersExcel(
        @Res() res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: string,
    ) {
        const buffer = await this.reportesService.generateTransfersExcel({
            startDate,
            endDate,
            status,
        });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=transferencias.xlsx',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    // ==================== REPORTE DE DESINCORPORACIONES ====================
    @Get('desincorporaciones/pdf')
    async downloadDeincorporationsPDF(
        @Res() res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('motivo') motivo?: string,
    ) {
        const buffer = await this.reportesService.generateDeincorporationsPDF({
            startDate,
            endDate,
            motivo,
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=desincorporaciones.pdf',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }

    @Get('desincorporaciones/excel')
    async downloadDeincorporationsExcel(
        @Res() res: Response,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('motivo') motivo?: string,
    ) {
        const buffer = await this.reportesService.generateDeincorporationsExcel({
            startDate,
            endDate,
            motivo,
        });

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=desincorporaciones.xlsx',
            'Content-Length': buffer.length,
        });

        res.end(buffer);
    }
}
