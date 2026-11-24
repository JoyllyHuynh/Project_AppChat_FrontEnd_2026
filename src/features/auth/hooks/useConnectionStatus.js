import { useEffect, useState } from "react";
import {
    getConnectionStatus,
    onConnectionStatusChange,
    reconnectNow,
} from "../../../services/api/socketClient";

const SOCKET_MODE = import.meta.env.VITE_API_MODE === "socket";

export default function useConnectionStatus() {
    const [socketStatus, setSocketStatus] = useState(getConnectionStatus);
    const [browserOnline, setBrowserOnline] = useState(() => navigator.onLine);

    useEffect(() => onConnectionStatusChange(setSocketStatus), []);

    useEffect(() => {
        const handleOnline = () => {
            setBrowserOnline(true);
            reconnectNow();
        };
        const handleOffline = () => setBrowserOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!SOCKET_MODE) return "ok";
    if (!browserOnline) return "offline";
    if (socketStatus === "reconnecting") return "reconnecting";
    return "ok";
}