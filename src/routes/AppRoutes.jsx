import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import { FriendList } from "../features/user/components/FriendList";

function LoginPage() {
    return <h1>Login Page</h1>;
}

function RegisterPage() {
    return <h1>Register Page</h1>;
}
function FriendPage() {
    return (
        <div className="flex h-screen bg-gray-50">
            <FriendList />
            <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Khu vực nội dung danh sách bạn bè</p>
            </div>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route path="/chat" element={<MainLayout />} />

            <Route path="/friends" element={<FriendPage />} />
        </Routes>
    );
}


export default AppRoutes;