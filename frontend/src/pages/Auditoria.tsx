import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User, FileText } from 'lucide-react';
import api from '../lib/api';

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

const Auditoria = () => {
    const [logs, setLogs] = useState<LogAuditoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        accion: '',
        entidad: '',
        userId: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    useEffect(() => {
        fetchLogs();
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
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Auditoría del Sistema</h1>
            </div>

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
                            <option value="usuarios">Usuarios</option>
                            <option value="responsables">Responsables</option>
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.entidad}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.entidadId || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auditoria;
