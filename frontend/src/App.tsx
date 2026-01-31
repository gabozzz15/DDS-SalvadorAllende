import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bienes from './pages/Bienes';
import Transferencias from './pages/Transferencias';
import Desincorporaciones from './pages/Desincorporaciones';
import Responsables from './pages/Responsables';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Auditoria from './pages/Auditoria';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <Layout>
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/bienes"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Bienes />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/transferencias"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Transferencias />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/desincorporaciones"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Desincorporaciones />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/asignaciones"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Asignaciones />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
<<<<<<< HEAD
                            path="/asignaciones"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Asignaciones />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
=======
>>>>>>> ca424ea38c59b96b95880a6defa06896a7349021
                            path="/responsables"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Responsables />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/alertas"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <div className="text-center text-gray-500 py-12">
                                            Módulo de Alertas (En desarrollo)
                                        </div>
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/usuarios"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <Layout>
                                        <Usuarios />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/reportes"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <Layout>
                                        <Reportes />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/auditoria"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <Layout>
                                        <Auditoria />
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/bienes" replace />} />
                        <Route path="*" element={<Navigate to="/bienes" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
