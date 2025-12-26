import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Shield, User as UserIcon } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface User {
    id: number;
    username: string;
    nombreCompleto: string;
    email: string;
    role: 'ADMIN' | 'USER';
    activo: boolean;
}

const Usuarios = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        nombreCompleto: '',
        email: '',
        password: '',
        role: 'USER',
        activo: true,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData({
            username: '',
            nombreCompleto: '',
            email: '',
            password: '',
            role: 'USER' as any,
            activo: true,
        });
        setModalMode('create');
        setModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            nombreCompleto: user.nombreCompleto,
            email: user.email,
            password: '', // Password empty on edit unless changing
            role: user.role,
            activo: user.activo,
        });
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (id === currentUser?.id) {
            Swal.fire('Acción no permitida', 'No puedes eliminar tu propio usuario', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: '¿Eliminar usuario?',
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
                await api.delete(`/users/${id}`);
                fetchUsers();
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
            } catch (error: any) {
                console.error('Error deleting user:', error);
                Swal.fire('Error', error.response?.data?.message || 'Error al eliminar el usuario', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                username: formData.username,
                nombreCompleto: formData.nombreCompleto,
                email: formData.email,
                role: formData.role,
                activo: formData.activo,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (modalMode === 'create') {
                if (!formData.password) {
                    Swal.fire('Error', 'La contraseña es obligatoria para nuevos usuarios', 'error');
                    return;
                }
                await api.post('/users', payload);
                Swal.fire('Creado', 'Usuario creado exitosamente', 'success');
            } else if (modalMode === 'edit' && selectedUser) {
                await api.patch(`/users/${selectedUser.id}`, payload);
                Swal.fire('Actualizado', 'Usuario actualizado exitosamente', 'success');
            }

            setModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar el usuario', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra el acceso al sistema</p>
                </div>
                <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                                {user.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.nombreCompleto}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${user.activo ? 'badge-success' : 'badge-danger'}`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">
                                {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombreCompleto}
                                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña {modalMode === 'edit' && '(Dejar en blanco para no cambiar)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                    required={modalMode === 'create'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="input"
                                >
                                    <option value="USER">Usuario</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                    Usuario Activo
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'create' ? 'Crear' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
