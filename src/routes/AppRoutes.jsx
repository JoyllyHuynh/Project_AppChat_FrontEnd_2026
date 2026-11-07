
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import FriendPage from "../features/user/pages/FriendPage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import PublicRoute from "../features/auth/components/PublicRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

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
                <Route path="/friends" element={<FriendPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
    );
}

export default AppRoutes;
