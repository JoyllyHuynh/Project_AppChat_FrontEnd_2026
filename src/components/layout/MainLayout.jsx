import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ConversationList from "../../features/chat/components/ConversationList";
import ChatWindow from "../../features/chat/components/ChatWindow";
import {getReplyDelay,createIncomingMessage,generateAutoReply,generateIncomingContent} from "../../features/chat/services/chatMockService";
import {currentUser,conversations as initialConversations,initialMessages,} from "../../services/mock/chatData";
import {getConversationLabels,saveConversationLabels,generateLabelId,} from "../../features/chat/services/conversationLabelService";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../features/user/userSlice";
import { fetchChatMessages, sendChatMessage,receiveChatMessage, } from "../../features/chat/chatSlice";
import { on } from "../../services/api/socketClient";

const parseMessageDate = (value) => {
    if (value == null) return null;

    const date = new Date(
        typeof value === "string" ? value.replace(" ", "T") : value
    );

    return Number.isNaN(date.getTime()) ? null : date;
};

function MainLayout() {

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("webchat_theme");

        return savedTheme === "light" || savedTheme === "dark"
            ? savedTheme
            : "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("webchat_theme", theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme((prevTheme) =>
            prevTheme === "dark" ? "light" : "dark"
        );
    };

    const [conversations, setConversations] = useState(() => {
        try {
            const savedConversations = localStorage.getItem(
                "webchat_conversations"
            );

            return savedConversations
                ? JSON.parse(savedConversations)
                : initialConversations;
        } catch (error) {
            console.error("Cannot load conversations:", error);
            return initialConversations;
        }
    });

    const [activeId, setActiveId] = useState(null);

    const activeIdRef = useRef(activeId);

    const [messages, setMessages] = useState(initialMessages);

    const [labels, setLabels] = useState(() => getConversationLabels());

    useEffect(() => {
        saveConversationLabels(labels);
    }, [labels]);

    useEffect(() => {
        try {
            localStorage.setItem(
                "webchat_conversations",
                JSON.stringify(conversations)
            );
        } catch (error) {
            console.error("Cannot save conversations:", error);
        }
    }, [conversations]);

    const handleSelectConversation = (id) => {
        activeIdRef.current = id;
        setActiveId(id);

        setConversations((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, unread: 0 }
                    : item
            )
        );

        const selectedConversation = conversations.find(
            (item) => item.id === id
        );

        if (!selectedConversation) return;

        if (selectedConversation.type !== 0) {
            console.log("Đây không phải cuộc trò chuyện cá nhân.");
            return;
        }

        dispatch(
            fetchChatMessages({
                name: selectedConversation.name,
                page: 1,
            })
        );
    };

    const handleBackToConversationList = () => {
        activeIdRef.current = null;
        setActiveId(null);
    };


    const handleSendMessage = async (content) => {
        const trimmedContent = content.trim();

        if (!trimmedContent || !activeConversation) return;

        if (activeConversation.type !== 0) {
            console.warn("Hiện tại chỉ hỗ trợ gửi tin nhắn cá nhân.");
            return;
        }

        const conversationName = activeConversation.name;

        try {
            const result = await dispatch(
                sendChatMessage({
                    to: conversationName,
                    mes: trimmedContent,
                    name: authUser?.username,
                })
            ).unwrap();

            console.log("[SEND_CHAT] Success:", result);
            const sentAt = parseMessageDate(result.createAt);

            setConversations((prev) =>
                prev
                    .map((conversation) =>
                        conversation.name === conversationName
                            ? {
                                ...conversation,
                                lastMessage: `${result.name}: ${result.mes}`,
                                time: sentAt?.toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }) || "",
                                timestamp: sentAt?.getTime() || 0,
                            }
                            : conversation
                    )
                    .sort((a, b) => b.timestamp - a.timestamp)
            );

        } catch (sendError) {
            console.error("[SEND_CHAT] Failed:", sendError);
        }
    };

    const handleAutoReply = (conversationId, userMessage) => {
        const conversation = conversations.find(
            (item) => item.id === conversationId
        );

        if (!conversation) return;

        const delay = getReplyDelay();

        setTimeout(() => {
            const reply = generateAutoReply({
                conversation,
                lastUserMessage: userMessage,
            });

            const incomingMessage = createIncomingMessage(reply);

            setMessages((prev) => ({
                ...prev,
                [conversationId]: [
                    ...(prev[conversationId] || []),
                    incomingMessage,
                ],
            }));

            setConversations((prev) => {
                const updated = prev.map((item) =>
                    item.id === conversationId
                        ? {
                            ...item,
                            lastMessage: `${conversation.name}: ${reply.content}`,
                            time: incomingMessage.time,
                            timestamp: incomingMessage.sentAt,
                            unread:
                                activeIdRef.current === conversationId
                                    ? 0
                                    : item.unread + 1,
                        }
                        : item
                );

                return updated.sort(
                    (a, b) => b.timestamp - a.timestamp
                );
            });
        }, delay);
    };

    const handleSimulateIncoming = (conversationId) => {
        const targetConversation = conversations.find(
            (item) => item.id === conversationId
        );

        if (!targetConversation) return;

        const senderId =
            conversationId === 1 ? 2 : conversationId + 1;

        const incomingMessage = createIncomingMessage({
            senderId,
            content: generateIncomingContent(),
        });

        setMessages((prev) => ({
            ...prev,
            [conversationId]: [
                ...(prev[conversationId] || []),
                incomingMessage,
            ],
        }));

        setConversations((prev) => {
            const updated = prev.map((item) =>
                item.id === conversationId
                    ? {
                        ...item,
                        lastMessage: `${targetConversation.name}: ${incomingMessage.content}`,
                        time: incomingMessage.time,
                        timestamp: incomingMessage.sentAt,
                        unread:
                            activeIdRef.current === conversationId
                                ? 0
                                : item.unread + 1,
                    }
                    : item
            );

            return updated.sort(
                (a, b) => b.timestamp - a.timestamp
            );
        });
    };

    const handleCreateLabel = (name, color) => {
        const trimmedName = name.trim();

        if (!trimmedName) return false;

        const isDuplicate = labels.some(
            (label) =>
                label.name.toLocaleLowerCase("vi") ===
                trimmedName.toLocaleLowerCase("vi")
        );

        if (isDuplicate) return false;

        const newLabel = {
            id: generateLabelId(),
            name: trimmedName,
            color,
        };

        setLabels((prev) => [...prev, newLabel]);

        return true;
    };

    const handleUpdateLabel = (id, name, color) => {
        const trimmedName = name.trim();

        if (!trimmedName) return false;

        const isDuplicate = labels.some(
            (label) =>
                label.id !== id &&
                label.name.toLocaleLowerCase("vi") ===
                trimmedName.toLocaleLowerCase("vi")
        );

        if (isDuplicate) return false;

        setLabels((prev) =>
            prev.map((label) =>
                label.id === id
                    ? { ...label, name: trimmedName, color }
                    : label
            )
        );

        return true;
    };

    const handleDeleteLabel = (id) => {
        setLabels((prev) =>
            prev.filter((label) => label.id !== id)
        );

        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.labelId === id
                    ? { ...conversation, labelId: null }
                    : conversation
            )
        );
    };

    const handleAssignLabel = (conversationId, labelId) => {
        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.id === conversationId
                    ? {
                        ...conversation,
                        labelId: labelId,
                    }
                    : conversation
            )
        );
    };

    const dispatch = useDispatch();
    const {
        users,  
        usersLoading,
        error,
    } = useSelector((state) => state.user);

    const {
        messagesByUser,
        loadingByUser,
        errorByUser,
        sending,
        sendError,
    } = useSelector((state) => state.chat);

    const authUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        console.log("[AUTH USER]", authUser);
    }, [authUser]);

    const activeConversation = conversations.find(
        (item) => item.id === activeId
    );


    const activeMessages = activeConversation
        ? (messagesByUser[activeConversation.name] || [])
            .map((message) => {
                const date = parseMessageDate(message.createAt);

                return {
                    id: message.id,
                    senderId: message.name,
                    content: message.mes,
                    sentAt: date ? date.toISOString() : null,
                    time: date
                        ? date.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "",
                    to: message.to,
                    type: message.type,
                };
            })
            .sort((a, b) => {
                const timeA = a.sentAt
                    ? new Date(a.sentAt).getTime()
                    : Number.POSITIVE_INFINITY;

                const timeB = b.sentAt
                    ? new Date(b.sentAt).getTime()
                    : Number.POSITIVE_INFINITY;

                return timeA - timeB;
            })
        : [];


    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        console.log("[GET_USER_LIST] Users:", users);
        console.log("[GET_USER_LIST] Loading:", usersLoading);
        console.log("[GET_USER_LIST] Error:", error);
    }, [users, usersLoading, error]);

    useEffect(() => {
        if (usersLoading || users.length === 0) return;

        setConversations((prevConversations) => {
            const apiConversations = users.map((user) => {
                const existingConversation = prevConversations.find(
                    (conversation) =>
                        String(conversation.id) === String(user.id)
                );

                const date = user.actionTime
                    ? new Date(user.actionTime.replace(" ", "T"))
                    : null;

                const timestamp =
                    date && !Number.isNaN(date.getTime())
                        ? date.getTime()
                        : 0;

                return {
                    ...existingConversation,

                    id: user.id,
                    name: user.name,
                    type: user.type,
                    actionTime: user.actionTime,

                    avatar:
                        existingConversation?.avatar ||
                        `https://i.pravatar.cc/150?u=${encodeURIComponent(user.id)}`,

                    status: null,

                    time: timestamp
                        ? new Date(timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "",

                    lastMessage: existingConversation?.lastMessage || "",
                    timestamp,
                    unread: existingConversation?.unread || 0,
                    labelId: existingConversation?.labelId || null,
                };
            });

            return apiConversations.sort(
                (a, b) => b.timestamp - a.timestamp
            );
        });
    }, [users, usersLoading]);

    
    useEffect(() => {
        const unsubscribe = on("SEND_CHAT", (packet) => {
            console.log("[REALTIME] SEND_CHAT received:", packet);

            const payload = packet.data;

            const incomingMessages = Array.isArray(payload)
                ? payload
                : [payload];

            incomingMessages.forEach((message) => {
                if (!message?.name || !message?.mes) return;

                const currentUsername = authUser?.username;

                const conversationName =
                    message.name === currentUsername
                        ? message.to
                        : message.name;

                if (!conversationName) return;

                const date = parseMessageDate(message.createAt) || new Date();

                const normalizedMessage = {
                    ...message,
                    createAt: date.toISOString(),
                };

                dispatch(
                    receiveChatMessage({
                        conversationName,
                        message: normalizedMessage,
                    })
                );

                setConversations((prev) =>
                    prev
                        .map((conversation) =>
                            conversation.name === conversationName
                                ? {
                                    ...conversation,
                                    lastMessage: message.mes,
                                    time: date.toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }),
                                    timestamp: date.getTime(),
                                    unread:
                                        message.name === currentUsername
                                            ? conversation.unread
                                            : activeIdRef.current === conversation.id
                                                ? 0
                                                : conversation.unread + 1,
                                }
                                : conversation
                        )
                        .sort((a, b) => b.timestamp - a.timestamp)
                );
            });
        });

        return () => unsubscribe();
    }, [dispatch, authUser?.username]);

    return (
        <div className={`app-container ${activeId ? "mobile-chat-open" : ""}`}>

            <Sidebar
                theme={theme}
                onToggleTheme={handleToggleTheme}
            />
            
            <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelectConversation}

                labels={labels}

                onCreateLabel={handleCreateLabel}
                onUpdateLabel={handleUpdateLabel}
                onDeleteLabel={handleDeleteLabel}
                onAssignLabel={handleAssignLabel}
            />

            
            <ChatWindow
                conversation={activeConversation}
                messages={activeMessages}
                currentUser={{
                    ...currentUser,
                    id: authUser?.username || currentUser.id,
                    username: authUser?.username,
                }}
                onSendMessage={handleSendMessage}
                onSimulateIncoming={handleSimulateIncoming}
                conversations={conversations}
                onBack={handleBackToConversationList}
            />

        </div>
    );
}

export default MainLayout;
