import { useState, useEffect } from 'react';
import { X, Download, QrCode, Barcode } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

interface CodigosModalProps {
    bienId: number;
    codigoInterno: string;
    descripcion: string;
    onClose: () => void;
}

export default function CodigosModal({ bienId, codigoInterno, descripcion, onClose }: CodigosModalProps) {
    const [loading, setLoading] = useState(false);
    const [codigos, setCodigos] = useState<{ codigoBarras: string; codigoQR: string } | null>(null);

    const cargarCodigos = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/bienes/${bienId}/codigos`);
            setCodigos(response.data);
        } catch (error) {
            console.error('Error cargando códigos:', error);
            Swal.fire('Error', 'No se pudieron cargar los códigos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const descargarImagen = (dataUrl: string, nombre: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${codigoInterno}_${nombre}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Cargar códigos al montar el componente
    useEffect(() => {
        cargarCodigos();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Códigos del Bien</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {codigoInterno} - {descripcion}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : codigos ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Código de Barras */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Barcode className="text-blue-600" size={24} />
                                    <h3 className="text-lg font-semibold text-gray-800">Código de Barras</h3>
                                </div>
                                <div className="bg-white p-4 rounded border-2 border-gray-200 mb-4">
                                    <img
                                        src={codigos.codigoBarras}
                                        alt="Código de Barras"
                                        className="w-full h-auto"
                                    />
                                </div>
                                <button
                                    onClick={() => descargarImagen(codigos.codigoBarras, 'codigo_barras')}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Descargar Código de Barras
                                </button>
                            </div>

                            {/* Código QR */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <QrCode className="text-green-600" size={24} />
                                    <h3 className="text-lg font-semibold text-gray-800">Código QR</h3>
                                </div>
                                <div className="bg-white p-4 rounded border-2 border-gray-200 mb-4 flex justify-center">
                                    <img
                                        src={codigos.codigoQR}
                                        alt="Código QR"
                                        className="w-64 h-64"
                                    />
                                </div>
                                <button
                                    onClick={() => descargarImagen(codigos.codigoQR, 'codigo_qr')}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    Descargar Código QR
                                </button>
                                <p className="text-xs text-gray-500 mt-3 text-center">
                                    El código QR contiene información completa del bien
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No se pudieron cargar los códigos
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
