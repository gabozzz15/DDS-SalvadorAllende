import { Injectable } from '@nestjs/common';
import * as bwipjs from 'bwip-js';
import * as QRCode from 'qrcode';

@Injectable()
export class CodigosService {
    /**
     * Genera un código de barras Code128 como imagen PNG en base64
     * @param texto El texto a codificar (ej: código interno del bien)
     * @returns Promise con la imagen en formato base64
     */
    async generarCodigoBarras(texto: string): Promise<string> {
        try {
            const png = await bwipjs.toBuffer({
                bcid: 'code128', // Tipo de código de barras
                text: texto, // Texto a codificar
                scale: 3, // Factor de escala
                height: 10, // Altura en milímetros
                includetext: true, // Incluir texto debajo del código
                textxalign: 'center', // Alineación del texto
            });

            // Convertir a base64
            return `data:image/png;base64,${png.toString('base64')}`;
        } catch (error) {
            throw new Error(`Error generando código de barras: ${error.message}`);
        }
    }

    /**
     * Genera un código QR como imagen PNG en base64
     * @param datos Los datos a codificar (puede ser JSON con info del bien)
     * @returns Promise con la imagen en formato base64
     */
    async generarCodigoQR(datos: string | object): Promise<string> {
        try {
            const texto = typeof datos === 'string' ? datos : JSON.stringify(datos);

            const qrDataUrl = await QRCode.toDataURL(texto, {
                errorCorrectionLevel: 'M', // Nivel de corrección de errores
                type: 'image/png',
                quality: 0.92,
                margin: 1,
                width: 300, // Ancho en píxeles
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            });

            return qrDataUrl;
        } catch (error) {
            throw new Error(`Error generando código QR: ${error.message}`);
        }
    }

    /**
     * Genera ambos códigos (barras y QR) para un bien
     * @param codigoInterno Código interno del bien
     * @param datosCompletos Datos completos del bien para el QR
     * @returns Objeto con ambos códigos en base64
     */
    async generarCodigosCompletos(
        codigoInterno: string,
        datosCompletos: any,
    ): Promise<{ codigoBarras: string; codigoQR: string }> {
        const [codigoBarras, codigoQR] = await Promise.all([
            this.generarCodigoBarras(codigoInterno),
            this.generarCodigoQR(datosCompletos),
        ]);

        return { codigoBarras, codigoQR };
    }
}
