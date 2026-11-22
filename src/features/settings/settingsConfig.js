export const SETTING_GROUPS = [
    {
        title: "Notifications",
        items: [
            {
                key: "messageSound",
                label: "Message sounds",
                description: "Play a sound when a new message arrives.",
                defaultValue: true,
            },
            {
                key: "desktopNotifications",
                label: "Desktop notifications",
                description: "Show alerts when WebChat is in the background.",
                defaultValue: true,
            },
            {
                key: "messagePreview",
                label: "Message preview",
                description: "Show the message text in notifications.",
                defaultValue: true,
            },
        ],
    },
    {
        title: "Privacy",
        items: [
            {
                key: "showOnlineStatus",
                label: "Show online status",
                description: "Let others see when you’re online.",
                defaultValue: true,
            },
            {
                key: "readReceipts",
                label: "Read receipts",
                description: "Let others know when you’ve read their messages.",
                defaultValue: true,
            },
        ],
    },
];

export const DEFAULT_SETTINGS = Object.fromEntries(
    SETTING_GROUPS.flatMap((group) => group.items).map((item) => [item.key, item.defaultValue])
);