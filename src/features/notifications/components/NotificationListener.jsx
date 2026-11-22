import useIncomingMessageNotifications from "../hooks/useIncomingMessageNotifications";

function NotificationListener() {
    useIncomingMessageNotifications();
    return null;
}

export default NotificationListener;