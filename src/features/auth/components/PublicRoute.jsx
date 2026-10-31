import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PublicRoute() {
    const user = useSelector((s) => s.auth.user);
    const location = useLocation();
    return user ? <Navigate to={location.state?.from?.pathname || '/'} replace /> : <Outlet />;
}