import { useState } from "react";

const getPermission = () =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission;

const MESSAGES = {
    default: "Allow notifications so you’re alerted when this tab is in the background.",
    denied: "Notifications are blocked. Allow them in your browser’s site settings.",
    unsupported: "This browser doesn’t support desktop notifications.",
};

function BrowserPermissionNotice({ enabled }) {
    const [permission, setPermission] = useState(getPermission);

    if (!enabled || permission === "granted") return null;

    const handleAllow = async () => {
        setPermission(await Notification.requestPermission());
    };

    return (
        <div className="setting-row">
            <div>
                <div className="setting-label">Browser permission</div>
                <div className="muted">{MESSAGES[permission]}</div>
            </div>
            {permission === "default" && (
                <button className="btn btn-ghost" onClick={handleAllow}>
                    Allow
                </button>
            )}
        </div>
    );
}

export default BrowserPermissionNotice;