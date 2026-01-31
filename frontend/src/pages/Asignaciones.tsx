import { useEffect, useState } from 'react';
import { Package, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface Bien {
    id: number;
    codigoInterno: string;
    descripcion: string;
    marca?: string;
    modelo?: string;
}

interface UnidadAdministrativa {
    id: number;
    nombre: string;
    codigoUnidadSudebip: string;
}

interface Responsable {
    id: number;
    nombres: string;
    apellidos: string;
    cedula: string;
}

interface Asignacion {
    id: number;
    idBien: number;
    ubicacionDestinoId: number;
    responsableDestinoId: number;
    motivo: string;
    fechaAsignacion: string;
    observaciones?: string;
    bien?: Bien;
    ubicacionDestino?: UnidadAdministrativa;
    responsableDestino?: Responsable;
}

const Asignaciones = () => {
    const [bienesPendientes, setBienesPendientes] = useState<Bien[]>([]);
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<any>(null);
    const { isAdmin } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBien, setSelectedBien] = useState<Bien | null>(null);

    // Data for dropdowns
    const [ubicaciones, setUbicaciones] = useState<UnidadAdministrativa[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        idBien: '',
        ubicacionDestinoId: '',
        responsableDestinoId: '',
        motivo: '',
        observaciones: '',
    });

    useEffect(() => {
        fetchData();
        fetchDropdownData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendientesRes, asignacionesRes, statsRes] = await Promise.all([
                api.get('/asignaciones/bienes-pendientes'),
                api.get('/asignaciones'),
                api.get('/asignaciones/statistics'),
            ]);
            setBienesPendientes(pendientesRes.data);
            setAsignaciones(asignacionesRes.data);
            setStatistics(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [ubicacionesRes, responsablesRes] = await Promise.all([
                api.get('/unidades-administrativas'),
                api.get('/responsables'),
            ]);
            // Filtrar para excluir Almacén de las opciones de destino
            const ubicacionesSinAlmacen = ubicacionesRes.data.filter(
                (u: UnidadAdministrativa) => u.codigoUnidadSudebip !== 'UA-001'
            );
            setUbicaciones(ubicacionesSinAlmacen);
            setResponsables(responsablesRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleAsignar = (bien: Bien) => {
        setSelectedBien(bien);
        setFormData({
            idBien: bien.id.toString(),
            ubicacionDestinoId: '',
            responsableDestinoId: '',
            motivo: '',
            observaciones: '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                idBien: parseInt(formData.idBien),
                ubicacionDestinoId: parseInt(formData.ubicacionDestinoId),
                responsableDestinoId: parseInt(formData.responsableDestinoId),
                motivo: formData.motivo,
                observaciones: formData.observaciones,
            };

            await api.post('/asignaciones', payload);
            setModalOpen(false);
            fetchData();
            Swal.fire('Éxito', 'Bien asignado correctamente', 'success');
        } catch (error: any) {
            console.error('Error creating asignacion:', error);
            Swal.fire('Error', error.response?.data?.message || 'Error al asignar el bien', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando datos...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asignaciones desde Almacén</h1>
                    <p className="text-gray-600 mt-1">Gestiona la asignación inicial de bienes nuevos a departamentos</p>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Bienes Pendientes</p>
                                <p className="text-3xl font-bold text-blue-700 mt-1">{statistics.bienesPendientes}</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-blue-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Asignaciones Hoy</p>
                                <p className="text-3xl font-bold text-green-700 mt-1">{statistics.asignacionesHoy}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Este Mes</p>
                                <p className="text-3xl font-bold text-purple-700 mt-1">{statistics.asignacionesMes}</p>
                            </div>
                            <Clock className="w-10 h-10 text-purple-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Total Asignaciones</p>
                                <p className="text-3xl font-bold text-orange-700 mt-1">{statistics.total}</p>
                            </div>
                            <Package className="w-10 h-10 text-orange-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bienes Pendientes Table */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">📦 Bienes Pendientes en Almacén</h2>
                    <span className="badge badge-warning">{bienesPendientes.length} pendientes</span>
                </div>

                {bienesPendientes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay bienes pendientes de asignación en Almacén</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Marca/Modelo
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bienesPendientes.map((bien) => (
                                    <tr key={bien.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-900">{bien.codigoInterno}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{bien.descripcion}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {bien.marca && bien.modelo
                                                    ? `${bien.marca} - ${bien.modelo}`
                                                    : bien.marca || bien.modelo || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleAsignar(bien)}
                                                    className="btn btn-primary btn-sm inline-flex items-center gap-2"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                    Asignar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Historial de Asignaciones */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Historial de Asignaciones</h2>

                {asignaciones.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay asignaciones registradas
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bien
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destino
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Responsable
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Motivo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {asignaciones.map((asignacion) => (
                                    <tr key={asignacion.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {asignacion.bien?.codigoInterno || `Bien #${asignacion.idBien}`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {asignacion.bien?.descripcion}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {asignacion.ubicacionDestino?.nombre || `ID: ${asignacion.ubicacionDestinoId}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {asignacion.responsableDestino
                                                    ? `${asignacion.responsableDestino.nombres} ${asignacion.responsableDestino.apellidos}`
                                                    : `ID: ${asignacion.responsableDestinoId}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {asignacion.motivo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(asignacion.fechaAsignacion).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Asignación */}
            {modalOpen && selectedBien && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Asignar Bien a Departamento</h2>

                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">Bien seleccionado:</h3>
                                <p className="text-sm text-blue-800">
                                    <strong>Código:</strong> {selectedBien.codigoInterno}
                                </p>
                                <p className="text-sm text-blue-800">
                                    <strong>Descripción:</strong> {selectedBien.descripcion}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    {/* Ubicación Destino */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Departamento Destino *
                                        </label>
                                        <select
                                            value={formData.ubicacionDestinoId}
                                            onChange={(e) => setFormData({ ...formData, ubicacionDestinoId: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Seleccione departamento</option>
                                            {ubicaciones.map((ubicacion) => (
                                                <option key={ubicacion.id} value={ubicacion.id}>
                                                    {ubicacion.nombre} ({ubicacion.codigoUnidadSudebip})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Responsable Destino */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Responsable Destino *
                                        </label>
                                        <select
                                            value={formData.responsableDestinoId}
                                            onChange={(e) => setFormData({ ...formData, responsableDestinoId: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Seleccione responsable</option>
                                            {responsables.map((responsable) => (
                                                <option key={responsable.id} value={responsable.id}>
                                                    {responsable.nombres} {responsable.apellidos} ({responsable.cedula})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Motivo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Motivo de Asignación *
                                        </label>
                                        <textarea
                                            value={formData.motivo}
                                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                            className="input"
                                            rows={3}
                                            placeholder="Ejemplo: Asignación inicial por necesidad operativa del departamento"
                                            required
                                        />
                                    </div>

                                    {/* Observaciones */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Observaciones
                                        </label>
                                        <textarea
                                            value={formData.observaciones}
                                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                            className="input"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Asignar Bien
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Asignaciones;
