import { useEffect } from "react";
import {
    MessageCircle,
    Users,
    UsersRound,
    Bell,
    Settings,
    LogOut,
    Hexagon,
    Sun,
    Moon,
} from "lucide-react";

import {useDispatch, useSelector} from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../store/authSlice";
import Avatar from "../common/Avatar";
import { fetchNotifications, selectUnreadCount, } from "../../features/notifications/notificationSlice";

function Sidebar({ theme, onToggleTheme }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const unreadCount = useSelector(selectUnreadCount);
    const notificationStatus = useSelector((state) => state.notifications.status);

    const isChatPage = location.pathname.startsWith("/chat");
    const isFriendsPage = location.pathname.startsWith("/friends");
    const isNotificationsPage = location.pathname.startsWith("/notifications");
    const isProfilePage = location.pathname.startsWith("/profile");

    useEffect(() => {
        if (notificationStatus === "idle") {
            dispatch(fetchNotifications());
        }
    }, [notificationStatus, dispatch]);

    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Hexagon size={25} />
                </div>
            </div>

            <nav className="sidebar-nav">

                <button
                    className={`nav-item ${isChatPage ? "active" : ""}`}
                    title="Messages"
                    onClick={() => navigate("/chat")}
                >
                    <MessageCircle size={22} />
                </button>

                <button
                    className={`nav-item ${isFriendsPage ? "active" : ""}`}
                    title="Contacts"
                    onClick={() => navigate("/friends")}
                >
                    <Users size={22} />
                </button>


                <button className="nav-item" title="Groups">
                    <UsersRound size={22} />
                </button>

                <button
                    className={`nav-item ${isNotificationsPage ? "active" : ""}`}
                    title="Notifications"
                    aria-label="Notifications"
                    onClick={() => navigate("/notifications")}
                >
                    <Bell size={22} />
                    {unreadCount > 0 && <span className="notification-dot"></span>}
                </button>

            </nav>

            <div className="sidebar-bottom">

                <button
                    className="nav-item theme-toggle"
                    onClick={onToggleTheme}
                    title={
                        theme === "dark"
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"
                    }
                    aria-label={
                        theme === "dark"
                            ? "Switch to Light Mode"
                            : "Switch to Dark Mode"
                    }
                >
                    {theme === "dark" ? (
                        <Sun size={22} />
                    ) : (
                        <Moon size={22} />
                    )}
                </button>

                <button className="nav-item" title="Settings">
                    <Settings size={22} />
                </button>

                <button
                    className="nav-item"
                    title="Log out"
                    aria-label="Log out"
                    onClick={() => dispatch(logout())}
                >
                    <LogOut size={22} />
                </button>

                <div className="sidebar-divider"></div>

                <button
                    className={`sidebar-avatar ${isProfilePage ? "active" : ""}`}
                    title="Profile"
                    aria-label="Profile"
                    onClick={() => navigate("/profile")}
                >
                    <Avatar
                        name={user?.fullName}
                        src={user?.avatar}
                        size={40}
                        status={user?.status}
                    />
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;
