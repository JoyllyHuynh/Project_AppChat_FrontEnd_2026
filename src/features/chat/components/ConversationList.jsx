
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";

function ConversationList({
    conversations,
    activeId,
    onSelect,
}) {
    const [keyword, setKeyword] = useState("");

    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi");

    const filteredConversations = conversations.filter((conversation) => {
        const conversationName = conversation.name
            .trim()
            .toLocaleLowerCase("vi");

        return conversationName.includes(normalizedKeyword);
    });

    return (
        <section className="conversation-panel">

            <div className="conversation-header">
                <div>
                    <h2>Messages</h2>
                    <p>Your conversations</p>
                </div>

                <div className="conversation-actions">
                    <button className="icon-button" title="More">
                        <MoreHorizontal size={20} />
                    </button>

                    <button className="icon-button primary-icon" title="New chat">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="conversation-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            <div className="conversation-list">

                {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            className={`conversation-item ${
                                activeId === conversation.id
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() => onSelect(conversation.id)}
                        >
                            <div className="conversation-avatar">
                                <img
                                    src={conversation.avatar}
                                    alt={conversation.name}
                                />

                                {conversation.status === "online" && (
                                    <span className="online-indicator"></span>
                                )}
                            </div>

                            <div className="conversation-info">
                                <div className="conversation-top">
                                    <h4>{conversation.name}</h4>

                                    <span className="conversation-time">
                                        {conversation.time}
                                    </span>
                                </div>

                                <div className="conversation-bottom">
                                    <p>{conversation.lastMessage}</p>

                                    {conversation.unread > 0 && (
                                        <span className="unread-badge">
                                            {conversation.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="empty-conversation">
                        No conversations found
                    </div>
                )}

            </div>

            <div className="conversation-footer">
                <span>{conversations.length} conversations</span>
                <span>WebChat</span>
            </div>

        </section>
    );
}

export default ConversationList;
