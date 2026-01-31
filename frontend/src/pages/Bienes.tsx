import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Bien } from '../types';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import BienModal from '../components/BienModal';

const Bienes = () => {
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const { isAdmin } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedBien, setSelectedBien] = useState<Bien | null>(null);

    useEffect(() => {
        fetchBienes();
    }, [estadoFilter]);

    const fetchBienes = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (estadoFilter) params.append('estatusUso', estadoFilter);
            if (search) params.append('search', search);

            const response = await api.get(`/bienes?${params.toString()}`);
            setBienes(response.data);
        } catch (error) {
            console.error('Error fetching bienes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchBienes();
    };

    const handleView = (bien: Bien) => {
        setSelectedBien(bien);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedBien(null);
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEdit = (bien: Bien) => {
        setSelectedBien(bien);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDelete = async (bien: Bien) => {
        if (!window.confirm(`¿Está seguro de eliminar el bien "${bien.descripcion}"?`)) {
            return;
        }

        try {
            await api.delete(`/bienes/${bien.id}`);
            fetchBienes();
        } catch (error) {
            console.error('Error deleting bien:', error);
            alert('Error al eliminar el bien');
        }
    };

    const handleModalSave = () => {
        fetchBienes();
    };

    const getEstadoBadge = (estado: string) => {
        const badges = {
            ACTIVO: 'badge-success',
            INACTIVO: 'badge-warning',
            EN_REPARACION: 'badge-info',
            DESINCORPORADO: 'badge-danger',
        };
        return badges[estado as keyof typeof badges] || 'badge-info';
    };

    const getCondicionBadge = (condicion: string) => {
        const badges = {
            EXCELENTE: 'badge-success',
            BUENO: 'badge-info',
            REGULAR: 'badge-warning',
            MALO: 'badge-danger',
            OBSOLETO: 'badge-danger',
        };
        return badges[condicion as keyof typeof badges] || 'badge-info';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando bienes...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Bienes</h1>
                    <p className="text-gray-600 mt-1">Administra el inventario de bienes institucionales</p>
                </div>
                {isAdmin && (
                    <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Nuevo Bien
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Código, descripción, marca, modelo o serial..."
                                className="input flex-1"
                            />
                            <button onClick={handleSearch} className="btn btn-primary">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

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
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                            <option value="EN_REPARACION">En Reparación</option>
                            <option value="DESINCORPORADO">Desincorporado</option>
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
                                    Código
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Condición
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bienes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron bienes
                                    </td>
                                </tr>
                            ) : (
                                bienes.map((bien) => (
                                    <tr key={bien.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {bien.codigoInterno}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {bien.codigoSudebip}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{bien.descripcion}</div>
                                            {bien.marca && (
                                                <div className="text-xs text-gray-500">
                                                    {bien.marca} {bien.modelo}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getEstadoBadge(bien.estatusUso)}`}>
                                                {bien.estatusUso.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`badge ${getCondicionBadge(bien.condicionFisica)}`}>
                                                {bien.condicionFisica}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(bien)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(bien)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(bien)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                Mostrando {bienes.length} bien{bienes.length !== 1 ? 'es' : ''}
            </div>

            {/* Modal */}
            <BienModal
                bien={selectedBien}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
                mode={modalMode}
            />
        </div>
    );
};

export default Bienes;
