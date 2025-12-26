import React, { useState, useEffect } from 'react';
import { X, Calendar, User, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import api from '../lib/api';
import DiffView from './DiffView';

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

interface EntityHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    entidad: string;
    entidadId: number;
    entityName?: string;
}

const EntityHistoryModal: React.FC<EntityHistoryModalProps> = ({
    isOpen,
    onClose,
    entidad,
    entidadId,
    entityName,
}) => {
    const [history, setHistory] = useState<LogAuditoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, entidad, entidadId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/auditoria/entity/${entidad}/${entidadId}/history`);
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching entity history:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedItems(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-VE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAccionColor = (accion: string) => {
        switch (accion.toUpperCase()) {
            case 'CREATE':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'UPDATE':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'DELETE':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getBeforeData = (log: LogAuditoria, index: number) => {
        if (log.accion === 'CREATE') return null;
        if (index === 0) return null; // Primer registro

        // Para UPDATE, buscar el estado anterior en el log previo
        const previousLog = history[index - 1];
        if (previousLog && previousLog.accion !== 'DELETE') {
            return previousLog.detalles;
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Historial de Cambios
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {entityName || `${entidad} #${entidadId}`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Cargando historial...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">No hay historial disponible</p>
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                {/* Timeline items */}
                                <div className="space-y-6">
                                    {history.map((log, index) => (
                                        <div key={log.id} className="relative pl-10">
                                            {/* Timeline dot */}
                                            <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${log.accion === 'CREATE' ? 'bg-emerald-500' :
                                                    log.accion === 'UPDATE' ? 'bg-blue-500' :
                                                        'bg-red-500'
                                                }`}></div>

                                            {/* Event card */}
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded border ${getAccionColor(log.accion)}`}>
                                                                    {log.accion}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    #{log.id}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{formatDate(log.createdAt)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    <span>{log.user?.nombreCompleto || 'Usuario desconocido'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleExpand(log.id)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            {expandedItems.has(log.id) ? (
                                                                <ChevronUp className="w-5 h-5" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Expanded details */}
                                                    {expandedItems.has(log.id) && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <DiffView
                                                                before={getBeforeData(log, index)}
                                                                after={log.detalles}
                                                                accion={log.accion}
                                                            />
                                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                                                    <div>
                                                                        <span className="font-medium">IP:</span> {log.ipAddress}
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <span className="font-medium">User Agent:</span> {log.userAgent}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Total de eventos: <span className="font-semibold">{history.length}</span>
                            </p>
                            <button
                                onClick={onClose}
                                className="btn btn-secondary"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntityHistoryModal;
