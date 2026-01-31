import { useEffect, useState } from 'react';
import { Plus, Eye, Check, X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Transferencia {
    id: number;
    bienId: number;
    ubicacionOrigenId: number;
    ubicacionDestinoId: number;
    responsableOrigenId: number;
    responsableDestinoId: number;
    motivo: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
    fechaSolicitud: string;
    fechaAprobacion?: string;
    fechaEjecucion?: string;
    solicitadoPor: number;
    aprobadoPor?: number;
    observaciones?: string;
}

interface Bien {
    id: number;
    codigoInterno: string;
    descripcion: string;
}

interface Ubicacion {
    id: number;
    nombre: string;
}

interface Responsable {
    id: number;
    nombres: string;
    apellidos: string;
    cedula: string;
}

const Transferencias = () => {
    const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [bienFilter, setBienFilter] = useState('');
    const { isAdmin } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTransferencia, setSelectedTransferencia] = useState<Transferencia | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

    // Data for dropdowns
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        bienId: '',
        ubicacionDestinoId: '',
        responsableDestinoId: '',
        motivo: '',
        observaciones: '',
    });

    useEffect(() => {
        fetchTransferencias();
        fetchDropdownData();
    }, [estadoFilter, bienFilter]);

    const fetchTransferencias = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (estadoFilter) params.append('estado', estadoFilter);
            if (bienFilter) params.append('bienId', bienFilter);

            const response = await api.get(`/transferencias?${params.toString()}`);
            setTransferencias(response.data);
        } catch (error) {
            console.error('Error fetching transferencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [bienesRes, ubicacionesRes, responsablesRes] = await Promise.all([
                api.get('/bienes'),
                api.get('/ubicaciones'),
                api.get('/responsables'),
            ]);
            setBienes(bienesRes.data);
            setUbicaciones(ubicacionesRes.data);
            setResponsables(responsablesRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleCreate = () => {
        setFormData({
            bienId: '',
            ubicacionDestinoId: '',
            responsableDestinoId: '',
            motivo: '',
            observaciones: '',
        });
        setModalMode('create');
        setModalOpen(true);
    };

    const handleView = (transferencia: Transferencia) => {
        setSelectedTransferencia(transferencia);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                bienId: parseInt(formData.bienId),
                ubicacionDestinoId: parseInt(formData.ubicacionDestinoId),
                responsableDestinoId: parseInt(formData.responsableDestinoId),
                motivo: formData.motivo,
                observaciones: formData.observaciones,
            };

            await api.post('/transferencias', payload);
            setModalOpen(false);
            fetchTransferencias();
        } catch (error: any) {
            console.error('Error creating transferencia:', error);
            alert(error.response?.data?.message || 'Error al crear la transferencia');
        }
    };

    const handleAprobar = async (id: number) => {
        if (!window.confirm('¿Está seguro de aprobar esta transferencia? El bien se actualizará automáticamente.')) return;

        try {
            await api.post(`/transferencias/${id}/approve`);
            fetchTransferencias();
        } catch (error: any) {
            console.error('Error aprobando transferencia:', error);
            alert(error.response?.data?.message || 'Error al aprobar la transferencia');
        }
    };

    const handleRechazar = async (id: number) => {
        if (!window.confirm('¿Está seguro de rechazar esta transferencia?')) return;

        try {
            await api.post(`/transferencias/${id}/reject`);
            fetchTransferencias();
        } catch (error: any) {
            console.error('Error rechazando transferencia:', error);
            alert(error.response?.data?.message || 'Error al rechazar la transferencia');
        }
    };

    const getEstadoBadge = (estado: string) => {
        const badges = {
            PENDIENTE: 'badge-warning',
            APROBADA: 'badge-success',
            RECHAZADA: 'badge-danger',
            EJECUTADA: 'badge-success',
        };
        return badges[estado as keyof typeof badges] || 'badge-info';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando transferencias...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transferencias Internas</h1>
                    <p className="text-gray-600 mt-1">Gestiona los movimientos de bienes entre ubicaciones</p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nueva Transferencia
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value)}
                            className="input"
                        >
                            <option value="">Todos</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="APROBADA">Aprobada</option>
                            <option value="RECHAZADA">Rechazada</option>
                            <option value="EJECUTADA">Ejecutada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Bien
                        </label>
                        <select
                            value={bienFilter}
                            onChange={(e) => setBienFilter(e.target.value)}
                            className="input"
                        >
                            <option value="">Todos los bienes</option>
                            {bienes.map((bien) => (
                                <option key={bien.id} value={bien.id}>
                                    {bien.codigoInterno} - {bien.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bien
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Origen → Destino
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Motivo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Solicitud
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transferencias.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron transferencias
                                    </td>
                                </tr>
                            ) : (
                                transferencias.map((transferencia) => (
                                    <tr key={transferencia.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Bien #{transferencia.bienId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                Ubicación {transferencia.ubicacionOrigenId} → {transferencia.ubicacionDestinoId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Resp. {transferencia.responsableOrigenId} → {transferencia.responsableDestinoId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {transferencia.motivo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getEstadoBadge(transferencia.estado)}`}>
                                                {transferencia.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(transferencia.fechaSolicitud).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(transferencia)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isAdmin && transferencia.estado === 'PENDIENTE' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprobar(transferencia.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Aprobar"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRechazar(transferencia.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Rechazar"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-600">
                Mostrando {transferencias.length} transferencia{transferencias.length !== 1 ? 's' : ''}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {modalMode === 'view' ? 'Detalles de Transferencia' : 'Nueva Transferencia'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {modalMode === 'create' ? (
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    {/* Bien */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bien *
                                        </label>
                                        <select
                                            value={formData.bienId}
                                            onChange={(e) => setFormData({ ...formData, bienId: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Seleccione un bien</option>
                                            {bienes.map((bien) => (
                                                <option key={bien.id} value={bien.id}>
                                                    {bien.codigoInterno} - {bien.descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Ubicación Destino */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ubicación Destino *
                                        </label>
                                        <select
                                            value={formData.ubicacionDestinoId}
                                            onChange={(e) => setFormData({ ...formData, ubicacionDestinoId: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Seleccione ubicación</option>
                                            {ubicaciones.map((ubicacion) => (
                                                <option key={ubicacion.id} value={ubicacion.id}>
                                                    {ubicacion.nombre}
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
                                            Motivo *
                                        </label>
                                        <textarea
                                            value={formData.motivo}
                                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                            className="input"
                                            rows={3}
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
                                        Crear Transferencia
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Estado</label>
                                        <p className="mt-1">
                                            <span className={`badge ${getEstadoBadge(selectedTransferencia!.estado)}`}>
                                                {selectedTransferencia!.estado}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Motivo</label>
                                        <p className="mt-1 text-gray-900">{selectedTransferencia!.motivo}</p>
                                    </div>
                                    {selectedTransferencia!.observaciones && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Observaciones</label>
                                            <p className="mt-1 text-gray-900">{selectedTransferencia!.observaciones}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transferencias;
