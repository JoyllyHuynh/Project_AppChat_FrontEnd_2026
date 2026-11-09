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

const getStorageKey = (username) => {
    const account = String(username || "guest")
        .trim()
        .toLowerCase();

    return `webchat_user_preferences:${account}`;
};

export function getConversationLabelData(username) {
    try {
        const storedData = localStorage.getItem(
            getStorageKey(username)
        );

        if (!storedData) {
            return {
                labels: defaultLabels,
                assignments: {},
            };
        }

        const parsedData = JSON.parse(storedData);

        return {
            labels: Array.isArray(parsedData.labels)
                ? parsedData.labels
                : defaultLabels,

            assignments:
                parsedData.assignments &&
                typeof parsedData.assignments === "object" &&
                !Array.isArray(parsedData.assignments)
                    ? parsedData.assignments
                    : {},
        };
    } catch (error) {
        console.error("Cannot load conversation label data:", error);

        return {
            labels: defaultLabels,
            assignments: {},
        };
    }
}

export function saveConversationLabelData(username, data) {
    try {
        localStorage.setItem(
            getStorageKey(username),
            JSON.stringify({
                labels: data.labels,
                assignments: data.assignments,
            })
        );

        return true;
    } catch (error) {
        console.error("Cannot save conversation label data:", error);
        return false;
    }
}

export function generateLabelId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `label-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
