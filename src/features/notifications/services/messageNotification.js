const PREVIEW_LENGTH = 80;
let counter = 0;

const truncate = (text) =>
    text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH - 1)}…` : text;

export const buildTitle = ({ isRoom, sender, room, count }) => {
    if (isRoom) {
        return count > 1 ? `${count} new messages in ${room}` : `${sender} sent a message in ${room}`;
    }
    return count > 1 ? `${sender} sent you ${count} messages` : `${sender} sent you a message`;
};

export const buildMessageNotification = ({ message, username, settings, pathname, tabHidden, notificationPermission, now = new Date(),}) => {
    if (!message?.name || !message?.mes || message.name === username) return null;

    const isRoom = message.type === 1 || message.type === "room";
    const conversation = isRoom ? `room:${message.to}` : `user:${message.name}`;
    const title = buildTitle({ isRoom, sender: message.name, room: message.to, count: 1 });
    const body = settings.messagePreview ? truncate(message.mes) : "New message";

    const onChatPage = pathname.startsWith("/chat");

    counter += 1;
    return {
        sound: Boolean(settings.messageSound),
        inApp: onChatPage
            ? null
            : {
                id: `msg_${now.getTime()}_${counter}`,
                type: "message",
                title,
                body,
                createdAt: now.toISOString(),
                read: false,
                conversation,
                count: 1,
                sender: message.name,
                room: isRoom ? message.to : null,
            },
        desktop:
            settings.desktopNotifications && tabHidden && notificationPermission === "granted"
                ? { title, body, tag: conversation }
                : null,
    };
};

export const mergeMessageNotification = (items, incoming) => {
    const index = items.findIndex(
        (n) => n.type === "message" && !n.read && n.conversation === incoming.conversation
    );

    if (index === -1) return { items: [incoming, ...items], notification: incoming };

    const existing = items[index];
    const count = (existing.count || 1) + 1;
    const merged = {
        ...existing,
        count,
        body: incoming.body,
        createdAt: incoming.createdAt,
        title: buildTitle({
            isRoom: Boolean(existing.room),
            sender: existing.sender,
            room: existing.room,
            count,
        }),
    };

    return {
        items: [merged, ...items.filter((_, i) => i !== index)],
        notification: merged,
    };
};