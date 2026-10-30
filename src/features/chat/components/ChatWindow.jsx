import { useEffect, useRef, useState } from "react";
import {
    Phone,
    Video,
    MoreHorizontal,
    Paperclip,
    Smile,
    Send,
    Image,
    Plus,
    MessageCirclePlus,
} from "lucide-react";

function ChatWindow({
    conversation,
    messages,
    currentUser,
    onSendMessage,
    onSimulateIncoming,
    conversations,
}) {   
    const [message, setMessage] = useState("");

    const [showSenderPicker, setShowSenderPicker] = useState(false);
        
    const [selectedSenderId, setSelectedSenderId] = useState("");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleSend = () => {
        const content = message.trim();

        if (!content || !conversation) return;

        onSendMessage(content);
        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!conversation) {
        return (
            <main className="chat-window empty-chat">

                <div className="empty-chat-content">
                    <div className="empty-chat-icon">
                        <Send size={32} />
                    </div>

                    <h2>Your messages, all in one place</h2>

                    <p>
                        Select a conversation to start chatting
                        with your friends and colleagues.
                    </p>
                </div>

            </main>
        );
    }

    return (
        <main className="chat-window">

            <header className="chat-header">

                <div className="chat-user-info">

                    <div className="conversation-avatar">
                        <img
                            src={conversation.avatar}
                            alt={conversation.name}
                        />

                        {conversation.status === "online" && (
                            <span className="online-indicator"></span>
                        )}
                    </div>

                    <div>
                        <h3>{conversation.name}</h3>

                        <p>
                            <span
                                className={`status-dot ${
                                    conversation.status
                                }`}
                            ></span>

                            {conversation.status === "online"
                                ? "Active now"
                                : "Offline"}
                        </p>
                    </div>

                </div>

                <div className="chat-header-actions">

                    <button className="icon-button" title="Voice call">
                        <Phone size={19} />
                    </button>

                    <button className="icon-button" title="Video call">
                        <Video size={20} />
                    </button>

                    <button className="icon-button" title="More">
                        <MoreHorizontal size={21} />
                    </button>

                    <button className="icon-button" title="Simulate incoming message" onClick={() => setShowSenderPicker((prev) => !prev)}>
                        <MessageCirclePlus size={19} />
                    </button>

                </div>

            </header>

            {showSenderPicker && (
                <div className="mock-sender-picker">
                    <h4>Simulate Incoming Message</h4>

                    <select
                        value={selectedSenderId}
                        onChange={(e) => setSelectedSenderId(e.target.value)}
                    >
                        <option value="">Select sender</option>

                        {conversations.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            if (!selectedSenderId) return;

                            onSimulateIncoming(Number(selectedSenderId));

                            setShowSenderPicker(false);
                            setSelectedSenderId("");
                        }}
                        disabled={!selectedSenderId}
                    >
                        Simulate Message
                    </button>
                </div>
            )}

            <section className="message-container">

                <div className="message-date">
                    <span>Today</span>
                </div>

                {messages.map((item) => {

                    const isMine = item.senderId === currentUser.id;

                    return (
                        <div
                            key={item.id}
                            className={`message-row ${
                                isMine ? "message-mine" : "message-theirs"
                            }`}
                        >

                            {!isMine && (
                                <img
                                    className="message-avatar"
                                    src={conversation.avatar}
                                    alt={conversation.name}
                                />
                            )}

                            <div className="message-content">

                                <div className="message-bubble">
                                    {item.content}
                                </div>

                                <span className="message-time">
                                    {item.time}
                                </span>

                            </div>

                        </div>
                    );
                })}

                <div ref={messagesEndRef}></div>

            </section>

            <footer className="chat-input-area">

                <div className="chat-input-toolbar">

                    <button className="icon-button" title="Attach file">
                        <Paperclip size={19} />
                    </button>

                    <button className="icon-button" title="Send image">
                        <Image size={19} />
                    </button>

                    <button className="icon-button" title="More attachments">
                        <Plus size={20} />
                    </button>

                </div>

                <div className="chat-input-box">

                    <textarea
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    <button className="icon-button" title="Emoji">
                        <Smile size={20} />
                    </button>

                    <button
                        className="send-button"
                        onClick={handleSend}
                        disabled={!message.trim()}
                        title="Send message"
                    >
                        <Send size={18} />
                    </button>

                </div>

                <p className="input-hint">
                    Press <strong>Enter</strong> to send ·
                    <strong> Shift + Enter</strong> for new line
                </p>

            </footer>

        </main>
    );
}

export default ChatWindow;