import React, { useEffect, useState } from 'react';
import { Package, ArrowRightLeft, Trash2, AlertTriangle, TrendingUp } from 'lucide-react';
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

    // Calcular KPIs adicionales
    const tasaUtilizacion = stats.bienes?.total > 0
        ? ((stats.bienes.activos / stats.bienes.total) * 100).toFixed(1)
        : 0;

    const tasaDesincorporacion = stats.bienes?.total > 0
        ? ((stats.bienes.desincorporados / stats.bienes.total) * 100).toFixed(1)
        : 0;

    const tasaAprobacionTransferencias = stats.transferencias?.total > 0
        ? (((stats.transferencias.aprobadas + stats.transferencias.ejecutadas) / stats.transferencias.total) * 100).toFixed(1)
        : 0;

    const cards = [
        {
            title: 'Total de Bienes',
            value: stats.bienes?.total || 0,
            subtitle: `${stats.bienes?.activos || 0} activos`,
            icon: Package,
            color: 'bg-blue-500',
        },
        {
            title: 'Bienes Inactivos',
            value: stats.bienes?.inactivos || 0,
            subtitle: 'Sin asignar',
            icon: Package,
            color: 'bg-gray-500',
        },
        {
            title: 'Transferencias Pendientes',
            value: stats.transferencias?.pendientes || 0,
            subtitle: `${stats.transferencias?.total || 0} total`,
            icon: ArrowRightLeft,
            color: 'bg-yellow-500',
        },
        {
            title: 'Desincorporaciones Pendientes',
            value: stats.desincorporaciones?.pendientes || 0,
            subtitle: `${stats.desincorporaciones?.total || 0} total`,
            icon: Trash2,
            color: 'bg-red-500',
        },
        {
            title: 'Alertas No Leídas',
            value: stats.alertas?.noLeidas || 0,
            subtitle: `${stats.alertas?.total || 0} total`,
            icon: AlertTriangle,
            color: 'bg-orange-500',
        },
        {
            title: 'Tasa de Utilización',
            value: `${tasaUtilizacion}%`,
            subtitle: 'Bienes activos vs total',
            icon: TrendingUp,
            color: 'bg-green-500',
        },
    ];

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
                borderWidth: 2,
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
                borderWidth: 2,
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
                borderWidth: 2,
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
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    const barChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Resumen general del sistema - Indicadores de Gestión SUDEBIP</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className="card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                                    <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                                </div>
                                <div className={`${card.color} p-3 rounded-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* KPIs de Tiempo - Indicadores de Gestión */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">⏱️ Tiempo Promedio de Registro</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-blue-700">
                            {stats.bienes?.tiempoPromedioRegistro ? (stats.bienes.tiempoPromedioRegistro / 60).toFixed(1) : '0'}
                        </span>
                        <span className="text-blue-600 mb-1">minutos</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">KPI: Eficiencia en registro de bienes</p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700">
                            Meta SUDEBIP: &lt; 5 minutos por bien
                        </p>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Tiempo Promedio de Aprobación</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-green-700">
                            {stats.transferencias?.tiempoPromedioAprobacion ? (stats.transferencias.tiempoPromedioAprobacion / 3600).toFixed(1) : '0'}
                        </span>
                        <span className="text-green-600 mb-1">horas</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">KPI: Agilidad en procesos de transferencia</p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs text-green-700">
                            Meta SUDEBIP: &lt; 48 horas
                        </p>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">📊 Tasa de Aprobación</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-purple-700">
                            {tasaAprobacionTransferencias}%
                        </span>
                    </div>
                    <p className="text-sm text-purple-600 mt-2">KPI: Eficiencia en aprobaciones</p>
                    <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs text-purple-700">
                            Meta: &gt; 85% de aprobación
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Doughnut Chart - Bienes por Estado */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📊 Distribución por Estatus de Uso</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={bienesEstadoChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Pie Chart - Bienes por Origen */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">🏷️ Distribución por Tipo de Origen</h3>
                    <div className="h-64 flex items-center justify-center">
                        {stats.bienes?.porOrigen && stats.bienes.porOrigen.length > 0 ? (
                            <Pie data={origenChartData} options={chartOptions} />
                        ) : (
                            <div className="text-gray-400 text-sm">Sin datos disponibles</div>
                        )}
                    </div>
                </div>

                {/* Bar Chart - Procesos */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📈 Transferencias y Desincorporaciones</h3>
                    <div className="h-64">
                        <Bar data={procesosChartData} options={barChartOptions} />
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bienes por Estado */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📦 Bienes por Estatus de Uso</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Activos</span>
                            <span className="badge badge-success">{stats.bienes?.activos || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Inactivos (Sin asignar)</span>
                            <span className="badge" style={{ backgroundColor: '#9CA3AF', color: 'white' }}>{stats.bienes?.inactivos || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">En Reparación</span>
                            <span className="badge badge-info">{stats.bienes?.enReparacion || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Desincorporados</span>
                            <span className="badge badge-error">{stats.bienes?.desincorporados || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center font-semibold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{stats.bienes?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs Adicionales */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">📈 KPIs de Gestión SUDEBIP</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-green-900">Tasa de Utilización</span>
                                <span className="text-2xl font-bold text-green-700">{tasaUtilizacion}%</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${tasaUtilizacion}%` }}></div>
                            </div>
                            <p className="text-xs text-green-600 mt-1">Bienes activos / Total de bienes</p>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-red-900">Tasa de Desincorporación</span>
                                <span className="text-2xl font-bold text-red-700">{tasaDesincorporacion}%</span>
                            </div>
                            <div className="w-full bg-red-200 rounded-full h-2">
                                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${tasaDesincorporacion}%` }}></div>
                            </div>
                            <p className="text-xs text-red-600 mt-1">Bienes desincorporados / Total</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-blue-900">Bienes en Proceso</span>
                                <span className="text-2xl font-bold text-blue-700">
                                    {(stats.transferencias?.pendientes || 0) + (stats.desincorporaciones?.pendientes || 0)}
                                </span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">Transferencias + Desincorporaciones pendientes</p>
                        </div>
                    </div>
                </div>

                {/* Transferencias */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">🔄 Estado de Transferencias</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pendientes</span>
                            <span className="badge badge-warning">{stats.transferencias?.pendientes || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Aprobadas</span>
                            <span className="badge badge-success">{stats.transferencias?.aprobadas || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ejecutadas</span>
                            <span className="badge badge-info">{stats.transferencias?.ejecutadas || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center font-semibold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{stats.transferencias?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desincorporaciones */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">🗑️ Estado de Desincorporaciones</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pendientes</span>
                            <span className="badge badge-warning">{stats.desincorporaciones?.pendientes || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Aprobadas</span>
                            <span className="badge badge-success">{stats.desincorporaciones?.aprobadas || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ejecutadas</span>
                            <span className="badge badge-info">{stats.desincorporaciones?.ejecutadas || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center font-semibold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{stats.desincorporaciones?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
