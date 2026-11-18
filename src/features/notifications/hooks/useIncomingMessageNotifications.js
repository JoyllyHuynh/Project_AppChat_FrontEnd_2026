import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { on } from "../../../services/api/socketClient";
import { playNotificationSound } from "../../../utils/sound";
import useSettings from "../../settings/hooks/useSettings";
import { addNotification } from "../notificationSlice";
import { buildMessageNotification } from "../services/messageNotification";

const showDesktopNotification = ({ title, body, tag }) => {
    try {
        const notification = new Notification(title, { body, tag });
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch {

    }
};

export default function useIncomingMessageNotifications() {
    const dispatch = useDispatch();
    const username = useSelector((state) => state.auth.user?.username);
    const { settings } = useSettings();
    const { pathname } = useLocation();

    const latest = useRef({ settings, pathname });
    useEffect(() => {
        latest.current = { settings, pathname };
    }, [settings, pathname]);

    useEffect(() => {
        if (!username) return undefined;

        return on("SEND_CHAT", (packet) => {
            const payload = packet.data;
            const messages = Array.isArray(payload) ? payload : [payload];

            messages.forEach((message) => {
                const result = buildMessageNotification({
                    message,
                    username,
                    settings: latest.current.settings,
                    pathname: latest.current.pathname,
                    tabHidden: document.hidden,
                    notificationPermission:
                        typeof Notification === "undefined" ? "denied" : Notification.permission,
                });

                if (!result) return;
                if (result.sound) playNotificationSound();
                if (result.inApp) dispatch(addNotification(result.inApp));
                if (result.desktop) showDesktopNotification(result.desktop);
            });
        });
    }, [dispatch, username]);
}