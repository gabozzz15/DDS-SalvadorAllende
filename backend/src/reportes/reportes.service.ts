import { Injectable } from '@nestjs/common';
import { BienesService } from '../bienes/bienes.service';
import { TransferenciasService } from '../transferencias/transferencias.service';
import { DesincorporacionesService } from '../desincorporaciones/desincorporaciones.service';
import { ResponsablesService } from '../responsables/responsables.service';
import { UbicacionesService } from '../ubicaciones/ubicaciones.service';
import PdfPrinter from 'pdfmake';
import * as XLSX from 'xlsx';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class ReportesService {
    constructor(
        private bienesService: BienesService,
        private transferenciasService: TransferenciasService,
        private desincorporacionesService: DesincorporacionesService,
        private responsablesService: ResponsablesService,
        private ubicacionesService: UbicacionesService,
    ) { }

    private getFonts() {
        return {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique',
            },
        };
    }

    private getCommonStyles() {
        return {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10] as [number, number, number, number],
            },
            subheader: {
                fontSize: 12,
                margin: [0, 0, 0, 20] as [number, number, number, number],
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black',
                fillColor: '#eeeeee',
            },
        };
    }

    // ==================== INVENTARIO GENERAL ====================
    async generateInventoryPDF(): Promise<Buffer> {
        const bienes = await this.bienesService.findAll();
        const printer = new PdfPrinter(this.getFonts());

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'Inventario General de Bienes', style: 'header' },
                { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Código', 'Descripción', 'Ubicación', 'Responsable', 'Estado'],
                            ...bienes.map((bien) => [
                                bien.codigoInterno,
                                bien.descripcion,
                                bien.unidadAdministrativa?.nombre || 'N/A',
                                bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'N/A',
                                bien.estatusUso,
                            ]),
                        ],
                    },
                },
            ],
            styles: this.getCommonStyles(),
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }

    async generateInventoryExcel(): Promise<Buffer> {
        const bienes = await this.bienesService.findAll();

        const data = bienes.map((bien) => ({
            'Código Interno': bien.codigoInterno,
            'Descripción': bien.descripcion,
            'Categoría': bien.categoriaEspecifica?.descripcion || 'N/A',
            'Ubicación': bien.unidadAdministrativa?.nombre || 'N/A',
            'Responsable': bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'N/A',
            'Estado': bien.estatusUso,
            'Condición': bien.condicionFisica,
            'Fecha Adquisición': bien.fechaAdquisicion,
            'Tipo Origen': bien.tipoOrigen,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    // ==================== INVENTARIO POR UBICACIÓN ====================
    async generateInventoryByLocationPDF(ubicacionId?: number): Promise<Buffer> {
        let bienes = await this.bienesService.findAll();

        if (ubicacionId) {
            bienes = bienes.filter(b => b.idUnidadAdministrativa === ubicacionId);
        }

        // Agrupar por ubicación
        const groupedByLocation = bienes.reduce((acc, bien) => {
            const locationName = bien.unidadAdministrativa?.nombre || 'Sin Ubicación';
            if (!acc[locationName]) {
                acc[locationName] = [];
            }
            acc[locationName].push(bien);
            return acc;
        }, {} as Record<string, typeof bienes>);

        const printer = new PdfPrinter(this.getFonts());

        const content: any[] = [
            { text: 'Inventario por Ubicación', style: 'header' },
            { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        ];

        for (const [location, locationBienes] of Object.entries(groupedByLocation)) {
            content.push(
                { text: location, style: 'subheader', margin: [0, 10, 0, 5] as [number, number, number, number] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            ['Código', 'Descripción', 'Responsable', 'Estado'],
                            ...locationBienes.map((bien) => [
                                bien.codigoInterno,
                                bien.descripcion,
                                bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'N/A',
                                bien.estatusUso,
                            ]),
                        ],
                    },
                    margin: [0, 0, 0, 10] as [number, number, number, number],
                }
            );
        }

        const docDefinition: TDocumentDefinitions = {
            content,
            styles: this.getCommonStyles(),
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }

    async generateInventoryByLocationExcel(ubicacionId?: number): Promise<Buffer> {
        let bienes = await this.bienesService.findAll();

        if (ubicacionId) {
            bienes = bienes.filter(b => b.idUnidadAdministrativa === ubicacionId);
        }

        const data = bienes.map((bien) => ({
            'Ubicación': bien.unidadAdministrativa?.nombre || 'Sin Ubicación',
            'Código Interno': bien.codigoInterno,
            'Descripción': bien.descripcion,
            'Responsable': bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'N/A',
            'Estado': bien.estatusUso,
            'Condición': bien.condicionFisica,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario por Ubicación');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    // ==================== INVENTARIO POR RESPONSABLE ====================
    async generateInventoryByResponsiblePDF(responsableId?: number): Promise<Buffer> {
        let bienes = await this.bienesService.findAll();

        if (responsableId) {
            bienes = bienes.filter(b => b.idResponsableUso === responsableId);
        }

        // Agrupar por responsable
        const groupedByResponsible = bienes.reduce((acc, bien) => {
            const responsibleName = bien.responsableUso
                ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}`
                : 'Sin Responsable';
            if (!acc[responsibleName]) {
                acc[responsibleName] = [];
            }
            acc[responsibleName].push(bien);
            return acc;
        }, {} as Record<string, typeof bienes>);

        const printer = new PdfPrinter(this.getFonts());

        const content: any[] = [
            { text: 'Inventario por Responsable', style: 'header' },
            { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
        ];

        for (const [responsible, responsibleBienes] of Object.entries(groupedByResponsible)) {
            content.push(
                { text: responsible, style: 'subheader', margin: [0, 10, 0, 5] as [number, number, number, number] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            ['Código', 'Descripción', 'Ubicación', 'Estado'],
                            ...responsibleBienes.map((bien) => [
                                bien.codigoInterno,
                                bien.descripcion,
                                bien.unidadAdministrativa?.nombre || 'N/A',
                                bien.estatusUso,
                            ]),
                        ],
                    },
                    margin: [0, 0, 0, 10] as [number, number, number, number],
                }
            );
        }

        const docDefinition: TDocumentDefinitions = {
            content,
            styles: this.getCommonStyles(),
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }

    async generateInventoryByResponsibleExcel(responsableId?: number): Promise<Buffer> {
        let bienes = await this.bienesService.findAll();

        if (responsableId) {
            bienes = bienes.filter(b => b.idResponsableUso === responsableId);
        }

        const data = bienes.map((bien) => ({
            'Responsable': bien.responsableUso ? `${bien.responsableUso.nombres} ${bien.responsableUso.apellidos}` : 'Sin Responsable',
            'Código Interno': bien.codigoInterno,
            'Descripción': bien.descripcion,
            'Ubicación': bien.unidadAdministrativa?.nombre || 'N/A',
            'Estado': bien.estatusUso,
            'Condición': bien.condicionFisica,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario por Responsable');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    // ==================== REPORTE DE TRANSFERENCIAS ====================
    async generateTransfersPDF(filters?: { startDate?: string; endDate?: string; status?: string }): Promise<Buffer> {
        let transferencias = await this.transferenciasService.findAll();

        // Aplicar filtros
        if (filters?.startDate) {
            transferencias = transferencias.filter(t => new Date(t.fechaSolicitud) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
            transferencias = transferencias.filter(t => new Date(t.fechaSolicitud) <= new Date(filters.endDate!));
        }
        if (filters?.status) {
            transferencias = transferencias.filter(t => t.estatus === filters.status);
        }

        const printer = new PdfPrinter(this.getFonts());

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'Reporte de Transferencias', style: 'header' },
                { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            ['Fecha', 'Bien', 'Origen', 'Destino', 'Motivo', 'Estado'],
                            ...transferencias.map((t) => [
                                new Date(t.fechaSolicitud).toLocaleDateString(),
                                t.bien?.descripcion || 'N/A',
                                t.responsableOrigen ? `${t.responsableOrigen.nombres} ${t.responsableOrigen.apellidos}` : 'N/A',
                                t.responsableDestino ? `${t.responsableDestino.nombres} ${t.responsableDestino.apellidos}` : 'N/A',
                                t.motivo || '-',
                                t.estatus,
                            ]),
                        ],
                    },
                },
            ],
            styles: this.getCommonStyles(),
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }

    async generateTransfersExcel(filters?: { startDate?: string; endDate?: string; status?: string }): Promise<Buffer> {
        let transferencias = await this.transferenciasService.findAll();

        // Aplicar filtros
        if (filters?.startDate) {
            transferencias = transferencias.filter(t => new Date(t.fechaSolicitud) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
            transferencias = transferencias.filter(t => new Date(t.fechaSolicitud) <= new Date(filters.endDate!));
        }
        if (filters?.status) {
            transferencias = transferencias.filter(t => t.estatus === filters.status);
        }

        const data = transferencias.map((t) => ({
            'Fecha': new Date(t.fechaSolicitud).toLocaleDateString(),
            'Bien': t.bien?.descripcion || 'N/A',
            'Código Bien': t.bien?.codigoInterno || 'N/A',
            'Responsable Origen': t.responsableOrigen ? `${t.responsableOrigen.nombres} ${t.responsableOrigen.apellidos}` : 'N/A',
            'Responsable Destino': t.responsableDestino ? `${t.responsableDestino.nombres} ${t.responsableDestino.apellidos}` : 'N/A',
            'Motivo': t.motivo || '-',
            'Estado': t.estatus,
            'Observaciones': t.observaciones || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transferencias');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    // ==================== REPORTE DE DESINCORPORACIONES ====================
    async generateDeincorporationsPDF(filters?: { startDate?: string; endDate?: string; motivo?: string }): Promise<Buffer> {
        let desincorporaciones = await this.desincorporacionesService.findAll();

        // Aplicar filtros
        if (filters?.startDate) {
            desincorporaciones = desincorporaciones.filter(d => new Date(d.fechaSolicitud) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
            desincorporaciones = desincorporaciones.filter(d => new Date(d.fechaSolicitud) <= new Date(filters.endDate!));
        }
        if (filters?.motivo) {
            desincorporaciones = desincorporaciones.filter(d => d.motivo === filters.motivo);
        }

        const printer = new PdfPrinter(this.getFonts());

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'Reporte de Desincorporaciones', style: 'header' },
                { text: `Fecha: ${new Date().toLocaleDateString()}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', '*'],
                        body: [
                            ['Fecha', 'Bien', 'Motivo', 'Responsable', 'Observaciones'],
                            ...desincorporaciones.map((d) => [
                                new Date(d.fechaSolicitud).toLocaleDateString(),
                                d.bien?.descripcion || 'N/A',
                                d.motivo,
                                d.bien?.responsableUso ? `${d.bien.responsableUso.nombres} ${d.bien.responsableUso.apellidos}` : 'N/A',
                                d.observaciones || '-',
                            ]),
                        ],
                    },
                },
            ],
            styles: this.getCommonStyles(),
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err) => reject(err));
            pdfDoc.end();
        });
    }

    async generateDeincorporationsExcel(filters?: { startDate?: string; endDate?: string; motivo?: string }): Promise<Buffer> {
        let desincorporaciones = await this.desincorporacionesService.findAll();

        // Aplicar filtros
        if (filters?.startDate) {
            desincorporaciones = desincorporaciones.filter(d => new Date(d.fechaSolicitud) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
            desincorporaciones = desincorporaciones.filter(d => new Date(d.fechaSolicitud) <= new Date(filters.endDate!));
        }
        if (filters?.motivo) {
            desincorporaciones = desincorporaciones.filter(d => d.motivo === filters.motivo);
        }

        const data = desincorporaciones.map((d) => ({
            'Fecha': new Date(d.fechaSolicitud).toLocaleDateString(),
            'Bien': d.bien?.descripcion || 'N/A',
            'Código Bien': d.bien?.codigoInterno || 'N/A',
            'Motivo': d.motivo,
            'Responsable': d.bien?.responsableUso ? `${d.bien.responsableUso.nombres} ${d.bien.responsableUso.apellidos}` : 'N/A',
            'Observaciones': d.observaciones || '-',
            'Documento Soporte': d.documentoRespaldo || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Desincorporaciones');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
