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
import { useDispatch } from "react-redux";
import { logout } from '../../store/authSlice';

function Sidebar({ theme, onToggleTheme }) {
    const dispatch = useDispatch();
    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Hexagon size={25} />
                </div>
            </div>

            <nav className="sidebar-nav">

                <button className="nav-item active" title="Messages">
                    <MessageCircle size={22} />
                </button>

                <button className="nav-item" title="Contacts">
                    <Users size={22} />
                </button>

                <button className="nav-item" title="Groups">
                    <UsersRound size={22} />
                </button>

                <button className="nav-item" title="Notifications">
                    <Bell size={22} />
                    <span className="notification-dot"></span>
                </button>

            </nav>

            <div className="sidebar-bottom">

                <button
                    className="nav-item theme-toggle"
                    onClick={onToggleTheme}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
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
                    onClick={() => dispatch(logout())}>
                    <LogOut size={22} />
                </button>

                <div className="sidebar-divider"></div>

                <button className="sidebar-avatar" title="Profile">
                    <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="User avatar"
                    />
                    <span className="online-indicator"></span>
                </button>

            </div>

        </aside>

    );

}

export default Sidebar;