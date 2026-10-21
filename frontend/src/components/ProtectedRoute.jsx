import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from './Feedback';

// Wraps routes that need a logged in user (and optionally the admin role)
export default function ProtectedRoute({ adminOnly = false }) {
    const { user, checked } = useSelector((state) => state.auth);
    const location = useLocation();

    // Wait for /me before deciding, otherwise a refresh would bounce to login
    if (!checked) return <Loader />;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

    return <Outlet />;
}
