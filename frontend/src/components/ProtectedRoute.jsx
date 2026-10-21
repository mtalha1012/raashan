import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from './Feedback';

export default function ProtectedRoute({ adminOnly = false }) {
    const { user, checked } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!checked) return <Loader />;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

    return <Outlet />;
}
