import { useEffect, useState } from 'react';
import { Plus, Eye, Check, X, RotateCcw, Clock } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Transferencia, Bien, UnidadAdministrativa as Ubicacion, Responsable } from '../types';
import Swal from 'sweetalert2';

const Transferencias = () => {
    const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [bienFilter, setBienFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
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
        idBien: '',
        ubicacionDestinoId: '',
        responsableDestinoId: '',
        motivo: '',
        observaciones: '',
        tipoTransferencia: 'PERMANENTE',
        fechaRetornoEsperada: '',
    });

    useEffect(() => {
        fetchTransferencias();
        fetchDropdownData();
    }, [estadoFilter, bienFilter, tipoFilter]);

    const fetchTransferencias = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (estadoFilter) params.append('estatus', estadoFilter);
            if (bienFilter) params.append('idBien', bienFilter);
            if (tipoFilter) params.append('tipo', tipoFilter);

            const response = await api.get(`/transferencias?${params.toString()}`);
            setTransferencias(response.data);
        } catch (error) {
            console.error('Error fetching transferencias:', error);
            Swal.fire('Error', 'No se pudieron cargar las transferencias', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        try {
            const [bienesRes, ubicacionesRes, responsablesRes] = await Promise.all([
                api.get('/bienes'),
                api.get('/unidades-administrativas'),
                api.get('/responsables'),
            ]);
            setBienes(bienesRes.data);
            setUbicaciones(ubicacionesRes.data);
            setResponsables(responsablesRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            Swal.fire('Error', 'Error al cargar datos auxiliares', 'error');
        }
    };

    const handleCreate = () => {
        setFormData({
            idBien: '',
            ubicacionDestinoId: '',
            responsableDestinoId: '',
            motivo: '',
            observaciones: '',
            tipoTransferencia: 'PERMANENTE',
            fechaRetornoEsperada: '',
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
            const payload: any = {
                idBien: parseInt(formData.idBien),
                ubicacionDestinoId: parseInt(formData.ubicacionDestinoId),
                responsableDestinoId: parseInt(formData.responsableDestinoId),
                motivo: formData.motivo,
                observaciones: formData.observaciones,
                tipoTransferencia: formData.tipoTransferencia,
            };

            if (formData.tipoTransferencia === 'TEMPORAL' && formData.fechaRetornoEsperada) {
                payload.fechaRetornoEsperada = formData.fechaRetornoEsperada;
            }

            await api.post('/transferencias', payload);
            setModalOpen(false);
            fetchTransferencias();
            Swal.fire('Éxito', 'Transferencia creada correctamente', 'success');
        } catch (error: any) {
            console.error('Error creating transferencia:', error);
            Swal.fire('Error', error.response?.data?.message || 'Error al crear la transferencia', 'error');
        }
    };

    const handleAprobar = async (id: number) => {
        const transferencia = transferencias.find(t => t.id === id);
        const esTemporal = transferencia?.tipoTransferencia === 'TEMPORAL';

        const result = await Swal.fire({
            title: '¿Aprobar transferencia?',
            text: esTemporal
                ? "Transferencia temporal: No se modificará la ubicación del bien hasta la devolución."
                : "El bien se actualizará automáticamente a la nueva ubicación y responsable.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aprobar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/transferencias/${id}/aprobar`);
                fetchTransferencias();
                Swal.fire('Aprobada', 'La transferencia ha sido aprobada.', 'success');
            } catch (error: any) {
                console.error('Error aprobando transferencia:', error);
                Swal.fire('Error', error.response?.data?.message || 'Error al aprobar la transferencia', 'error');
            }
        }
    };

    const handleRechazar = async (id: number) => {
        const { value: observaciones } = await Swal.fire({
            title: 'Rechazar transferencia',
            input: 'textarea',
            inputLabel: 'Motivo del rechazo',
            inputPlaceholder: 'Ingrese el motivo...',
            inputAttributes: {
                'aria-label': 'Ingrese el motivo del rechazo'
            },
            showCancelButton: true,
            confirmButtonText: 'Rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Debe ingresar un motivo!';
                }
            }
        });

        if (observaciones) {
            try {
                await api.patch(`/transferencias/${id}/rechazar`, { observaciones });
                fetchTransferencias();
                Swal.fire('Rechazada', 'La transferencia ha sido rechazada.', 'success');
            } catch (error: any) {
                console.error('Error rechazando transferencia:', error);
                Swal.fire('Error', error.response?.data?.message || 'Error al rechazar la transferencia', 'error');
            }
        }
    };

    const handleDevolver = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Registrar devolución?',
            text: "Se marcará esta transferencia temporal como completada.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, registrar devolución',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/transferencias/${id}/devolver`);
                fetchTransferencias();
                Swal.fire('Devuelta', 'La devolución ha sido registrada correctamente.', 'success');
            } catch (error: any) {
                console.error('Error registrando devolución:', error);
                Swal.fire('Error', error.response?.data?.message || 'Error al registrar la devolución', 'error');
            }
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            Tipo
                        </label>
                        <select
                            value={tipoFilter}
                            onChange={(e) => setTipoFilter(e.target.value)}
                            className="input"
                        >
                            <option value="">Todos</option>
                            <option value="PERMANENTE">Permanente</option>
                            <option value="TEMPORAL">Temporal</option>
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
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Motivo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Solicitud
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                                Bien #{transferencia.idBien}
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transferencia.tipoTransferencia === 'TEMPORAL' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    <Clock className="w-3 h-3" />
                                                    Temporal
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Permanente
                                                </span>
                                            )}
                                            {transferencia.tipoTransferencia === 'TEMPORAL' && transferencia.fechaRetornoEsperada && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Retorno: {new Date(transferencia.fechaRetornoEsperada).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {transferencia.motivo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getEstadoBadge(transferencia.estatus)}`}>
                                                {transferencia.estatus}
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
                                                {isAdmin && transferencia.estatus === 'PENDIENTE' && (
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
                                                {transferencia.tipoTransferencia === 'TEMPORAL' &&
                                                    transferencia.estatus === 'APROBADA' &&
                                                    !transferencia.fechaDevolucion && (
                                                        <button
                                                            onClick={() => handleDevolver(transferencia.id)}
                                                            className="text-emerald-600 hover:text-emerald-900"
                                                            title="Registrar Devolución"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
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

                                    {/* Tipo de Transferencia */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Transferencia *
                                        </label>
                                        <select
                                            value={formData.tipoTransferencia}
                                            onChange={(e) => setFormData({ ...formData, tipoTransferencia: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="PERMANENTE">Permanente</option>
                                            <option value="TEMPORAL">Temporal</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.tipoTransferencia === 'PERMANENTE'
                                                ? 'El bien cambiará de ubicación y responsable permanentemente.'
                                                : 'El bien retornará a su ubicación original después de la fecha establecida.'}
                                        </p>
                                    </div>

                                    {/* Fecha Retorno (solo para TEMPORAL) */}
                                    {formData.tipoTransferencia === 'TEMPORAL' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha de Retorno Esperada
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.fechaRetornoEsperada}
                                                onChange={(e) => setFormData({ ...formData, fechaRetornoEsperada: e.target.value })}
                                                className="input"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    )}

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
                                            <span className={`badge ${getEstadoBadge(selectedTransferencia!.estatus)}`}>
                                                {selectedTransferencia!.estatus}
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
