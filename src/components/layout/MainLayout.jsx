import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import ConversationList from "../../features/chat/components/ConversationList";
import ChatWindow from "../../features/chat/components/ChatWindow";
import {getReplyDelay,createIncomingMessage,generateAutoReply,generateIncomingContent} from "../../features/chat/services/chatMockService";
import {currentUser,conversations as initialConversations,initialMessages,} from "../../services/mock/chatData";

function MainLayout() {

    const [conversations, setConversations] = useState(
        initialConversations
    );

    const [activeId, setActiveId] = useState(null);

    const activeIdRef = useRef(activeId);

    const [messages, setMessages] = useState(initialMessages);

    const activeConversation = conversations.find(
        (item) => item.id === activeId
    );

    const activeMessages = messages[activeId] || [];

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
    };

    const handleSendMessage = (content) => {
        const trimmedContent = content.trim();

        if (!trimmedContent) return;

        const now = Date.now();

        const newMessage = {
            id: now,
            senderId: currentUser.id,
            content: trimmedContent,
            time: new Date(now).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            sentAt: now,
        };

        setMessages((prev) => ({
            ...prev,
            [activeId]: [
                ...(prev[activeId] || []),
                newMessage,
            ],
        }));

        setConversations((prev) => {
            const updated = prev.map((item) =>
                item.id === activeId
                    ? {
                        ...item,
                        lastMessage: `You: ${trimmedContent}`,
                        time: newMessage.time,
                        timestamp: now,
                    }
                    : item
            );

            return updated.sort(
                (a, b) => b.timestamp - a.timestamp
            );
        });

        handleAutoReply(activeId, trimmedContent);
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

    return (
        <div className="app-container">

            
            <Sidebar />

            
            <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelectConversation}
            />

            
            <ChatWindow
                conversation={activeConversation}
                messages={activeMessages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onSimulateIncoming={handleSimulateIncoming}
                conversations={conversations}
            />

        </div>
    );
}

export default MainLayout;
