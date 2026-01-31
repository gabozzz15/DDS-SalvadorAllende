import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bienes from './pages/Bienes';
import Transferencias from './pages/Transferencias';
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
                                        <div className="text-center text-gray-500 py-12">
                                            Módulo de Desincorporaciones (En desarrollo)
                                        </div>
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
                                        <div className="text-center text-gray-500 py-12">
                                            Módulo de Usuarios (En desarrollo)
                                        </div>
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
