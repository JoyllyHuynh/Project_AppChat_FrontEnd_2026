import { useEffect, useRef, useState } from "react";
import useConnectionStatus from "../../features/auth/hooks/useConnectionStatus.js";

const MESSAGES = {
    offline: "You’re offline. Check your internet connection.",
    reconnecting: "Connection lost. Reconnecting…",
};

function ConnectionBanner() {
    const status = useConnectionStatus();
    const [showRestored, setShowRestored] = useState(false);
    const wasLost = useRef(false);

    useEffect(() => {
        if (status !== "ok") {
            wasLost.current = true;
            setShowRestored(false);
            return undefined;
        }
        if (!wasLost.current) return undefined;

        wasLost.current = false;
        setShowRestored(true);
        const timer = setTimeout(() => setShowRestored(false), 2500);
        return () => clearTimeout(timer);
    }, [status]);

    if (status !== "ok") {
        return (
            <div className="connection-banner lost" role="status">
                {MESSAGES[status]}
            </div>
        );
    }

    if (showRestored) {
        return (
            <div className="connection-banner restored" role="status">
                Back online
            </div>
        );
    }

    return null;
}

export default ConnectionBanner;