import { useMemo } from "react";
import { useSelector } from "react-redux";
import { applyPresence, pickPresenceNames } from "../services/presenceUtils";
import usePresence from "./usePresence";

export default function useConversationPresence(conversations, activeConversation) {
    const byUser = useSelector((state) => state.presence.byUser);
    const membersByRoom = useSelector(
        (state) => state.chat.membersByRoom
    );

    const activeName = activeConversation?.name;

    const groupMemberNames = useMemo(
        () => Object.values(membersByRoom || {})
            .flat()
            .map((member) => member.name)
            .filter(Boolean),
        [membersByRoom]
    );

    const names = useMemo(() => {
        const personalNames = pickPresenceNames(
            conversations,
            activeName
        );

        return [...new Set([
            ...personalNames,
            ...groupMemberNames,
        ])];
    }, [conversations, activeName, groupMemberNames]);

    usePresence(names);

    const conversationsWithStatus = useMemo(
        () => applyPresence(conversations, byUser),
        [conversations, byUser]
    );

    const activeConversationWithStatus = useMemo(
        () => (
            activeConversation
                ? applyPresence([activeConversation], byUser)[0]
                : undefined
        ),
        [activeConversation, byUser]
    );

    return {
        conversationsWithStatus,
        activeConversationWithStatus,
    };
}