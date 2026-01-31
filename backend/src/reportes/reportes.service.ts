import { Injectable } from '@nestjs/common';
import { BienesService } from '../bienes/bienes.service';
import PdfPrinter from 'pdfmake';
import * as XLSX from 'xlsx';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class ReportesService {
    constructor(private bienesService: BienesService) { }

    async generateInventoryPDF(): Promise<Buffer> {
        const bienes = await this.bienesService.findAll();

        const fonts = {
            Roboto: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique',
            },
        };

        const printer = new PdfPrinter(fonts);

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
                                bien.ubicacion?.nombre || 'N/A',
                                bien.responsable ? `${bien.responsable.nombres} ${bien.responsable.apellidos}` : 'N/A',
                                bien.estado,
                            ]),
                        ],
                    },
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 12,
                    margin: [0, 0, 0, 20],
                },
            },
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
            'Categoría': bien.categoriaSudebip?.descripcion || 'N/A',
            'Ubicación': bien.ubicacion?.nombre || 'N/A',
            'Responsable': bien.responsable ? `${bien.responsable.nombres} ${bien.responsable.apellidos}` : 'N/A',
            'Estado': bien.estado,
            'Condición': bien.condicion,

            'Fecha Adquisición': bien.fechaAdquisicion,
            'Tipo Origen': bien.tipoOrigen,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
