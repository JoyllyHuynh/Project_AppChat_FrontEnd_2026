import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ConversationList from "../../features/chat/components/ConversationList";
import ChatWindow from "../../features/chat/components/ChatWindow";
import {getReplyDelay,createIncomingMessage,generateAutoReply,generateIncomingContent} from "../../features/chat/services/chatMockService";
import {currentUser,conversations as initialConversations,initialMessages,} from "../../services/mock/chatData";
import {getConversationLabelData, saveConversationLabelData, generateLabelId,} from "../../features/chat/services/conversationLabelService";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../features/user/userSlice";
import { fetchChatMessages, fetchRoomChatMessages, sendChatMessage,sendRoomMessage,receiveChatMessage,receiveRoomChatMessage, } from "../../features/chat/chatSlice";
import { on } from "../../services/api/socketClient";
import useTheme from "../../hooks/useTheme";
import { joinRoom } from "../../features/chat/services/chatSocketService";

const parseMessageDate = (value) => {
    if (value == null) return null;

    if (typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof value === "string") {
        const normalizedValue = value.trim();

        const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(
            normalizedValue
        );

        const date = new Date(
            hasTimezone
                ? normalizedValue
                : normalizedValue.replace(" ", "T") + "Z"
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
};

function MainLayout() {

    const dispatch = useDispatch();

    const authUser = useSelector((state) => state.auth.user);

    const username = authUser?.username?.trim().toLowerCase() || "guest";

    const { theme, toggleTheme } = useTheme();

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

    const [labelData, setLabelData] = useState(() => ({
        owner: username,
        ...getConversationLabelData(username),
    }));

    const labels = labelData.labels;
    const labelAssignments = labelData.assignments;

    useEffect(() => {
        setLabelData({
            owner: username,
            ...getConversationLabelData(username),
        });
    }, [username]);

    useEffect(() => {
        if (labelData.owner !== username) return;

        saveConversationLabelData(username, {
            labels: labelData.labels,
            assignments: labelData.assignments,
        });
    }, [labelData, username]);

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

        if (Number(selectedConversation.type) === 1) {
            dispatch(
                fetchRoomChatMessages({
                    name: selectedConversation.name,
                    page: 1,
                })
            );
        } else {
            dispatch(
                fetchChatMessages({
                    name: selectedConversation.name,
                    page: 1,
                })
            );
        }
    };

    const handleSearchUser = async (searchName) => {
        const trimmedName = searchName.trim();

        if (!trimmedName) return;

        if (
            trimmedName.toLowerCase() ===
            authUser?.username?.trim().toLowerCase()
        ) {
            alert("Bạn không thể mở cuộc trò chuyện với chính mình.");
            return;
        }

        const existingConversation = conversations.find(
            (conversation) =>
                conversation.name?.trim().toLowerCase() ===
                trimmedName.toLowerCase()
        );

        if (existingConversation) {
            handleSelectConversation(existingConversation.id);
            return;
        }

        try {
            await dispatch(
                fetchChatMessages({
                    name: trimmedName,
                    page: 1,
                })
            ).unwrap();

            const newConversation = {
                id: trimmedName,
                name: trimmedName,
                type: 0,
                avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(trimmedName)}`,
                status: null,
                time: "",
                lastMessage: "",
                timestamp: Date.now(),
                unread: 0,
                labelId: null,
            };

            setConversations((prev) => {
                const alreadyExists = prev.some(
                    (conversation) =>
                        Number(conversation.type) === 0 &&
                        conversation.name?.toLowerCase() ===
                            trimmedName.toLowerCase()
                );

                if (alreadyExists) return prev;

                return [newConversation, ...prev];
            });

            activeIdRef.current = newConversation.id;
            setActiveId(newConversation.id);

            console.log(
                "[SEARCH] Opened new conversation:",
                newConversation
            );

        } catch (error) {
            console.error("[SEARCH] Cannot open user:", error);
            alert(
                error?.message ||
                "Không thể mở cuộc trò chuyện với người dùng này."
            );
        }
    };

    const handleSearchRoom = async (searchName) => {
        const trimmedName = searchName.trim();

        if (!trimmedName) return;

        const existingRoom = conversations.find(
            (conversation) =>
                Number(conversation.type) === 1 &&
                conversation.name?.trim().toLowerCase() ===
                    trimmedName.toLowerCase()
        );

        if (existingRoom) {
            handleSelectConversation(existingRoom.id);
            return;
        }

        try {
            const roomData = await joinRoom(trimmedName);

            const roomName = roomData.name || trimmedName;

            const newRoom = {
                id: roomName,
                name: roomName,
                type: 1,
                avatar: "",
                status: null,
                time: "",
                lastMessage: "",
                timestamp: Date.now(),
                unread: 0,
                labelId: null,
            };

            setConversations((prev) => {
                const alreadyExists = prev.some(
                    (conversation) =>
                        Number(conversation.type) === 1 &&
                        conversation.name?.toLowerCase() ===
                            roomName.toLowerCase()
                );

                if (alreadyExists) return prev;

                return [newRoom, ...prev];
            });

            activeIdRef.current = newRoom.id;
            setActiveId(newRoom.id);

            await dispatch(
                fetchRoomChatMessages({
                    name: roomName,
                    page: 1,
                })
            ).unwrap();

            console.log("[SEARCH] Joined room successfully:", roomData);

        } catch (error) {
            console.error("[SEARCH] Cannot join room:", error);

            alert(
                error?.message ||
                "Không thể tham gia phòng chat này."
            );
        }
    };

    const handleBackToConversationList = () => {
        activeIdRef.current = null;
        setActiveId(null);
    };

    
    const handleSendMessage = async (content) => {
        const trimmedContent = content.trim();

        if (!trimmedContent || !activeConversation) return;

        const conversationName = activeConversation.name;
        const isGroup = Number(activeConversation.type) === 1;

        try {
            let result;

            if (isGroup) {
                result = await dispatch(
                    sendRoomMessage({
                        to: conversationName,
                        mes: trimmedContent,
                        name: authUser?.username,
                    })
                ).unwrap();
            } else {
                result = await dispatch(
                    sendChatMessage({
                        to: conversationName,
                        mes: trimmedContent,
                        name: authUser?.username,
                    })
                ).unwrap();
            }

            console.log(
                isGroup
                    ? "[SEND_ROOM_CHAT] Success:"
                    : "[SEND_CHAT] Success:",
                result
            );

            const sentAt = parseMessageDate(result.createAt);

            setConversations((prev) =>
                prev
                    .map((conversation) =>
                        conversation.name === conversationName
                            ? {
                                ...conversation,
                                lastMessage: `You: ${result.mes}`,
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
            console.error(
                isGroup
                    ? "[SEND_ROOM_CHAT] Failed:"
                    : "[SEND_CHAT] Failed:",
                sendError
            );
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

        setLabelData((prev) => ({
            ...prev,
            labels: [...prev.labels, newLabel],
        }));

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

        setLabelData((prev) => ({
            ...prev,
            labels: prev.labels.map((label) =>
                label.id === id
                    ? { ...label, name: trimmedName, color }
                    : label
            ),
        }));

        return true;
    };

    const handleDeleteLabel = (id) => {
        setLabelData((prev) => ({
            ...prev,
            labels: prev.labels.filter((label) => label.id !== id),
            assignments: Object.fromEntries(
                Object.entries(prev.assignments).filter(
                    ([, labelId]) => labelId !== id
                )
            ),
        }));

        setConversations((prev) =>
            prev.map((conversation) =>
                conversation.labelId === id
                    ? { ...conversation, labelId: null }
                    : conversation
            )
        );
    };

    const handleAssignLabel = (conversationId, labelId) => {
        const conversation = conversations.find(
            (item) => String(item.id) === String(conversationId)
        );

        if (!conversation) return;

        setLabelData((prev) => {
            const assignments = { ...prev.assignments };

            if (labelId) {
                assignments[conversation.name] = labelId;
            } else {
                delete assignments[conversation.name];
            }

            return { ...prev, assignments };
        });

        setConversations((prev) =>
            prev.map((item) =>
                String(item.id) === String(conversationId)
                    ? { ...item, labelId: labelId || null }
                    : item
            )
        );
    };

    const {
        users,  
        usersLoading,
        error,
    } = useSelector((state) => state.user);

    const {
        messagesByUser,
        messagesByRoom,
        loadingByUser,
        loadingByRoom,
        errorByUser,
        errorByRoom,
        sending,
        sendError,
    } = useSelector((state) => state.chat);

    useEffect(() => {
        console.log("[AUTH USER]", authUser);
    }, [authUser]);

    const activeConversation = conversations.find(
        (item) => item.id === activeId
    );

    const personalConversations = conversations.filter(
        (conversation) => Number(conversation.type) === 0
    );

    const groupConversations = conversations.filter(
        (conversation) => Number(conversation.type) === 1
    );

    const activeMessages = activeConversation
        ? (
            Number(activeConversation.type) === 1
                ? messagesByRoom[activeConversation.name] || []
                : messagesByUser[activeConversation.name] || []
        )
            .map((message) => {
                const date =
                    parseMessageDate(message.createAt) ||
                    parseMessageDate(message.createTime);

                const isGroup = Number(activeConversation.type) === 1;

                return {
                    id: message.id,
                    senderId: isGroup
                        ? message.own || message.name
                        : message.name,
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
                    labelId: labelAssignments[user.name] || null,
                };
            });

            return apiConversations.sort(
                (a, b) => b.timestamp - a.timestamp
            );
        });
    }, [users, usersLoading, labelAssignments]);

    
    useEffect(() => {
        const unsubscribe = on("SEND_CHAT", (packet) => {
            console.log("[REALTIME] SEND_CHAT received:", packet);

            if (packet.status === "error") {
                console.error("[REALTIME] SEND_CHAT error:", packet.mes);
                return;
            }

            const payload = packet.data;
            console.log("[REALTIME DEBUG] Raw SEND_CHAT:", {
                status: packet.status,
                payload,
                receivedAt: new Date().toISOString(),
            });

            const incomingMessages = Array.isArray(payload)
                ? payload
                : [payload];

            console.log(
                "[REALTIME DEBUG] Number of messages:",
                incomingMessages.length
            );

            incomingMessages.forEach((message) => {
                if (!message?.mes) return;

                const currentUsername = authUser?.username?.trim();

                const date =
                    parseMessageDate(message.createAt) ||
                    parseMessageDate(message.createTime) ||
                    new Date();

                const normalizedMessage = {
                    ...message,
                    createAt: date.toISOString(),
                };

                const isRoomMessage =
                    message.type === "room" ||
                    Number(message.type) === 1;

                if (isRoomMessage) {
                    const roomName = message.to;

                    if (!roomName) {
                        console.warn(
                            "[REALTIME] Room message has no room name:",
                            message
                        );
                        return;
                    }

                    dispatch(
                        receiveRoomChatMessage({
                            roomName,
                            message: normalizedMessage,
                        })
                    );

                    setConversations((prev) =>
                        prev
                            .map((conversation) =>
                                conversation.name === roomName
                                    ? {
                                        ...conversation,
                                        lastMessage:
                                            message.name === currentUsername
                                                ? `You: ${message.mes}`
                                                : `${message.name || "Someone"}: ${message.mes}`,
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

                    return;
                }

                const conversationName =
                    message.name === currentUsername
                        ? message.to
                        : message.name;

                if (!conversationName) return;

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
                                    lastMessage:
                                        message.name === currentUsername
                                            ? `You: ${message.mes}`
                                            : message.mes,
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

            <Sidebar theme={theme} onToggleTheme={toggleTheme} />
            
            <ConversationList
                conversations={conversations}
                groupConversations={groupConversations}
                activeId={activeId}
                onSelect={handleSelectConversation}
                onSearchUser={handleSearchUser}
                onSearchRoom={handleSearchRoom}

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
