import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PublicRoute() {
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

    return user
        ? <Navigate to={location.state?.from?.pathname || '/chat'} replace />
        : <Outlet />;
}
