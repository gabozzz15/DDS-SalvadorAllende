import React from 'react';
import { Plus, Minus, Edit } from 'lucide-react';

interface DiffViewProps {
    before: any;
    after: any;
    accion: string;
}

interface DiffResult {
    field: string;
    type: 'added' | 'removed' | 'modified' | 'unchanged';
    before: any;
    after: any;
}

const DiffView: React.FC<DiffViewProps> = ({ before, after, accion }) => {
    const calculateDiff = (): DiffResult[] => {
        // Para CREATE, solo mostrar los valores nuevos
        if (accion === 'CREATE') {
            return Object.keys(after || {}).map(key => ({
                field: key,
                type: 'added' as const,
                before: null,
                after: after[key],
            }));
        }

        // Para DELETE, solo mostrar los valores eliminados
        if (accion === 'DELETE') {
            return Object.keys(before || {}).map(key => ({
                field: key,
                type: 'removed' as const,
                before: before[key],
                after: null,
            }));
        }

        // Para UPDATE, comparar before y after
        const allKeys = new Set([
            ...Object.keys(before || {}),
            ...Object.keys(after || {})
        ]);

        const diffs: DiffResult[] = [];

        for (const key of allKeys) {
            const beforeValue = before?.[key];
            const afterValue = after?.[key];

            if (beforeValue === undefined && afterValue !== undefined) {
                diffs.push({ field: key, type: 'added', before: null, after: afterValue });
            } else if (beforeValue !== undefined && afterValue === undefined) {
                diffs.push({ field: key, type: 'removed', before: beforeValue, after: null });
            } else if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
                diffs.push({ field: key, type: 'modified', before: beforeValue, after: afterValue });
            } else {
                diffs.push({ field: key, type: 'unchanged', before: beforeValue, after: afterValue });
            }
        }

        return diffs;
    };

    const diffs = calculateDiff();

    const getTypeStyles = (type: DiffResult['type']) => {
        switch (type) {
            case 'added':
                return 'bg-green-50 border-green-300 text-green-900';
            case 'removed':
                return 'bg-red-50 border-red-300 text-red-900';
            case 'modified':
                return 'bg-yellow-50 border-yellow-300 text-yellow-900';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    const getTypeIcon = (type: DiffResult['type']) => {
        switch (type) {
            case 'added':
                return <Plus className="w-4 h-4 text-green-600" />;
            case 'removed':
                return <Minus className="w-4 h-4 text-red-600" />;
            case 'modified':
                return <Edit className="w-4 h-4 text-yellow-600" />;
            default:
                return null;
        }
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-sm text-gray-700">Comparación de Cambios</h4>
                <span className={`px-2 py-1 text-xs rounded ${accion === 'CREATE' ? 'bg-green-100 text-green-800' :
                    accion === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {accion}
                </span>
            </div>

            {accion === 'CREATE' || accion === 'DELETE' ? (
                // Vista simple para CREATE/DELETE
                <div className="space-y-2">
                    {diffs.map((diff, index) => (
                        <div key={index} className={`p-3 rounded border ${getTypeStyles(diff.type)}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(diff.type)}
                                <span className="font-medium text-sm">{diff.field}</span>
                            </div>
                            <div className="text-sm font-mono">
                                {formatValue(diff.after || diff.before)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Vista lado a lado para UPDATE
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Antes</h5>
                        <div className="space-y-2">
                            {diffs.map((diff, index) => (
                                <div key={index} className={`p-2 rounded border ${getTypeStyles(diff.type)}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {diff.type !== 'added' && getTypeIcon(diff.type)}
                                        <span className="font-medium text-xs">{diff.field}</span>
                                    </div>
                                    <div className="text-xs font-mono break-all">
                                        {diff.type === 'added' ? '-' : formatValue(diff.before)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Después</h5>
                        <div className="space-y-2">
                            {diffs.map((diff, index) => (
                                <div key={index} className={`p-2 rounded border ${getTypeStyles(diff.type)}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {diff.type !== 'removed' && getTypeIcon(diff.type)}
                                        <span className="font-medium text-xs">{diff.field}</span>
                                    </div>
                                    <div className="text-xs font-mono break-all">
                                        {diff.type === 'removed' ? '-' : formatValue(diff.after)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Leyenda */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1 text-xs">
                    <Plus className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600">Agregado</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <Minus className="w-3 h-3 text-red-600" />
                    <span className="text-gray-600">Eliminado</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <Edit className="w-3 h-3 text-yellow-600" />
                    <span className="text-gray-600">Modificado</span>
                </div>
            </div>
        </div>
    );
};

export default DiffView;
