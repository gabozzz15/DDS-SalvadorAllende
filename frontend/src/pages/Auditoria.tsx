import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, FileText, Download, ChevronDown, ChevronUp, Activity, Database, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

interface LogAuditoria {
    id: number;
    userId: number;
    accion: string;
    entidad: string;
    entidadId: number | null;
    detalles: any;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    user?: {
        id: number;
        nombreCompleto: string;
        username: string;
    };
}

interface Statistics {
    total: number;
    porAccion: { accion: string; count: string }[];
    porEntidad: { entidad: string; count: string }[];
}

const Auditoria = () => {
    const [logs, setLogs] = useState<LogAuditoria[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [filters, setFilters] = useState({
        accion: '',
        entidad: '',
        userId: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    useEffect(() => {
        fetchLogs();
        fetchStatistics();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.accion) params.append('accion', filters.accion);
            if (filters.entidad) params.append('entidad', filters.entidad);
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.fechaDesde) params.append('startDate', filters.fechaDesde);
            if (filters.fechaHasta) params.append('endDate', filters.fechaHasta);

            const response = await api.get(`/auditoria?${params.toString()}`);
            setLogs(response.data);
            setCurrentPage(1); // Reset to first page when filters change
        } catch (error) {
            console.error('Error fetching logs:', error);
            Swal.fire('Error', 'No se pudieron cargar los registros de auditoría', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await api.get('/auditoria/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        fetchLogs();
    };

    const handleClearFilters = () => {
        setFilters({
            accion: '',
            entidad: '',
            userId: '',
            fechaDesde: '',
            fechaHasta: '',
        });
    };

    const handleExportExcel = async () => {
        try {
            const result = await Swal.fire({
                title: 'Exportar a Excel',
                text: `¿Deseas exportar ${logs.length} registros a Excel?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Exportar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                // Crear datos para Excel
                const excelData = logs.map(log => ({
                    'Fecha/Hora': formatDate(log.createdAt),
                    'Usuario': log.user?.nombreCompleto || 'N/A',
                    'Username': log.user?.username || 'N/A',
                    'Acción': log.accion,
                    'Entidad': log.entidad,
                    'ID Entidad': log.entidadId || '-',
                    'IP': log.ipAddress,
                    'Detalles': JSON.stringify(log.detalles),
                }));

                // Convertir a CSV (simple implementation)
                const headers = Object.keys(excelData[0]);
                const csvContent = [
                    headers.join(','),
                    ...excelData.map(row =>
                        headers.map(header => {
                            const value = row[header as keyof typeof row];
                            // Escape commas and quotes
                            return `"${String(value).replace(/"/g, '""')}"`;
                        }).join(',')
                    )
                ].join('\n');

                // Download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                Swal.fire('Exportado', 'Los registros han sido exportados exitosamente.', 'success');
            }
        } catch (error) {
            console.error('Error exporting:', error);
            Swal.fire('Error', 'No se pudo exportar los registros', 'error');
        }
    };

    const toggleRowExpansion = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAccionColor = (accion: string) => {
        switch (accion.toUpperCase()) {
            case 'CREATE':
                return 'bg-green-100 text-green-800';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-800';
            case 'DELETE':
                return 'bg-red-100 text-red-800';
            case 'LOGIN':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(logs.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
                <button
                    onClick={handleExportExcel}
                    className="btn btn-outline flex items-center gap-2"
                    disabled={logs.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Exportar a Excel
                </button>
            </div>

            {/* Estadísticas */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total de Registros */}
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total de Registros</p>
                                <p className="text-3xl font-bold text-blue-900">{statistics.total.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-200 rounded-lg">
                                <Database className="w-8 h-8 text-blue-700" />
                            </div>
                        </div>
                    </div>

                    {/* Acciones más Comunes */}
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-green-600">Acciones Registradas</p>
                            <Activity className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="space-y-1">
                            {statistics.porAccion.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-green-900 font-medium">{item.accion}</span>
                                    <span className="text-green-700">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Entidades más Modificadas */}
                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-purple-600">Entidades Activas</p>
                            <TrendingUp className="w-5 h-5 text-purple-700" />
                        </div>
                        <div className="space-y-1">
                            {statistics.porEntidad.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-purple-900 font-medium capitalize">{item.entidad}</span>
                                    <span className="text-purple-700">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold">Filtros</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Acción
                        </label>
                        <select
                            value={filters.accion}
                            onChange={(e) => handleFilterChange('accion', e.target.value)}
                            className="input"
                        >
                            <option value="">Todas</option>
                            <option value="CREATE">Crear</option>
                            <option value="UPDATE">Actualizar</option>
                            <option value="DELETE">Eliminar</option>
                            <option value="LOGIN">Login</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Entidad
                        </label>
                        <select
                            value={filters.entidad}
                            onChange={(e) => handleFilterChange('entidad', e.target.value)}
                            className="input"
                        >
                            <option value="">Todas</option>
                            <option value="bienes">Bienes</option>
                            <option value="transferencias">Transferencias</option>
                            <option value="desincorporaciones">Desincorporaciones</option>
                            <option value="responsables">Responsables</option>
                            <option value="usuarios">Usuarios</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Desde
                        </label>
                        <input
                            type="date"
                            value={filters.fechaDesde}
                            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Hasta
                        </label>
                        <input
                            type="date"
                            value={filters.fechaHasta}
                            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleSearch}
                            className="btn btn-primary flex-1"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Buscar
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="btn btn-secondary"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Logs */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, logs.length)} de {logs.length} registros
                    </p>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Cargando registros...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No se encontraron registros de auditoría</p>
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">

                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha/Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Entidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID Entidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            IP
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentLogs.map((log) => (
                                        <>
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => toggleRowExpansion(log.id)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        {expandedRows.has(log.id) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                        {formatDate(log.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-2 text-gray-400" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {log.user?.nombreCompleto || 'Usuario desconocido'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                @{log.user?.username || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAccionColor(log.accion)}`}>
                                                        {log.accion}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                    {log.entidad}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.entidadId || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.ipAddress}
                                                </td>
                                            </tr>
                                            {expandedRows.has(log.id) && (
                                                <tr>
                                                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                                        <div className="space-y-2">
                                                            <h4 className="font-semibold text-sm text-gray-700">Detalles del Cambio:</h4>
                                                            <pre className="bg-white p-4 rounded border border-gray-200 text-xs overflow-x-auto">
                                                                {JSON.stringify(log.detalles, null, 2)}
                                                            </pre>
                                                            <div className="text-xs text-gray-500">
                                                                <strong>User Agent:</strong> {log.userAgent}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                    <div className="flex flex-1 justify-between sm:hidden">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="btn btn-secondary"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="btn btn-secondary"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Página <span className="font-medium">{currentPage}</span> de{' '}
                                                <span className="font-medium">{totalPages}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Anterior
                                                </button>
                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    // Show first, last, current, and adjacent pages
                                                    if (
                                                        pageNumber === 1 ||
                                                        pageNumber === totalPages ||
                                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={pageNumber}
                                                                onClick={() => paginate(pageNumber)}
                                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                                                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        );
                                                    } else if (
                                                        pageNumber === currentPage - 2 ||
                                                        pageNumber === currentPage + 2
                                                    ) {
                                                        return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">...</span>;
                                                    }
                                                    return null;
                                                })}
                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Siguiente
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auditoria;
