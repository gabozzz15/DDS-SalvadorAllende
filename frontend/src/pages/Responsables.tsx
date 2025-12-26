import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Upload, FileSignature } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';
import { Responsable, UnidadAdministrativa } from '../types';

interface ResponsableModalProps {
    responsable: Responsable | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    mode: 'view' | 'create' | 'edit';
}

const ResponsableModal = ({ responsable, isOpen, onClose, onSave, mode }: ResponsableModalProps) => {
    const [formData, setFormData] = useState({
        cedula: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        idUnidadAdscripcion: '',
        cargo: '',
        tipoResponsableSudebip: 'U' as 'D' | 'U' | 'C',
        aceptaResponsabilidad: false,
        observaciones: '',
    });

    const [loading, setLoading] = useState(false);
    const [unidades, setUnidades] = useState<UnidadAdministrativa[]>([]);
    const [firmaPreview, setFirmaPreview] = useState<string | null>(null);

    useEffect(() => {
        if (responsable && (mode === 'view' || mode === 'edit')) {
            setFormData({
                cedula: responsable.cedula || '',
                nombres: responsable.nombres || '',
                apellidos: responsable.apellidos || '',
                telefono: responsable.telefono || '',
                email: responsable.email || '',
                idUnidadAdscripcion: responsable.idUnidadAdscripcion?.toString() || '',
                cargo: responsable.cargo || '',
                tipoResponsableSudebip: responsable.tipoResponsableSudebip || 'U',
                aceptaResponsabilidad: responsable.aceptaResponsabilidad || false,
                observaciones: responsable.observaciones || '',
            });
            setFirmaPreview(responsable.firmaDigital || null);
        } else if (mode === 'create') {
            setFormData({
                cedula: '',
                nombres: '',
                apellidos: '',
                telefono: '',
                email: '',
                idUnidadAdscripcion: '',
                cargo: '',
                tipoResponsableSudebip: 'U',
                aceptaResponsabilidad: false,
                observaciones: '',
            });
            setFirmaPreview(null);
        }
    }, [responsable, mode]);

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const response = await api.get('/unidades-administrativas');
                setUnidades(response.data);
            } catch (error) {
                console.error('Error fetching unidades:', error);
            }
        };

        if (isOpen) {
            fetchUnidades();
        }
    }, [isOpen]);

    const handleCedulaChange = (value: string) => {
        // Remove any existing V- prefix and non-numeric characters
        let cleanValue = value.replace(/^V-/, '').replace(/\D/g, '');
        // Add V- prefix if there's a value
        const formattedValue = cleanValue ? `V-${cleanValue}` : '';
        setFormData({ ...formData, cedula: formattedValue });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFirmaPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que acepte responsabilidad
        if (!formData.aceptaResponsabilidad) {
            Swal.fire({
                title: 'Aceptación Requerida',
                text: 'El responsable debe aceptar la responsabilidad sobre los bienes asignados.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                idUnidadAdscripcion: parseInt(formData.idUnidadAdscripcion),
                firmaDigital: firmaPreview || undefined,
            };

            if (mode === 'create') {
                await api.post('/responsables', payload);
                Swal.fire('Creado', 'El responsable ha sido registrado exitosamente.', 'success');
            } else if (mode === 'edit' && responsable) {
                await api.patch(`/responsables/${responsable.id}`, payload);
                Swal.fire('Actualizado', 'El responsable ha sido actualizado exitosamente.', 'success');
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error saving responsable:', err);
            const errorMessage = err.response?.data?.message;
            if (Array.isArray(errorMessage)) {
                Swal.fire('Error de Validación', errorMessage.join('\n'), 'error');
            } else if (typeof errorMessage === 'string') {
                Swal.fire('Error', errorMessage, 'error');
            } else {
                Swal.fire('Error', 'Error al guardar el responsable.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {mode === 'view' && 'Detalles del Responsable'}
                        {mode === 'create' && 'Nuevo Responsable'}
                        {mode === 'edit' && 'Editar Responsable'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cédula */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cédula *
                            </label>
                            <input
                                type="text"
                                value={formData.cedula}
                                onChange={(e) => handleCedulaChange(e.target.value)}
                                className="input"
                                required
                                disabled={isViewMode || mode === 'edit'}
                                placeholder="V-12345678"
                            />
                        </div>

                        {/* Nombres */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombres *
                            </label>
                            <input
                                type="text"
                                value={formData.nombres}
                                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Apellidos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellidos *
                            </label>
                            <input
                                type="text"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                                placeholder="0424-1234567"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        {/* Unidad de Adscripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unidad de Adscripción *
                            </label>
                            <select
                                value={formData.idUnidadAdscripcion}
                                onChange={(e) => setFormData({ ...formData, idUnidadAdscripcion: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="">Seleccione una unidad</option>
                                {unidades.map((unidad) => (
                                    <option key={unidad.id} value={unidad.id}>
                                        {unidad.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cargo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cargo
                            </label>
                            <input
                                type="text"
                                value={formData.cargo}
                                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                                placeholder="Ej: Jefe de Departamento"
                            />
                        </div>

                        {/* Tipo de Responsable SUDEBIP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Responsable SUDEBIP *
                            </label>
                            <select
                                value={formData.tipoResponsableSudebip}
                                onChange={(e) => setFormData({ ...formData, tipoResponsableSudebip: e.target.value as 'D' | 'U' | 'C' })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="D">D - Administrativo</option>
                                <option value="U">U - Uso Directo</option>
                                <option value="C">C - Cuido Directo</option>
                            </select>
                        </div>

                        {/* Acepta Responsabilidad */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.aceptaResponsabilidad}
                                    onChange={(e) => setFormData({ ...formData, aceptaResponsabilidad: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    disabled={isViewMode}
                                    required={!isViewMode}
                                />
                                <span className="text-sm font-medium text-red-700">
                                    Acepta responsabilidad sobre los bienes asignados *
                                </span>
                            </label>
                            {!isViewMode && (
                                <p className="text-xs text-red-600 mt-1">
                                    ⚠️ Este campo es obligatorio para crear o editar un responsable
                                </p>
                            )}
                        </div>

                        {/* Firma Digital */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Firma Digital
                            </label>
                            {!isViewMode && (
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="input"
                                    />
                                    <Upload className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            {firmaPreview && (
                                <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <img
                                        src={firmaPreview}
                                        alt="Firma"
                                        className="max-h-32 mx-auto"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observaciones
                            </label>
                            <textarea
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                className="input"
                                rows={3}
                                disabled={isViewMode}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            {isViewMode ? 'Cerrar' : 'Cancelar'}
                        </button>
                        {!isViewMode && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const Responsables = () => {
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActivo, setFilterActivo] = useState<string>('todos');
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'view' | 'create' | 'edit';
        responsable: Responsable | null;
    }>({
        isOpen: false,
        mode: 'create',
        responsable: null,
    });

    useEffect(() => {
        fetchResponsables();
    }, [filterActivo]);

    const fetchResponsables = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterActivo !== 'todos') {
                params.append('activo', filterActivo);
            }
            const response = await api.get(`/responsables?${params.toString()}`);
            setResponsables(response.data);
        } catch (error) {
            console.error('Error fetching responsables:', error);
            Swal.fire('Error', 'No se pudieron cargar los responsables', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalState({
            isOpen: true,
            mode: 'create',
            responsable: null,
        });
    };

    const handleView = (responsable: Responsable) => {
        setModalState({
            isOpen: true,
            mode: 'view',
            responsable,
        });
    };

    const handleEdit = (responsable: Responsable) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            responsable,
        });
    };

    const handleToggleActivo = async (responsable: Responsable) => {
        const newStatus = !responsable.activo;
        const result = await Swal.fire({
            title: newStatus ? '¿Activar responsable?' : '¿Desactivar responsable?',
            text: newStatus
                ? 'El responsable podrá ser asignado a bienes nuevamente.'
                : 'El responsable no podrá ser asignado a nuevos bienes.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: newStatus ? 'Activar' : 'Desactivar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/responsables/${responsable.id}`, {
                    activo: newStatus,
                });
                Swal.fire(
                    newStatus ? 'Activado' : 'Desactivado',
                    `El responsable ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`,
                    'success'
                );
                fetchResponsables();
            } catch (error) {
                console.error('Error toggling responsable:', error);
                Swal.fire('Error', 'No se pudo cambiar el estado del responsable', 'error');
            }
        }
    };

    const handleDelete = async (responsable: Responsable) => {
        const result = await Swal.fire({
            title: '¿Eliminar responsable?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#dc2626',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/responsables/${responsable.id}`);
                Swal.fire('Eliminado', 'El responsable ha sido eliminado exitosamente.', 'success');
                fetchResponsables();
            } catch (error) {
                console.error('Error deleting responsable:', error);
                Swal.fire('Error', 'No se pudo eliminar el responsable', 'error');
            }
        }
    };

    const filteredResponsables = responsables.filter((responsable) => {
        const matchesSearch =
            responsable.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
            responsable.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            responsable.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
            responsable.cargo?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Responsables</h1>
                    <p className="text-gray-600 mt-1">Administración de personas responsables de bienes</p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo Responsable
                </button>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por cédula, nombre o cargo..."
                                className="input pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            value={filterActivo}
                            onChange={(e) => setFilterActivo(e.target.value)}
                            className="input"
                        >
                            <option value="todos">Todos</option>
                            <option value="true">Activos</option>
                            <option value="false">Inactivos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Cargando responsables...</p>
                        </div>
                    ) : filteredResponsables.length === 0 ? (
                        <div className="text-center py-8">
                            <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No se encontraron responsables</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cédula
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre Completo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cargo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredResponsables.map((responsable) => (
                                    <tr key={responsable.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {responsable.cedula}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {responsable.nombres} {responsable.apellidos}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {responsable.cargo || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{responsable.telefono || '-'}</div>
                                            <div className="text-xs text-gray-400">{responsable.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {responsable.tipoResponsableSudebip}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${responsable.activo
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {responsable.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(responsable)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(responsable)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActivo(responsable)}
                                                    className={responsable.activo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                                                    title={responsable.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {responsable.activo ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(responsable)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <ResponsableModal
                responsable={modalState.responsable}
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSave={fetchResponsables}
                mode={modalState.mode}
            />
        </div>
    );
};

export default Responsables;
