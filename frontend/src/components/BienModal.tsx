import { useState, useEffect } from 'react';
import { X, RefreshCw, Image as ImageIcon, Star, Upload, Trash2 } from 'lucide-react';
import { Bien, Foto } from '../types';
import api from '../lib/api';
import Swal from 'sweetalert2';

interface BienModalProps {
    bien: Bien | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    mode: 'view' | 'create' | 'edit';
    onViewCodigos?: (bien: Bien) => void;
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

interface TipoOrigen {
    id: number;
    nombre: string;
}

const BienModal = ({ bien, isOpen, onClose, onSave, mode, onViewCodigos }: BienModalProps) => {
    const [creationMode, setCreationMode] = useState<'REGISTER' | 'NEW'>('REGISTER');
    const [formData, setFormData] = useState({
        codigoSudebip: '',
        codigoInterno: '',
        descripcion: '',
        marca: '',
        modelo: '',
        serialBien: '',
        fechaAdquisicion: '',
        estatusUso: 'ACTIVO',
        condicionFisica: 'BUENO',
        idUnidadAdministrativa: '',
        idResponsableUso: '',
        idCategoriaEspecifica: '',
        observacion: '',
        idTipoOrigen: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [responsables, setResponsables] = useState<Responsable[]>([]);
    const [categorias, setCategorias] = useState<CategoriaSudebip[]>([]);
    const [tiposOrigen, setTiposOrigen] = useState<TipoOrigen[]>([]);

    // Estados para fotos
    const [fotos, setFotos] = useState<Foto[]>([]);
    const [newFotos, setNewFotos] = useState<File[]>([]);
    const [uploadingFotos, setUploadingFotos] = useState(false);

    const fetchFotos = async (id: number) => {
        try {
            const response = await api.get(`/bienes/${id}/fotos`);
            setFotos(response.data);
        } catch (error) {
            console.error('Error cargando fotos:', error);
        }
    };

    useEffect(() => {
        if (bien && (mode === 'view' || mode === 'edit')) {
            setFormData({
                codigoSudebip: '', // No se usa en edición
                codigoInterno: bien.codigoInterno || '',
                descripcion: bien.descripcion || '',
                marca: bien.marca || '',
                modelo: bien.modelo || '',
                serialBien: bien.serialBien || '',
                fechaAdquisicion: bien.fechaAdquisicion || '',
                estatusUso: bien.estatusUso || 'ACTIVO',
                condicionFisica: bien.condicionFisica || 'BUENO',
                idUnidadAdministrativa: bien.idUnidadAdministrativa?.toString() || '',
                idResponsableUso: bien.idResponsableUso?.toString() || '',
                idCategoriaEspecifica: bien.idCategoriaEspecifica?.toString() || '',
                observacion: bien.observacion || '',
                idTipoOrigen: bien.idTipoOrigen?.toString() || '',
            });
        } else if (mode === 'create') {
            // Reset to defaults based on creationMode
            if (creationMode === 'NEW') {
                setFormData({
                    codigoSudebip: '',
                    codigoInterno: '',
                    descripcion: '',
                    marca: '',
                    modelo: '',
                    serialBien: '',
                    fechaAdquisicion: '',
                    estatusUso: 'INACTIVO', // Locked
                    condicionFisica: 'EXCELENTE', // Locked
                    idUnidadAdministrativa: '', // Set dynamically to UA-001
                    idResponsableUso: '',
                    idCategoriaEspecifica: '',
                    observacion: '',
                    idTipoOrigen: '',
                });
            } else {
                setFormData({
                    codigoSudebip: '',
                    codigoInterno: '',
                    descripcion: '',
                    marca: '',
                    modelo: '',
                    serialBien: '',
                    fechaAdquisicion: '',
                    estatusUso: 'ACTIVO',
                    condicionFisica: 'BUENO',
                    idUnidadAdministrativa: '',
                    idResponsableUso: '',
                    idCategoriaEspecifica: '',
                    observacion: '',
                    idTipoOrigen: '',
                });
            }
        }

        // Reset fotos
        setFotos([]);
        setNewFotos([]);

        if (bien && (mode === 'edit' || mode === 'view')) {
            fetchFotos(bien.id);
        }
    }, [bien, mode, creationMode]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ubicacionesRes, responsablesRes, categoriasRes, tiposOrigenRes] = await Promise.all([
                    api.get('/unidades-administrativas'),
                    api.get('/responsables'),
                    api.get('/categorias-sudebip'),
                    api.get('/tipos-origen'),
                ]);
                setUbicaciones(ubicacionesRes.data);
                setResponsables(responsablesRes.data);
                setCategorias(categoriasRes.data);
                setTiposOrigen(tiposOrigenRes.data);

                // Set default location to Almacén (UA-001) for new items
                if (isOpen && mode === 'create' && creationMode === 'NEW') {
                    const almacen = ubicacionesRes.data.find((u: any) => u.codigoUnidadSudebip === 'UA-001');
                    if (almacen) {
                        setFormData(prev => ({ ...prev, idUnidadAdministrativa: almacen.id.toString() }));
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                Swal.fire('Error', 'No se pudieron cargar los datos auxiliares', 'error');
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, mode, creationMode]);

    const handleDeleteFoto = async (fotoId: number) => {
        try {
            await api.delete(`/bienes/fotos/${fotoId}`);
            setFotos(fotos.filter(f => f.id !== fotoId));
            Swal.fire('Eliminado', 'Foto eliminada correctamente', 'success');
        } catch (error) {
            console.error('Error eliminando foto:', error);
            Swal.fire('Error', 'No se pudo eliminar la foto', 'error');
        }
    };

    const handleSetPrincipal = async (fotoId: number) => {
        try {
            await api.patch(`/bienes/fotos/${fotoId}/principal`);
            // Actualizar estado local
            setFotos(fotos.map(f => ({
                ...f,
                esPrincipal: f.id === fotoId
            })));
        } catch (error) {
            console.error('Error marcando foto principal:', error);
            Swal.fire('Error', 'No se pudo actualizar la foto principal', 'error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Validar tamaño y tipo aquí si es necesario
            setNewFotos([...newFotos, ...filesArray]);
        }
    };

    const removeNewFoto = (index: number) => {
        setNewFotos(newFotos.filter((_, i) => i !== index));
    };

    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && mode === 'create') {
            setStartTime(Date.now());
        } else {
            setStartTime(null);
        }
    }, [isOpen, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Para editar, NO enviar codigoSudebip, solo idCategoriaEspecifica
            const payload: any = {
                codigoInterno: formData.codigoInterno,
                descripcion: formData.descripcion,
                marca: formData.marca,
                modelo: formData.modelo,
                serialBien: formData.serialBien,
                fechaAdquisicion: formData.fechaAdquisicion,
                estatusUso: formData.estatusUso,
                condicionFisica: formData.condicionFisica,
                idUnidadAdministrativa: parseInt(formData.idUnidadAdministrativa),
                idResponsableUso: parseInt(formData.idResponsableUso),
                idCategoriaEspecifica: parseInt(formData.idCategoriaEspecifica),
                observacion: formData.observacion,
                idTipoOrigen: parseInt(formData.idTipoOrigen),
            };

            // Solo incluir codigoSudebip al crear
            if (mode === 'create') {
                // payload.codigoSudebip = formData.codigoSudebip; // REMOVED: Backend does not accept this field
                if (startTime) {
                    const endTime = Date.now();
                    const durationSeconds = Math.round((endTime - startTime) / 1000);
                    payload.tiempoRegistro = durationSeconds;
                }
            }

            let bienId = bien?.id;

            if (mode === 'create') {
                const response = await api.post('/bienes', payload);
                bienId = response.data.id;
                Swal.fire('Creado', 'El bien ha sido registrado exitosamente.', 'success');
            } else if (mode === 'edit' && bien) {
                await api.patch(`/bienes/${bien.id}`, payload);
                Swal.fire('Actualizado', 'El bien ha sido actualizado exitosamente.', 'success');
            }

            // Subir fotos si hay nuevas
            if (newFotos.length > 0 && bienId) {
                setUploadingFotos(true);
                const formDataFotos = new FormData();
                newFotos.forEach(file => {
                    formDataFotos.append('fotos', file);
                });

                try {
                    await api.post(`/bienes/${bienId}/fotos`, formDataFotos, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (uploadError) {
                    console.error('Error subiendo fotos:', uploadError);
                    Swal.fire('Advertencia', 'El bien se guardó pero hubo error subiendo algunas fotos.', 'warning');
                } finally {
                    setUploadingFotos(false);
                }
            }

            onSave();
            onClose();
        } catch (err: any) {
            console.error('Error creating/updating bien:', err);
            const errorMessage = err.response?.data?.message;

            if (Array.isArray(errorMessage)) {
                // Validation errors from class-validator
                setError(errorMessage.join(', '));
                Swal.fire('Error de Validación', errorMessage.join('\n'), 'error');
            } else if (typeof errorMessage === 'string') {
                setError(errorMessage);
                Swal.fire('Error', errorMessage, 'error');
            } else {
                setError('Error al guardar el bien. Por favor verifica todos los campos.');
                Swal.fire('Error', 'Error al guardar el bien. Por favor verifica todos los campos.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isViewMode = mode === 'view';
    const isNewMode = mode === 'create' && creationMode === 'NEW';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold">
                            {mode === 'view' && 'Detalles del Bien'}
                            {mode === 'create' && (creationMode === 'NEW' ? 'Nuevo Bien (Ingreso)' : 'Registrar Bien Existente')}
                            {mode === 'edit' && 'Editar Bien'}
                        </h2>
                        {mode === 'create' && (
                            <button
                                type="button"
                                onClick={() => setCreationMode(creationMode === 'REGISTER' ? 'NEW' : 'REGISTER')}
                                className={`btn btn-sm flex items-center gap-2 ${creationMode === 'NEW' ? 'btn-success' : 'btn-outline'}`}
                                title={creationMode === 'NEW' ? 'Cambiar a Registro Manual' : 'Cambiar a Ingreso de Bien Nuevo'}
                            >
                                <RefreshCw className="w-4 h-4" />
                                {creationMode === 'NEW' ? 'Modo: Bien Nuevo' : 'Modo: Registro'}
                            </button>
                        )}
                    </div>
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
                        {/* Tipo de Origen */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Origen *
                            </label>
                            <select
                                value={formData.idTipoOrigen}
                                onChange={(e) => setFormData({ ...formData, idTipoOrigen: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode}
                            >
                                <option value="">Seleccione un origen</option>
                                {tiposOrigen.map((tipo) => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                placeholder="XXXXX-XXXX"
                                required={mode === 'create'}
                                disabled={isViewMode || mode === 'edit'}
                            />
                            {mode === 'create' && (
                                <p className="mt-1 text-xs text-blue-600">
                                    💡 Formato: XXXXX-XXXX (ej: 14010-0001). Debe existir en el catálogo SUDEBIP.
                                </p>
                            )}
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
                            {mode === 'create' && (
                                <p className="mt-1 text-xs text-blue-600">
                                    💡 Código único del bien (ej: SA-AMB-001, SA-PC-001). Debe ser único en el sistema.
                                </p>
                            )}
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
                                value={formData.serialBien}
                                onChange={(e) => setFormData({ ...formData, serialBien: e.target.value })}
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
                                value={formData.estatusUso}
                                onChange={(e) => setFormData({ ...formData, estatusUso: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode || isNewMode}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="EN_REPARACION">En Reparación</option>
                                <option value="DESINCORPORADO">Desincorporado</option>
                            </select>
                            {isNewMode && <p className="text-xs text-gray-500 mt-1">Bloqueado en modo Nuevo Bien</p>}
                        </div>

                        {/* Condición */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condición *</label>
                            <select
                                value={formData.condicionFisica}
                                onChange={(e) => setFormData({ ...formData, condicionFisica: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode || isNewMode}
                            >
                                <option value="EXCELENTE">Excelente</option>
                                <option value="BUENO">Bueno</option>
                                <option value="REGULAR">Regular</option>
                                <option value="MALO">Malo</option>
                                <option value="OBSOLETO">Obsoleto</option>
                            </select>
                            {isNewMode && <p className="text-xs text-gray-500 mt-1">Bloqueado en modo Nuevo Bien</p>}
                        </div>

                        {/* Ubicación - DROPDOWN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ubicación (Departamento) *
                            </label>
                            <select
                                value={formData.idUnidadAdministrativa}
                                onChange={(e) => setFormData({ ...formData, idUnidadAdministrativa: e.target.value })}
                                className="input"
                                required
                                disabled={isViewMode || isNewMode}
                            >
                                <option value="">Seleccione una ubicación</option>
                                {ubicaciones.map((ubicacion) => (
                                    <option key={ubicacion.id} value={ubicacion.id}>
                                        {ubicacion.nombre}
                                    </option>
                                ))}
                            </select>
                            {isNewMode && <p className="text-xs text-gray-500 mt-1">Bloqueado: Almacén (UA-001)</p>}
                        </div>

                        {/* Responsable - DROPDOWN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Responsable *
                            </label>
                            <select
                                value={formData.idResponsableUso}
                                onChange={(e) => setFormData({ ...formData, idResponsableUso: e.target.value })}
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
                                value={formData.idCategoriaEspecifica}
                                onChange={(e) => setFormData({ ...formData, idCategoriaEspecifica: e.target.value })}
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
                                value={formData.observacion}
                                onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                                className="input"
                                rows={3}
                                disabled={isViewMode}
                            />
                        </div>

                        {/* SECCIÓN DE FOTOS */}
                        <div className="md:col-span-2 mt-4 border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <ImageIcon size={20} />
                                Galería de Fotos
                            </h3>

                            {!isViewMode && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Agregar Fotos
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2 transition-colors">
                                            <Upload size={18} />
                                            Seleccionar Archivos
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/png, image/jpeg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            {newFotos.length} archivo(s) seleccionado(s)
                                        </span>
                                    </div>

                                    {/* Previsualización de archivos nuevos */}
                                    {newFotos.length > 0 && (
                                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {newFotos.map((file, index) => (
                                                <div key={index} className="relative group border rounded-lg p-2 bg-gray-50">
                                                    <div className="text-xs truncate mb-1">{file.name}</div>
                                                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewFoto(index)}
                                                        className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fotos Existentes */}
                            {fotos.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {fotos.map((foto) => (
                                        <div key={foto.id} className="relative group border rounded-lg overflow-hidden bg-white shadow-sm">
                                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                                                <img
                                                    src={`http://localhost:3000${foto.rutaArchivo}`}
                                                    alt="Foto del bien"
                                                    className="object-cover w-full h-full"
                                                />
                                                {foto.esPrincipal && (
                                                    <div className="absolute top-2 left-2 bg-yellow-400 text-white rounded-full p-1 shadow-md">
                                                        <Star size={12} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            {!isViewMode && (
                                                <div className="p-2 flex justify-between items-center bg-gray-50">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrincipal(foto.id)}
                                                        className={`p-1 rounded transition-colors ${foto.esPrincipal ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                        title="Marcar como principal"
                                                    >
                                                        <Star size={16} fill={foto.esPrincipal ? "currentColor" : "none"} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteFoto(foto.id)}
                                                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Eliminar foto"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                    <p>No hay fotos asociadas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        {isViewMode && onViewCodigos && bien && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onViewCodigos(bien);
                                }}
                                className="btn btn-primary bg-purple-600 hover:bg-purple-700 border-purple-600 flex items-center gap-2 mr-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                                Ver Códigos
                            </button>
                        )}
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
                                disabled={loading || uploadingFotos}
                                className="btn btn-primary"
                            >
                                {loading ? 'Guardando...' : (uploadingFotos ? 'Subiendo fotos...' : 'Guardar')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BienModal;
