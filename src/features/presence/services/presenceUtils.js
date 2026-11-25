export const STATUS_ONLINE = "online";
export const STATUS_OFFLINE = "offline";

const isPerson = (conversation) => Number(conversation.type) === 0;

export const pickPresenceNames = (conversations, activeName, limit = 15) => {
    const names = [];
    const add = (name) => {
        if (name && !names.includes(name) && names.length < limit) names.push(name);
    };

    const active = conversations.find((c) => c.name === activeName);
    if (active && isPerson(active)) add(active.name);

    conversations.forEach((c) => {
        if (isPerson(c)) add(c.name);
    });
    return names;
};

export const applyPresence = (conversations, byUser) =>
    conversations.map((c) => {
        if (!isPerson(c) || typeof byUser[c.name] !== "boolean") return c;
        return { ...c, status: byUser[c.name] ? STATUS_ONLINE : STATUS_OFFLINE };
    });

export const buildOnlineStatuses = (conversations, byUser) => {
    const result = {};

    conversations.forEach((c) => {
        if (!isPerson(c) || !c.name) return;

        const known = byUser[c.name];
        result[c.name.trim()] =
            typeof known === "boolean" ? (known ? "online" : "offline") : "checking";
    });

    return result;
};

export const getActiveOnlineStatus = (conversation, onlineStatuses) =>
    conversation && isPerson(conversation)
        ? onlineStatuses[conversation.name?.trim()] || "checking"
        : "unknown";
