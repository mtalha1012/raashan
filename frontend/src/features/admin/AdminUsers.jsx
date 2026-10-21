import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '@/features/ui/uiSlice';
import { dateTime } from '@/lib/format';
import { deleteUser, fetchAdminUsers, updateUserRole } from './adminSlice';

export default function AdminUsers() {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.admin.users);
    const me = useSelector((state) => state.auth.user._id);

    useEffect(() => {
        dispatch(fetchAdminUsers());
    }, [dispatch]);

    const run = async (action, message) => {
        try {
            await dispatch(action).unwrap();
            dispatch(showToast(message));
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
        }
    };

    return (
        <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
                <thead className="eyebrow text-left">
                    <tr className="border-b border-line">
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Joined</th>
                        <th className="p-3">Role</th>
                        <th className="p-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="p-3 font-semibold">{user.name}</td>
                            <td className="p-3 text-muted">{user.email}</td>
                            <td className="p-3 text-muted">{dateTime(user.createdAt)}</td>
                            <td className="p-3">
                                <select
                                    className="input py-1"
                                    value={user.role}
                                    disabled={user._id === me}
                                    onChange={(event) => run(updateUserRole({ id: user._id, role: event.target.value }), `${user.name} is now ${event.target.value === 'admin' ? 'an admin' : 'a customer'}`)}
                                    aria-label={`Role for ${user.name}`}
                                >
                                    <option value="user">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td className="p-3 text-right">
                                {user._id !== me && (
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm text-margin"
                                        onClick={() => window.confirm(`Delete ${user.name}'s account?`) && run(deleteUser(user._id), 'User deleted')}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
