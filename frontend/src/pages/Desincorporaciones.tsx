import { useEffect, useState } from 'react';
import { Plus, Eye, Check, X, Play } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Desincorporacion {
    id: number;
    idBien: number;
    motivo: 'PERDIDA' | 'DAÑO' | 'OBSOLESCENCIA' | 'DONACION' | 'OTRO';
    descripcionMotivo: string;
    valorResidual?: number;
    documentoRespaldo?: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'EJECUTADA';
    fechaSolicitud: string;
    fechaAprobacion?: string;
    fechaEjecucion?: string;
    solicitadoPor: number;
    aprobadoPor?: number;
    observacion?: string;
}

interface Bien {
    id: number;
    codigoInterno: string;
    descripcion: string;
}

const Desincorporaciones = () => {
    const [desincorporaciones, setDesincorporaciones] = useState<Desincorporacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [bienFilter, setBienFilter] = useState('');
    const { isAdmin } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDesincorporacion, setSelectedDesincorporacion] = useState<Desincorporacion | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

    // Data for dropdowns
    const [bienes, setBienes] = useState<Bien[]>([]);

    // Form data
    const [formData, setFormData] = useState({
        idBien: '',
        motivo: 'OBSOLESCENCIA',
        descripcionMotivo: '',
        valorResidual: '',
        documentoRespaldo: '',
    });

    useEffect(() => {
        fetchDesincorporaciones();
        fetchDropdownData();
    }, [estadoFilter, bienFilter]);

    const fetchDesincorporaciones = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (estadoFilter) params.append('estatusUso', estadoFilter);
            if (bienFilter) params.append('idBien', bienFilter);

            const response = await api.get(`/desincorporaciones?${params.toString()}`);
            setDesincorporaciones(response.data);
        } catch (error) {
            console.error('Error fetching desincorporaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const response = await api.get('/bienes');
            setBienes(response.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleCreate = () => {
        setFormData({
            idBien: '',
            motivo: 'OBSOLESCENCIA',
            descripcionMotivo: '',
            valorResidual: '',
            documentoRespaldo: '',
        });
        setModalMode('create');
        setModalOpen(true);
    };

    const handleView = (desincorporacion: Desincorporacion) => {
        setSelectedDesincorporacion(desincorporacion);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                idBien: parseInt(formData.idBien),
                motivo: formData.motivo,
                descripcionMotivo: formData.descripcionMotivo,
            };

            if (formData.valorResidual) {
                payload.valorResidual = parseFloat(formData.valorResidual);
            }

            if (formData.documentoRespaldo) {
                payload.documentoRespaldo = formData.documentoRespaldo;
            }

            await api.post('/desincorporaciones', payload);
            setModalOpen(false);
            fetchDesincorporaciones();
        } catch (error: any) {
            console.error('Error creating desincorporacion:', error);
            alert(error.response?.data?.message || 'Error al crear la desincorporación');
        }
    };

    const handleAprobar = async (id: number) => {
        if (!window.confirm('¿Está seguro de aprobar esta desincorporación?')) return;

        try {
            await api.post(`/desincorporaciones/${id}/aprobar`);
            fetchDesincorporaciones();
        } catch (error: any) {
            console.error('Error aprobando desincorporacion:', error);
            alert(error.response?.data?.message || 'Error al aprobar la desincorporación');
        }
    };

    const handleRechazar = async (id: number) => {
        const motivo = window.prompt('Ingrese el motivo del rechazo:');
        if (motivo === null) return;

        try {
            await api.post(`/desincorporaciones/${id}/rechazar`, { observacion: motivo });
            fetchDesincorporaciones();
        } catch (error: any) {
            console.error('Error rechazando desincorporacion:', error);
            alert(error.response?.data?.message || 'Error al rechazar la desincorporación');
        }
    };

    const handleEjecutar = async (id: number) => {
        if (!window.confirm('¿Está seguro de ejecutar esta desincorporación? El bien cambiará a estado DESINCORPORADO permanentemente.')) return;

        try {
            await api.post(`/desincorporaciones/${id}/execute`);
            fetchDesincorporaciones();
        } catch (error: any) {
            console.error('Error ejecutando desincorporacion:', error);
            alert(error.response?.data?.message || 'Error al ejecutar la desincorporación');
        }
    };

    const getEstadoBadge = (estado: string) => {
        const badges = {
            PENDIENTE: 'badge-warning',
            APROBADA: 'badge-info',
            RECHAZADA: 'badge-danger',
            EJECUTADA: 'badge-success',
        };
        return badges[estado as keyof typeof badges] || 'badge-secondary';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando desincorporaciones...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Desincorporaciones</h1>
                    <p className="text-gray-600 mt-1">Gestión de baja de bienes institucionales</p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nueva Solicitud
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
                            {desincorporaciones.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron desincorporaciones
                                    </td>
                                </tr>
                            ) : (
                                desincorporaciones.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                Bien #{item.idBien}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {item.motivo}
                                            </div>
                                            <div className="text-xs text-gray-500 max-w-xs truncate">
                                                {item.descripcionMotivo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getEstadoBadge(item.estatusUso)}`}>
                                                {item.estatusUso}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.fechaSolicitud).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(item)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isAdmin && item.estatusUso === 'PENDIENTE' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprobar(item.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Aprobar"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRechazar(item.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Rechazar"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {isAdmin && item.estatusUso === 'APROBADA' && (
                                                    <button
                                                        onClick={() => handleEjecutar(item.id)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Ejecutar Desincorporación"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                    </button>
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
                Mostrando {desincorporaciones.length} registro{desincorporaciones.length !== 1 ? 's' : ''}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">
                                {modalMode === 'view' ? 'Detalles de Desincorporación' : 'Nueva Solicitud'}
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
                                            value={formData.idBien}
                                            onChange={(e) => setFormData({ ...formData, idBien: e.target.value })}
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

                                    {/* Motivo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Motivo *
                                        </label>
                                        <select
                                            value={formData.motivo}
                                            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="OBSOLESCENCIA">Obsolescencia</option>
                                            <option value="DAÑO">Daño Irreparable</option>
                                            <option value="PERDIDA">Pérdida / Robo</option>
                                            <option value="DONACION">Donación</option>
                                            <option value="OTRO">Otro</option>
                                        </select>
                                    </div>

                                    {/* Descripción Motivo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción del Motivo *
                                        </label>
                                        <textarea
                                            value={formData.descripcionMotivo}
                                            onChange={(e) => setFormData({ ...formData, descripcionMotivo: e.target.value })}
                                            className="input"
                                            rows={3}
                                            required
                                            placeholder="Explique detalladamente la razón de la desincorporación..."
                                        />
                                    </div>

                                    {/* Valor Residual */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor Residual (Opcional)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.valorResidual}
                                            onChange={(e) => setFormData({ ...formData, valorResidual: e.target.value })}
                                            className="input"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Documento Respaldo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Documento de Respaldo (URL/Referencia)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.documentoRespaldo}
                                            onChange={(e) => setFormData({ ...formData, documentoRespaldo: e.target.value })}
                                            className="input"
                                            placeholder="N° Oficio o Enlace al documento"
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
                                        Crear Solicitud
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Estado</label>
                                            <p className="mt-1">
                                                <span className={`badge ${getEstadoBadge(selectedDesincorporacion!.estado)}`}>
                                                    {selectedDesincorporacion!.estado}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Fecha Solicitud</label>
                                            <p className="mt-1 text-gray-900">
                                                {new Date(selectedDesincorporacion!.fechaSolicitud).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Motivo</label>
                                        <p className="mt-1 text-gray-900 font-medium">{selectedDesincorporacion!.motivo}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Descripción</label>
                                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                                            {selectedDesincorporacion!.descripcionMotivo}
                                        </p>
                                    </div>

                                    {selectedDesincorporacion!.observacion && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Observaciones (Rechazo)</label>
                                            <p className="mt-1 text-red-600 bg-red-50 p-3 rounded-md">
                                                {selectedDesincorporacion!.observacion}
                                            </p>
                                        </div>
                                    )}

                                    {selectedDesincorporacion!.valorResidual && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Valor Residual</label>
                                            <p className="mt-1 text-gray-900">
                                                {selectedDesincorporacion!.valorResidual}
                                            </p>
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

export default Desincorporaciones;
