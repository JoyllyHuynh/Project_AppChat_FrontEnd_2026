
export const currentUser = {
    id: 1,
    name: "Alex Morgan",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "online",
};

function createTimestamp(hour, minute, dayOffset = 0) {
    const date = new Date();

    date.setDate(date.getDate() - dayOffset);
    date.setHours(hour, minute, 0, 0);

    return date.getTime();
}

export const conversations = [
    {
        id: 1,
        name: "Sarah Johnson",
        avatar: "https://i.pravatar.cc/150?img=47",
        status: "online",
        lastMessage: "That sounds great! Let's do it.",
        time: "09:42",
        timestamp: createTimestamp(9, 42),
        unread: 2,
        type: "personal",
    },
    {
        id: 2,
        name: "Development Team",
        avatar: "https://i.pravatar.cc/150?img=20",
        status: "online",
        lastMessage: "Michael: The new design is ready.",
        time: "09:15",
        timestamp: createTimestamp(9, 15),
        unread: 5,
        type: "group",
    },
    {
        id: 3,
        name: "Emily Wilson",
        avatar: "https://i.pravatar.cc/150?img=44",
        status: "offline",
        lastMessage: "Thank you for your help!",
        time: "Yesterday",
        timestamp: createTimestamp(16, 30, 1),
        unread: 0,
        type: "personal",
    },
    {
        id: 4,
        name: "James Anderson",
        avatar: "https://i.pravatar.cc/150?img=13",
        status: "online",
        lastMessage: "See you tomorrow.",
        time: "Yesterday",
        timestamp: createTimestamp(14, 20, 1),
        unread: 0,
        type: "personal",
    },
    {
        id: 5,
        name: "Project Discussion",
        avatar: "https://i.pravatar.cc/150?img=56",
        status: "offline",
        lastMessage: "You: I will check it.",
        time: "Mon",
        timestamp: createTimestamp(10, 0, 2),
        unread: 0,
        type: "group",
    },
    {
        id: 6,
        name: "Olivia Martinez",
        avatar: "https://i.pravatar.cc/150?img=49",
        status: "offline",
        lastMessage: "Can we talk later?",
        time: "Sun",
        timestamp: createTimestamp(15, 30, 3),
        unread: 0,
        type: "personal",
    },
];

export const initialMessages = {
    1: [
        {
            id: 1,
            senderId: 2,
            content: "Hey Alex! How are you doing today?",
            time: "09:30",
            sentAt: createTimestamp(9, 30),
        },
        {
            id: 2,
            senderId: 1,
            content: "I'm doing great! Just finished working on the new project.",
            time: "09:32",
            sentAt: createTimestamp(9, 32),
        },
        {
            id: 3,
            senderId: 2,
            content: "That's awesome! How is the progress going?",
            time: "09:35",
            sentAt: createTimestamp(9, 35),
        },
        {
            id: 4,
            senderId: 1,
            content: "Everything is going well. The UI design is almost complete.",
            time: "09:38",
            sentAt: createTimestamp(9, 38),
        },
        {
            id: 5,
            senderId: 2,
            content: "That sounds great! Let's do it.",
            time: "09:42",
            sentAt: createTimestamp(9, 42),
        },
    ],

    2: [
        {
            id: 1,
            senderId: 2,
            content: "The new design is ready.",
            time: "09:10",
            sentAt: createTimestamp(9, 10),
        },
        {
            id: 2,
            senderId: 1,
            content: "Great! I'll review it shortly.",
            time: "09:15",
            sentAt: createTimestamp(9, 15),
        },
    ],

    3: [
        {
            id: 1,
            senderId: 2,
            content: "Thank you for your help!",
            time: "Yesterday",
            sentAt: createTimestamp(16, 30, 1),
        },
    ],

    4: [
        {
            id: 1,
            senderId: 2,
            content: "See you tomorrow.",
            time: "Yesterday",
            sentAt: createTimestamp(14, 20, 1),
        },
    ],

    5: [
        {
            id: 1,
            senderId: 1,
            content: "I will check it.",
            time: "Monday",
            sentAt: createTimestamp(10, 0, 2),
        },
    ],

    6: [
        {
            id: 1,
            senderId: 2,
            content: "Can we talk later?",
            time: "Sunday",
            sentAt: createTimestamp(15, 30, 3),
        },
    ],
};
