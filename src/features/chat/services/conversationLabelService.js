const STORAGE_KEY = "webchat_conversation_labels";

export const defaultLabels = [
    {
        id: "label-work",
        name: "Công việc",
        color: "#3B82F6",
    },
    {
        id: "label-friends",
        name: "Bạn bè",
        color: "#8B5CF6",
    },
    {
        id: "label-family",
        name: "Gia đình",
        color: "#F59E0B",
    },
    {
        id: "label-personal",
        name: "Cá nhân",
        color: "#10B981",
    },
    {
        id: "label-other",
        name: "Khác",
        color: "#64748B",
    },
];

export function getConversationLabels() {
    try {
        const storedLabels = localStorage.getItem(STORAGE_KEY);

        if (storedLabels === null) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(defaultLabels)
            );

            return defaultLabels;
        }

        const parsedLabels = JSON.parse(storedLabels);

        return Array.isArray(parsedLabels)
            ? parsedLabels
            : defaultLabels;
    } catch (error) {
        console.error("Cannot load conversation labels:", error);
        return defaultLabels;
    }
}

export function saveConversationLabels(labels) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(labels)
        );

        return true;
    } catch (error) {
        console.error("Cannot save conversation labels:", error);
        return false;
    }
}

export function generateLabelId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `label-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
