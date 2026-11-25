import { useMemo } from "react";
import { useSelector } from "react-redux";
import { applyPresence, buildOnlineStatuses, getActiveOnlineStatus, pickPresenceNames} from "../services/presenceUtils";
import usePresence from "./usePresence";

export default function useConversationPresence(conversations, activeConversation) {
    const byUser = useSelector((state) => state.presence.byUser);
    const activeName = activeConversation?.name;

    const names = useMemo(
        () => pickPresenceNames(conversations, activeName),
        [conversations, activeName]
    );
    usePresence(names);

    const conversationsWithStatus = useMemo(
        () => applyPresence(conversations, byUser),
        [conversations, byUser]
    );

    const activeConversationWithStatus = useMemo(
        () => (activeConversation ? applyPresence([activeConversation], byUser)[0] : undefined),
        [activeConversation, byUser]
    );

    const onlineStatuses = useMemo(
        () => buildOnlineStatuses(conversations, byUser),
        [conversations, byUser]
    );
    const activeOnlineStatus = getActiveOnlineStatus(activeConversation, onlineStatuses);

    return {
        conversationsWithStatus,
        activeConversationWithStatus,
        onlineStatuses,
        activeOnlineStatus,
    };
}