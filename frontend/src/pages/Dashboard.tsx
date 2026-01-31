import React, { useEffect, useState } from 'react';
import { Package, ArrowRightLeft, Trash2, AlertTriangle } from 'lucide-react';
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
import { Bar, Pie } from 'react-chartjs-2';
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

interface Stats {
    bienes: {
        total: number;
        porEstado: {
            activos: number;
            inactivos: number;
            enReparacion: number;
            desincorporados: number;
        };
    };
    transferencias: {
        total: number;
        porEstado: {
            pendientes: number;
            aprobadas: number;
            ejecutadas: number;
            rechazadas: number;
        };
    };
    desincorporaciones: {
        total: number;
        porEstado: {
            pendientes: number;
            aprobadas: number;
            ejecutadas: number;
            rechazadas: number;
        };
    };
    alertas: {
        total: number;
        noLeidas: number;
    };
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const results = await Promise.allSettled([
                    api.get('/bienes/statistics'),
                    api.get('/transferencias/statistics').catch(() => ({ data: { total: 0, porEstado: { pendientes: 0, aprobadas: 0, ejecutadas: 0, rechazadas: 0 } } })),
                    api.get('/desincorporaciones/statistics').catch(() => ({ data: { total: 0, porEstado: { pendientes: 0, aprobadas: 0, ejecutadas: 0, rechazadas: 0 } } })),
                    api.get('/alertas/statistics').catch(() => ({ data: { total: 0, noLeidas: 0 } })),
                ]);

                setStats({
                    bienes: results[0].status === 'fulfilled' ? results[0].value.data : { total: 0, porEstado: { activos: 0, inactivos: 0, enReparacion: 0, desincorporados: 0 } },
                    transferencias: results[1].status === 'fulfilled' ? results[1].value.data : { total: 0, porEstado: { pendientes: 0, aprobadas: 0, ejecutadas: 0, rechazadas: 0 } },
                    desincorporaciones: results[2].status === 'fulfilled' ? results[2].value.data : { total: 0, porEstado: { pendientes: 0, aprobadas: 0, ejecutadas: 0, rechazadas: 0 } },
                    alertas: results[3].status === 'fulfilled' ? results[3].value.data : { total: 0, noLeidas: 0 },
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

    const cards = [
        {
            title: 'Total de Bienes',
            value: stats.bienes.total,
            subtitle: `${stats.bienes.porEstado.activos} activos`,
            icon: Package,
            color: 'bg-blue-500',
        },
        {
            title: 'Transferencias Pendientes',
            value: stats.transferencias.porEstado.pendientes,
            subtitle: `${stats.transferencias.total} total`,
            icon: ArrowRightLeft,
            color: 'bg-yellow-500',
        },
        {
            title: 'Desincorporaciones Pendientes',
            value: stats.desincorporaciones.porEstado.pendientes,
            subtitle: `${stats.desincorporaciones.total} total`,
            icon: Trash2,
            color: 'bg-red-500',
        },
        {
            title: 'Alertas No Leídas',
            value: stats.alertas.noLeidas,
            subtitle: `${stats.alertas.total} total`,
            icon: AlertTriangle,
            color: 'bg-orange-500',
        },
    ];

    // Chart data for Bienes por Estado (Pie Chart)
    const bienesChartData = {
        labels: ['Activos', 'Inactivos', 'En Reparación', 'Desincorporados'],
        datasets: [
            {
                label: 'Bienes',
                data: [
                    stats.bienes.porEstado.activos,
                    stats.bienes.porEstado.inactivos,
                    stats.bienes.porEstado.enReparacion,
                    stats.bienes.porEstado.desincorporados,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // green
                    'rgba(251, 191, 36, 0.8)',  // yellow
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(239, 68, 68, 0.8)',   // red
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Chart data for Transferencias y Desincorporaciones (Bar Chart)
    const procesosChartData = {
        labels: ['Pendientes', 'Aprobadas', 'Ejecutadas', 'Rechazadas'],
        datasets: [
            {
                label: 'Transferencias',
                data: [
                    stats.transferencias.porEstado.pendientes,
                    stats.transferencias.porEstado.aprobadas,
                    stats.transferencias.porEstado.ejecutadas,
                    stats.transferencias.porEstado.rechazadas,
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
            },
            {
                label: 'Desincorporaciones',
                data: [
                    stats.desincorporaciones.porEstado.pendientes,
                    stats.desincorporaciones.porEstado.aprobadas,
                    stats.desincorporaciones.porEstado.ejecutadas,
                    stats.desincorporaciones.porEstado.rechazadas,
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
                <p className="text-gray-600 mt-1">Resumen general del sistema</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart - Bienes por Estado */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Distribución de Bienes por Estado</h3>
                    <div className="h-80 flex items-center justify-center">
                        <Pie data={bienesChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Bar Chart - Procesos */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Transferencias y Desincorporaciones</h3>
                    <div className="h-80">
                        <Bar data={procesosChartData} options={barChartOptions} />
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bienes por Estado */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Bienes por Estado</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Activos</span>
                            <span className="badge badge-success">{stats.bienes.porEstado.activos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Inactivos</span>
                            <span className="badge badge-warning">{stats.bienes.porEstado.inactivos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">En Reparación</span>
                            <span className="badge badge-info">{stats.bienes.porEstado.enReparacion}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Desincorporados</span>
                            <span className="badge badge-danger">{stats.bienes.porEstado.desincorporados}</span>
                        </div>
                    </div>
                </div>

                {/* Transferencias por Estado */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Transferencias por Estado</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pendientes</span>
                            <span className="badge badge-warning">{stats.transferencias.porEstado.pendientes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Aprobadas</span>
                            <span className="badge badge-info">{stats.transferencias.porEstado.aprobadas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Ejecutadas</span>
                            <span className="badge badge-success">{stats.transferencias.porEstado.ejecutadas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Rechazadas</span>
                            <span className="badge badge-danger">{stats.transferencias.porEstado.rechazadas}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
