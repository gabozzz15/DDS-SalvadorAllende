import React, { useEffect, useState } from 'react';
import { Package, ArrowRightLeft, Trash2, AlertTriangle, TrendingUp, Settings, BarChart3, Clock, CheckCircle } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import api from '../lib/api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [bienesRes, transRes, desincRes, alertasRes] = await Promise.all([
                    api.get('/bienes/statistics'),
                    api.get('/transferencias/statistics'),
                    api.get('/desincorporaciones/statistics'),
                    api.get('/alertas/statistics'),
                ]);

                setStats({
                    bienes: bienesRes.data,
                    transferencias: transRes.data,
                    desincorporaciones: desincRes.data,
                    alertas: alertasRes.data,
                });
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando estadísticas...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error al cargar estadísticas</div>
            </div>
        );
    }

    // KPI Definitions
    const kpiDefinitions = [
        {
            id: 'total_bienes',
            title: 'Total de Bienes',
            getValue: (s: any) => s.bienes?.total || 0,
            getSubtitle: (s: any) => `${s.bienes?.activos || 0} activos`,
            icon: Package,
            color: 'bg-blue-500',
        },
        {
            id: 'bienes_inactivos',
            title: 'Bienes Inactivos',
            getValue: (s: any) => s.bienes?.inactivos || 0,
            getSubtitle: (_: any) => 'Sin asignar',
            icon: Package,
            color: 'bg-gray-500',
        },
        {
            id: 'trans_pendientes',
            title: 'Transferencias Pendientes',
            getValue: (s: any) => s.transferencias?.pendientes || 0,
            getSubtitle: (s: any) => `${s.transferencias?.total || 0} total`,
            icon: ArrowRightLeft,
            color: 'bg-yellow-500',
        },
        {
            id: 'desinc_pendientes',
            title: 'Desincorp. Pendientes',
            getValue: (s: any) => s.desincorporaciones?.pendientes || 0,
            getSubtitle: (s: any) => `${s.desincorporaciones?.total || 0} total`,
            icon: Trash2,
            color: 'bg-red-500',
        },
        {
            id: 'alertas',
            title: 'Alertas No Leídas',
            getValue: (s: any) => s.alertas?.noLeidas || 0,
            getSubtitle: (s: any) => `${s.alertas?.total || 0} total`,
            icon: AlertTriangle,
            color: 'bg-orange-500',
        },
        {
            id: 'tasa_utilizacion',
            title: 'Tasa de Utilización',
            getValue: (s: any) => `${s.bienes?.total > 0 ? ((s.bienes.activos / s.bienes.total) * 100).toFixed(1) : 0}%`,
            getSubtitle: (_: any) => 'Bienes activos vs total',
            icon: TrendingUp,
            color: 'bg-green-500',
        },
        {
            id: 'tasa_aprobacion',
            title: 'Tasa de Aprobación',
            getValue: (s: any) => `${s.transferencias?.total > 0 ? (((s.transferencias.aprobadas + s.transferencias.ejecutadas) / s.transferencias.total) * 100).toFixed(1) : 0}%`,
            getSubtitle: (_: any) => 'Eficiencia en aprobaciones',
            icon: CheckCircle,
            color: 'bg-purple-500',
        },
        {
            id: 'tiempo_aprobacion',
            title: 'Tiempo Aprobación',
            getValue: (s: any) => s.desincorporaciones?.tiempoPromedioAprobacion ? (s.desincorporaciones.tiempoPromedioAprobacion / 3600).toFixed(1) : '0',
            getSubtitle: (_: any) => 'Horas promedio (Desincorp.)',
            icon: Clock,
            color: 'bg-amber-500',
        },
        {
            id: 'trans_temporales',
            title: 'Transf. Temporales Activas',
            getValue: (s: any) => s.transferencias?.temporalesActivas || 0,
            getSubtitle: (_: any) => 'Bienes en préstamo',
            icon: ArrowRightLeft,
            color: 'bg-teal-500',
        }
    ];

    // State for favorites
    const [favoriteKpis, setFavoriteKpis] = useState<string[]>(() => {
        const saved = localStorage.getItem('dashboard_favorite_kpis');
        return saved ? JSON.parse(saved) : ['total_bienes', 'trans_pendientes', 'desinc_pendientes', 'trans_temporales'];
    });

    const [favoriteCharts, setFavoriteCharts] = useState<string[]>(() => {
        const saved = localStorage.getItem('dashboard_favorite_charts');
        return saved ? JSON.parse(saved) : ['chart_estado', 'chart_procesos'];
    });

    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [showAllStats, setShowAllStats] = useState(false); // "Ver más" toggle

    useEffect(() => {
        localStorage.setItem('dashboard_favorite_kpis', JSON.stringify(favoriteKpis));
    }, [favoriteKpis]);

    useEffect(() => {
        localStorage.setItem('dashboard_favorite_charts', JSON.stringify(favoriteCharts));
    }, [favoriteCharts]);

    const toggleKpiFavorite = (id: string) => {
        setFavoriteKpis(prev => {
            if (prev.includes(id)) {
                if (prev.length <= 1) return prev; // Prevent empty
                return prev.filter(k => k !== id);
            } else {
                if (prev.length >= 4) return prev; // Max 4 for main view validation (UI enforces this)
                return [...prev, id];
            }
        });
    };

    const toggleChartFavorite = (id: string) => {
        setFavoriteCharts(prev => {
            if (prev.includes(id)) return prev.filter(c => c !== id);
            if (prev.length >= 2) return prev; // Max 2 rule
            return [...prev, id];
        });
    };

    // Chart Data Definitions

    // Chart data for Bienes por Estado (Doughnut Chart)
    const bienesEstadoChartData = {
        labels: ['Activos', 'Inactivos', 'En Reparación', 'Desincorporados'],
        datasets: [
            {
                label: 'Bienes',
                data: [
                    stats.bienes?.activos || 0,
                    stats.bienes?.inactivos || 0,
                    stats.bienes?.enReparacion || 0,
                    stats.bienes?.desincorporados || 0,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // green - activos
                    'rgba(156, 163, 175, 0.8)', // gray - inactivos
                    'rgba(59, 130, 246, 0.8)',  // blue - en reparación
                    'rgba(239, 68, 68, 0.8)',   // red - desincorporados
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(156, 163, 175, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart data for Bienes por Origen (Pie Chart)
    const origenChartData = {
        labels: stats.bienes?.porOrigen?.map((item: any) => item.origen || 'Sin especificar') || [],
        datasets: [
            {
                label: 'Bienes por Origen',
                data: stats.bienes?.porOrigen?.map((item: any) => parseInt(item.cantidad)) || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(16, 185, 129, 0.8)',  // green
                    'rgba(249, 115, 22, 0.8)',  // orange
                    'rgba(168, 85, 247, 0.8)',  // purple
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(168, 85, 247, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Chart data for Transferencias y Desincorporaciones (Bar Chart)
    const procesosChartData = {
        labels: ['Pendientes', 'Aprobadas', 'Ejecutadas'],
        datasets: [
            {
                label: 'Transferencias',
                data: [
                    stats.transferencias?.pendientes || 0,
                    stats.transferencias?.aprobadas || 0,
                    stats.transferencias?.ejecutadas || 0,
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
            {
                label: 'Desincorporaciones',
                data: [
                    stats.desincorporaciones?.pendientes || 0,
                    stats.desincorporaciones?.aprobadas || 0,
                    stats.desincorporaciones?.ejecutadas || 0,
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    const chartDefinitions = [
        {
            id: 'chart_estado',
            title: 'Estado de Bienes',
            component: <Doughnut data={bienesEstadoChartData} options={chartOptions} />
        },
        {
            id: 'chart_procesos',
            title: 'Transferencias vs Desincorporaciones',
            component: <Bar data={procesosChartData} options={chartOptions} />
        },
        {
            id: 'chart_origen',
            title: 'Origen de Bienes',
            component: <Pie data={origenChartData} options={chartOptions} />
        }
    ];

    // Filter helpers
    const mainKpis = kpiDefinitions.filter(k => favoriteKpis.includes(k.id));
    const otherKpis = kpiDefinitions.filter(k => !favoriteKpis.includes(k.id));

    const mainCharts = chartDefinitions.filter(c => favoriteCharts.includes(c.id));
    const otherCharts = chartDefinitions.filter(c => !favoriteCharts.includes(c.id));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Resumen ejecutivo e indicadores clave de desempeño (KPI)</p>
                </div>
                <button
                    onClick={() => setIsConfigOpen(true)}
                    className="btn btn-outline flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Personalizar
                </button>
            </div>

            {/* KPI Grid - Favorites */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Indicadores Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mainKpis.map((kpi) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={kpi.id} className="card hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.getValue(stats)}</p>
                                        <p className="text-xs text-gray-400 mt-1">{kpi.getSubtitle(stats)}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${kpi.color} bg-opacity-10`}>
                                        <Icon className={`w-6 h-6 ${kpi.color.replace('bg-', 'text-')}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Charts Grid - Favorites */}
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Gráficas Principales</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {mainCharts.map((chart) => (
                        <div key={chart.id} className="card h-80 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{chart.title}</h3>
                            <div className="flex-1 relative">
                                {chart.component}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Collapsible Section */}
            {(otherKpis.length > 0 || otherCharts.length > 0) && (
                <div className="border-t border-gray-200 pt-8">
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowAllStats(!showAllStats)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            {showAllStats ? 'Ocultar detalles adicionales' : 'Ver más indicadores y gráficas'}
                            <TrendingUp className={`w-4 h-4 transition-transform ${showAllStats ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showAllStats && (
                        <div className="mt-8 space-y-8 animate-fade-in-down">
                            {otherKpis.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {otherKpis.map((kpi) => {
                                        const Icon = kpi.icon;
                                        return (
                                            <div key={kpi.id} className="card bg-gray-50 border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                                        <p className="text-xl font-semibold text-gray-700 mt-1">{kpi.getValue(stats)}</p>
                                                    </div>
                                                    <Icon className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {otherCharts.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {otherCharts.map((chart) => (
                                        <div key={chart.id} className="card h-64">
                                            <h3 className="text-md font-medium text-gray-700 mb-2">{chart.title}</h3>
                                            <div className="h-full pb-6">
                                                {chart.component}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Configuration Modal */}
            {isConfigOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Personalizar Dashboard</h2>
                                <p className="text-sm text-gray-500">Selecciona los elementos que deseas ver destacados</p>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Cerrar</span>
                                <Settings className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            {/* KPI Selection */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-blue-500" />
                                    Indicadores (Máx. 4)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {kpiDefinitions.map(kpi => (
                                        <label key={kpi.id} className={`
                                            flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                            ${favoriteKpis.includes(kpi.id)
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:bg-gray-50'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary mr-3"
                                                checked={favoriteKpis.includes(kpi.id)}
                                                onChange={() => {
                                                    if (!favoriteKpis.includes(kpi.id) && favoriteKpis.length >= 4) {
                                                        // Prevent adding more than 4
                                                        return;
                                                    }
                                                    toggleKpiFavorite(kpi.id);
                                                }}
                                                disabled={!favoriteKpis.includes(kpi.id) && favoriteKpis.length >= 4}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{kpi.title}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                    {favoriteKpis.length}/4 seleccionados
                                </p>
                            </section>

                            {/* Chart Selection */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-purple-500" />
                                    Gráficas (Máx. 2)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {chartDefinitions.map(chart => (
                                        <label key={chart.id} className={`
                                            flex items-center p-3 rounded-lg border cursor-pointer transition-all
                                            ${favoriteCharts.includes(chart.id)
                                                ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                                                : 'border-gray-200 hover:bg-gray-50'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-secondary mr-3"
                                                checked={favoriteCharts.includes(chart.id)}
                                                onChange={() => {
                                                    if (!favoriteCharts.includes(chart.id) && favoriteCharts.length >= 2) return;
                                                    toggleChartFavorite(chart.id);
                                                }}
                                                disabled={!favoriteCharts.includes(chart.id) && favoriteCharts.length >= 2}
                                            />
                                            <span className="text-sm font-medium text-gray-700">{chart.title}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">
                                    {favoriteCharts.length}/2 seleccionados
                                </p>
                            </section>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsConfigOpen(false)}
                                className="btn btn-primary"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
