import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import Swal from 'sweetalert2';

interface Alerta {
    id: number;
    tipo: string;
    severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    titulo: string;
    descripcion: string;
    leida: boolean;
    fechaCreacion: string;
    bienId?: number;
    bien?: {
        codigoInterno: string;
        descripcion: string;
    };
}

const Alertas = () => {
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    useEffect(() => {
        fetchAlertas();
    }, [filter]);

    const fetchAlertas = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter === 'unread') params.append('leida', 'false');
            if (filter === 'read') params.append('leida', 'true');

            const response = await api.get(`/alertas?${params.toString()}`);
            setAlertas(response.data);
        } catch (error) {
            console.error('Error fetching alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.patch(`/alertas/${id}/read`);
            // Update local state to reflect change immediately
            setAlertas(alertas.map(a => a.id === id ? { ...a, leida: true } : a));
        } catch (error) {
            console.error('Error marking alerta as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/alertas/mark-all-read');
            fetchAlertas();
            Swal.fire({
                title: 'Alertas actualizadas',
                text: 'Todas las alertas han sido marcadas como leídas',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar alerta?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/alertas/${id}`);
                setAlertas(alertas.filter(a => a.id !== id));
                Swal.fire({
                    title: 'Eliminada',
                    text: 'La alerta ha sido eliminada',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } catch (error) {
                console.error('Error deleting alerta:', error);
                Swal.fire('Error', 'No se pudo eliminar la alerta', 'error');
            }
        }
    };

    const getSeveridadIcon = (severidad: string) => {
        switch (severidad) {
            case 'CRITICA':
            case 'ALTA':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case 'MEDIA':
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            case 'BAJA':
            default:
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getSeveridadClass = (severidad: string) => {
        switch (severidad) {
            case 'CRITICA': return 'bg-red-50 border-red-200';
            case 'ALTA': return 'bg-orange-50 border-orange-200';
            case 'MEDIA': return 'bg-yellow-50 border-yellow-200';
            case 'BAJA': return 'bg-blue-50 border-blue-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando alertas...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
                    <p className="text-gray-600 mt-1">Notificaciones y avisos del sistema</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Marcar todas como leídas
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    No leídas
                </button>
                <button
                    onClick={() => setFilter('read')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'read' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Leídas
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {alertas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay alertas para mostrar</p>
                    </div>
                ) : (
                    alertas.map((alerta) => (
                        <div
                            key={alerta.id}
                            className={`p-4 rounded-lg border ${getSeveridadClass(alerta.severidad)} ${!alerta.leida ? 'shadow-sm ring-1 ring-blue-200' : ''
                                } transition-all duration-200`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {getSeveridadIcon(alerta.severidad)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-lg font-medium ${!alerta.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {alerta.titulo}
                                        </h3>
                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                            {new Date(alerta.fechaCreacion).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-gray-600">
                                        {alerta.descripcion}
                                    </p>
                                    {alerta.bien && (
                                        <div className="mt-2 text-sm text-gray-500 bg-white bg-opacity-50 p-2 rounded inline-block">
                                            Bien relacionado: <span className="font-medium">{alerta.bien.codigoInterno}</span> - {alerta.bien.descripcion}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {!alerta.leida && (
                                        <button
                                            onClick={() => handleMarkAsRead(alerta.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                            title="Marcar como leída"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(alerta.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Alertas;
