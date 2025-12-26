import { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, X, MapPin, User, TrendingUp, Archive } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: string;
    onGenerate: (filters: any) => void;
}

interface Ubicacion {
    id: number;
    nombre: string;
}

interface Responsable {
    id: number;
    nombres: string;
    apellidos: string;
}

const FilterModal = ({ isOpen, onClose, reportType, onGenerate }: FilterModalProps) => {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [filters, setFilters] = useState({
        ubicacionId: '',
        responsableId: '',
        startDate: '',
        endDate: '',
        status: '',
        motivo: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (reportType === 'ubicacion') {
                fetchUbicaciones();
            } else if (reportType === 'responsable') {
                fetchResponsables();
            }
        }
    }, [isOpen, reportType]);

    const fetchUbicaciones = async () => {
        try {
            const response = await api.get('/ubicaciones');
            setUbicaciones(response.data);
        } catch (error) {
            console.error('Error fetching ubicaciones:', error);
        }
    };

    const fetchResponsables = async () => {
        try {
            const response = await api.get('/responsables');
            setResponsables(response.data);
        } catch (error) {
            console.error('Error fetching responsables:', error);
        }
    };

    const handleGenerate = () => {
        onGenerate(filters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Filtros del Reporte</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {reportType === 'ubicacion' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ubicación (opcional)
                            </label>
                            <select
                                value={filters.ubicacionId}
                                onChange={(e) => setFilters({ ...filters, ubicacionId: e.target.value })}
                                className="input"
                            >
                                <option value="">Todas las ubicaciones</option>
                                {ubicaciones.map((ub) => (
                                    <option key={ub.id} value={ub.id}>
                                        {ub.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reportType === 'responsable' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Responsable (opcional)
                            </label>
                            <select
                                value={filters.responsableId}
                                onChange={(e) => setFilters({ ...filters, responsableId: e.target.value })}
                                className="input"
                            >
                                <option value="">Todos los responsables</option>
                                {responsables.map((resp) => (
                                    <option key={resp.id} value={resp.id}>
                                        {resp.nombres} {resp.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(reportType === 'transferencias' || reportType === 'desincorporaciones') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Desde
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Hasta
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </>
                    )}

                    {reportType === 'transferencias' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="input"
                            >
                                <option value="">Todos</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="APROBADA">Aprobada</option>
                                <option value="RECHAZADA">Rechazada</option>
                                <option value="EJECUTADA">Ejecutada</option>
                            </select>
                        </div>
                    )}

                    {reportType === 'desincorporaciones' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo
                            </label>
                            <select
                                value={filters.motivo}
                                onChange={(e) => setFilters({ ...filters, motivo: e.target.value })}
                                className="input"
                            >
                                <option value="">Todos</option>
                                <option value="DETERIORO">Deterioro</option>
                                <option value="OBSOLESCENCIA">Obsolescencia</option>
                                <option value="PERDIDA">Pérdida</option>
                                <option value="ROBO">Robo</option>
                                <option value="DONACION">Donación</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 p-6 border-t">
                    <button onClick={onClose} className="btn btn-secondary flex-1">
                        Cancelar
                    </button>
                    <button onClick={handleGenerate} className="btn btn-primary flex-1">
                        Generar Reporte
                    </button>
                </div>
            </div>
        </div>
    );
};

const Reportes = () => {
    const [activeTab, setActiveTab] = useState<'inventario' | 'movimientos'>('inventario');
    const [filterModal, setFilterModal] = useState({ isOpen: false, reportType: '', format: 'pdf' as 'pdf' | 'excel' });

    const handleDownload = async (endpoint: string, filename: string, filters?: any) => {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.keys(filters).forEach(key => {
                    if (filters[key]) {
                        params.append(key, filters[key]);
                    }
                });
            }

            const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;

            const response = await api.get(url, {
                responseType: 'blob',
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire({
                title: 'Descarga iniciada',
                text: `El reporte se ha generado correctamente.`,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error('Error downloading report:', error);
            Swal.fire('Error', 'Error al descargar el reporte', 'error');
        }
    };

    const handleFilteredDownload = (reportType: string, format: 'pdf' | 'excel', filters: any) => {
        let endpoint = '';
        let filename = '';

        switch (reportType) {
            case 'ubicacion':
                endpoint = `/reportes/inventario-ubicacion/${format}`;
                filename = `inventario-ubicacion.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                break;
            case 'responsable':
                endpoint = `/reportes/inventario-responsable/${format}`;
                filename = `inventario-responsable.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                break;
            case 'transferencias':
                endpoint = `/reportes/transferencias/${format}`;
                filename = `transferencias.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                break;
            case 'desincorporaciones':
                endpoint = `/reportes/desincorporaciones/${format}`;
                filename = `desincorporaciones.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
                break;
        }

        handleDownload(endpoint, filename, filters);
    };

    const openFilterModal = (reportType: string, format: 'pdf' | 'excel') => {
        setFilterModal({ isOpen: true, reportType, format });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-gray-600 mt-1">Generación de documentos e informes del sistema</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('inventario')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventario'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            Inventario
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('movimientos')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'movimientos'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Movimientos
                        </div>
                    </button>
                </nav>
            </div>

            {/* Inventario Tab */}
            {activeTab === 'inventario' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Inventario General */}
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Inventario General</h3>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Listado completo de todos los bienes registrados en el sistema.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleDownload('/reportes/inventario/pdf', 'inventario.pdf')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleDownload('/reportes/inventario/excel', 'inventario.xlsx')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventario por Ubicación */}
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 rounded-lg text-green-600">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Por Ubicación</h3>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Bienes agrupados por ubicación o unidad administrativa.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => openFilterModal('ubicacion', 'pdf')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => openFilterModal('ubicacion', 'excel')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventario por Responsable */}
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <User className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Por Responsable</h3>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Bienes asignados a cada responsable de uso.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => openFilterModal('responsable', 'pdf')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => openFilterModal('responsable', 'excel')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Movimientos Tab */}
            {activeTab === 'movimientos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transferencias */}
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Transferencias</h3>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Historial de movimientos y transferencias de bienes.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => openFilterModal('transferencias', 'pdf')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => openFilterModal('transferencias', 'excel')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desincorporaciones */}
                    <div className="card p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 rounded-lg text-red-600">
                                <Archive className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">Desincorporaciones</h3>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Listado de bienes dados de baja del inventario.
                                </p>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => openFilterModal('desincorporaciones', 'pdf')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => openFilterModal('desincorporaciones', 'excel')}
                                        className="btn btn-outline flex-1 flex justify-center items-center gap-2"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            <FilterModal
                isOpen={filterModal.isOpen}
                onClose={() => setFilterModal({ ...filterModal, isOpen: false })}
                reportType={filterModal.reportType}
                onGenerate={(filters) => handleFilteredDownload(filterModal.reportType, filterModal.format, filters)}
            />
        </div>
    );
};

export default Reportes;
