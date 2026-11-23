import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotificationListener from '../../notifications/components/NotificationListener';

export default function ProtectedRoute() {
    const user = useSelector((s) => s.auth.user);
    const initializing = useSelector((s) => s.auth.initializing);
    const location = useLocation();

    if (initializing) {
        return (
            <div className="auth-loading">
                Đang khôi phục phiên đăng nhập...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return (
        <>
            <NotificationListener />
            <Outlet />
        </>
    );
}
