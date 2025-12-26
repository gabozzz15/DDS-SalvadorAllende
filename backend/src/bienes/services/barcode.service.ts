import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
    /**
     * Genera un código de barras Code128 en formato PNG (base64)
     * @param text Texto a codificar
     * @returns Promise<string> Imagen PNG en base64
     */
    async generateCode128(text: string): Promise<string> {
        try {
            const png = await bwipjs.toBuffer({
                bcid: 'code128',       // Tipo de código de barras
                text: text,            // Texto a codificar
                scale: 3,              // Factor de escala
                height: 10,            // Altura en milímetros
                includetext: true,     // Incluir texto legible
                textxalign: 'center',  // Alineación del texto
            });

            return `data:image/png;base64,${png.toString('base64')}`;
        } catch (error) {
            throw new Error(`Error generando código de barras: ${error.message}`);
        }
    }

    /**
     * Genera un código interno único para un bien
     * Formato: BIEN-YYYY-NNNNNN
     * @param year Año actual
     * @param sequence Número secuencial
     * @returns string Código interno
     */
    generateInternalCode(year: number, sequence: number): string {
        const paddedSequence = sequence.toString().padStart(6, '0');
        return `BIEN-${year}-${paddedSequence}`;
    }
}
