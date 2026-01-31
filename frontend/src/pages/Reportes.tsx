import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import api from '../lib/api';

const Reportes = () => {
    const handleDownload = async (type: 'pdf' | 'excel') => {
        try {
            const response = await api.get(`/reportes/inventario/${type}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventario.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Error al descargar el reporte');
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-gray-600 mt-1">Generación de documentos e informes del sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventario General PDF */}
                <div className="card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 rounded-lg text-red-600">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Inventario General (PDF)</h3>
                            <p className="text-gray-600 mt-1 text-sm">
                                Documento oficial con el listado completo de bienes, ubicaciones y responsables.
                                Ideal para impresiones y firmas.
                            </p>
                            <button
                                onClick={() => handleDownload('pdf')}
                                className="btn btn-outline mt-4 w-full flex justify-center items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inventario General Excel */}
                <div className="card p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <FileSpreadsheet className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Inventario Detallado (Excel)</h3>
                            <p className="text-gray-600 mt-1 text-sm">
                                Hoja de cálculo con todos los campos de los bienes.
                                Útil para análisis de datos, filtros avanzados y auditorías.
                            </p>
                            <button
                                onClick={() => handleDownload('excel')}
                                className="btn btn-outline mt-4 w-full flex justify-center items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reportes;
