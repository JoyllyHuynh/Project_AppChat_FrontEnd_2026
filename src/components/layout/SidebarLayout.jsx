import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useTheme from "../../hooks/useTheme";

function SidebarLayout() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="app-container">
            <Sidebar theme={theme} onToggleTheme={toggleTheme} />
            <Outlet />
        </div>
    );
}

export default SidebarLayout;