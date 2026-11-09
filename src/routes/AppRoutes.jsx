
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import SidebarLayout from "../components/layout/SidebarLayout";
import FriendPage from "../features/user/pages/FriendPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import PublicRoute from "../features/auth/components/PublicRoute";
import FriendList from "../features/user/components/FriendList";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import ProfilePage from "../features/profile/pages/ProfilePage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />

            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/chat" element={<MainLayout />} />
                <Route element={<SidebarLayout />}>
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route path="/friends" element={<FriendPage />}>
                    <Route index element={<Navigate to="/friends/list" replace />} />
                    <Route path="list" element={<FriendList />} />
                    <Route path="groups" element={<div style={{ flex: 1, padding: '24px' }}><h2>Danh sách nhóm và cộng đồng</h2></div>} />
                    <Route path="requests" element={<div style={{ flex: 1, padding: '24px' }}><h2>Lời mời kết bạn</h2></div>} />
                    <Route path="invites" element={<div style={{ flex: 1, padding: '24px' }}><h2>Lời mời vào nhóm và cộng đồng</h2></div>} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
    );
}

export default AppRoutes;
