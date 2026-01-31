import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Bien } from '../types';
import api from '../lib/api';

interface BienModalProps {
    bien: Bien | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    mode: 'view' | 'create' | 'edit';
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

interface CategoriaSudebip {
    id: number;
    codigo: string;
    descripcion: string;
    nivel: string;
}

const BienModal = ({ bien, isOpen, onClose, onSave, mode }: BienModalProps) => {
    const [formData, setFormData] = useState({
        codigoSudebip: '',
        codigoInterno: '',
        descripcion: '',
        marca: '',
        modelo: '',
        serial: '',
        fechaAdquisicion: '',
        estado: 'ACTIVO',
        condicion: 'BUENO',
        ubicacionId: '',
        responsableId: '',
        categoriaSudebipId: '',
        observaciones: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [categorias, setCategorias] = useState<CategoriaSudebip[]>([]);

    useEffect(() => {
        if (bien && (mode === 'view' || mode === 'edit')) {
            setFormData({
                codigoSudebip: bien.codigoSudebip || '',
                codigoInterno: bien.codigoInterno || '',
                descripcion: bien.descripcion || '',
                marca: bien.marca || '',
                modelo: bien.modelo || '',
                serial: bien.serial || '',
                fechaAdquisicion: bien.fechaAdquisicion || '',
                estado: bien.estado || 'ACTIVO',
                condicion: bien.condicion || 'BUENO',
                ubicacionId: bien.ubicacionId?.toString() || '',
                responsableId: bien.responsableId?.toString() || '',
                categoriaSudebipId: bien.categoriaSudebipId?.toString() || '',
                observaciones: bien.observaciones || '',
            });
        } else if (mode === 'create') {
            setFormData({
                codigoSudebip: '',
                codigoInterno: '',
                descripcion: '',
                marca: '',
                modelo: '',
                serial: '',
                fechaAdquisicion: '',
                estado: 'ACTIVO',
                condicion: 'BUENO',
                ubicacionId: '',
                responsableId: '',
                categoriaSudebipId: '',
                observaciones: '',
            });
        }
    }, [bien, mode]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ubicacionesRes, responsablesRes, categoriasRes] = await Promise.all([
                    api.get('/ubicaciones'),
                    api.get('/responsables'),
                    api.get('/categorias-sudebip'),
                ]);
                setUbicaciones(ubicacionesRes.data);
                setResponsables(responsablesRes.data);
                setCategorias(categoriasRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Para editar, NO enviar codigoSudebip, solo categoriaSudebipId
            const payload: any = {
                codigoInterno: formData.codigoInterno,
                descripcion: formData.descripcion,
                marca: formData.marca,
                modelo: formData.modelo,
                serial: formData.serial,
                fechaAdquisicion: formData.fechaAdquisicion,
                estado: formData.estado,
                condicion: formData.condicion,
                ubicacionId: parseInt(formData.ubicacionId),
                responsableId: parseInt(formData.responsableId),
                categoriaSudebipId: parseInt(formData.categoriaSudebipId),
                observaciones: formData.observaciones,
            };

            // Solo incluir codigoSudebip al crear
            if (mode === 'create') {
                payload.codigoSudebip = formData.codigoSudebip;
            }

            if (mode === 'create') {
                await api.post('/bienes', payload);
            } else if (mode === 'edit' && bien) {
                await api.patch(`/bienes/${bien.id}`, payload);
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el bien');
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
                        {mode === 'view' && 'Detalles del Bien'}
                        {mode === 'create' && 'Nuevo Bien'}
                        {mode === 'edit' && 'Editar Bien'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Código SUDEBIP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código SUDEBIP *
                            </label>
                            <input
                                type="text"
                                value={formData.codigoSudebip}
                                onChange={(e) => setFormData({ ...formData, codigoSudebip: e.target.value })}
                                className="input"
                                placeholder="XXXX-XXXX"
                                required={mode === 'create'}
                                disabled={isViewMode || mode === 'edit'}
                            />
                        </div>

                        {/* Código Interno */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código Interno *
                            </label>
                            <input
                                type="text"
                                value={formData.codigoInterno}
                                onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción *
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="input"
                                rows={2}
                                required
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Marca */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                            <input
                                type="text"
                                value={formData.marca}
                                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Modelo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                            <input
                                type="text"
                                value={formData.modelo}
                                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Serial */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Serial</label>
                            <input
                                type="text"
                                value={formData.serial}
                                onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Fecha de Adquisición */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Adquisición
                            </label>
                            <input
                                type="date"
                                value={formData.fechaAdquisicion}
                                onChange={(e) => setFormData({ ...formData, fechaAdquisicion: e.target.value })}
                                className="input"
                                disabled={isViewMode}
                            />
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="EN_REPARACION">En Reparación</option>
                                <option value="DESINCORPORADO">Desincorporado</option>
                            </select>
                        </div>

                        {/* Condición */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condición *</label>
                            <select
                                value={formData.condicion}
                                onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="EXCELENTE">Excelente</option>
                                <option value="BUENO">Bueno</option>
                                <option value="REGULAR">Regular</option>
                                <option value="MALO">Malo</option>
                                <option value="OBSOLETO">Obsoleto</option>
                            </select>
                        </div>

                        {/* Ubicación - DROPDOWN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ubicación (Departamento) *
                            </label>
                            <select
                                value={formData.ubicacionId}
                                onChange={(e) => setFormData({ ...formData, ubicacionId: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="">Seleccione una ubicación</option>
                                {ubicaciones.map((ubicacion) => (
                                    <option key={ubicacion.id} value={ubicacion.id}>
                                        {ubicacion.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Responsable - DROPDOWN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Responsable *
                            </label>
                            <select
                                value={formData.responsableId}
                                onChange={(e) => setFormData({ ...formData, responsableId: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="">Seleccione un responsable</option>
                                {responsables.map((responsable) => (
                                    <option key={responsable.id} value={responsable.id}>
                                        {responsable.nombres} {responsable.apellidos} ({responsable.cedula})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Categoría SUDEBIP - DROPDOWN */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría SUDEBIP *
                            </label>
                            <select
                                value={formData.categoriaSudebipId}
                                onChange={(e) => setFormData({ ...formData, categoriaSudebipId: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.codigo} - {categoria.descripcion} ({categoria.nivel})
                                    </option>
                                ))}
                            </select>
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

export default BienModal;
