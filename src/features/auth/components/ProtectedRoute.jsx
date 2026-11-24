import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotificationListener from '../../notifications/components/NotificationListener';
import ConnectionBanner from '../../../components/common/ConnectionBanner';

export default function ProtectedRoute() {
    const user = useSelector((s) => s.auth.user);
    const location = useLocation();

    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

    return (
        <>
            <NotificationListener />
            <ConnectionBanner />
            <Outlet />
        </>
    );
}
