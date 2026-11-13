import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { togglePinMessage, saveEditedMessage, deleteMessageForMe, } from "../chatSlice";
import {
    ArrowLeft,
    Phone,
    Video,
    MoreHorizontal,
    Paperclip,
    Smile,
    Send,
    Image,
    Plus,
    Pin,
    PinOff,
    Check,
    Trash2,
    FileText,
    FileArchive,
    FileSpreadsheet,
    FileType,
    File,
    Users,
    UserRound,
} from "lucide-react";

    function getDateKey(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    function getMessageMenuKey(item, dateKey, index) {
        return [
            item.id ?? "no-id",
            item.senderId ?? "",
            item.sentAt ?? item.time ?? "",
            dateKey,
            index,
        ].join("::");
    }

    function formatMessageDate(timestamp) {
        const messageDate = new Date(timestamp);
        const today = new Date();

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (getDateKey(messageDate.getTime()) === getDateKey(today.getTime())) {
            return "Today";
        }

        if (getDateKey(messageDate.getTime()) === getDateKey(yesterday.getTime())) {
            return "Yesterday";
        }

        return messageDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatMessageDateTime(timestamp) {
        if (!timestamp) return "Unknown";

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) {
            return "Unknown";
        }

        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileType(fileName) {
        const extension = fileName.split(".").pop().toLowerCase();

        const types = {
            pdf: { label: "PDF", icon: "pdf" },
            doc: { label: "Word", icon: "word" },
            docx: { label: "Word", icon: "word" },
            xls: { label: "Excel", icon: "excel" },
            xlsx: { label: "Excel", icon: "excel" },
            ppt: { label: "PowerPoint", icon: "powerpoint" },
            pptx: { label: "PowerPoint", icon: "powerpoint" },
            txt: { label: "Text", icon: "text" },
            zip: { label: "ZIP", icon: "archive" },
        };

        return types[extension] || {
            label: "File",
            icon: "file",
        };
    }

function ChatWindow({
    conversation,
    messages,
    currentUser,
    onSendMessage,
    onBack,
}) {  
    const [message, setMessage] = useState("");
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [showAllPinned, setShowAllPinned] = useState(false);
    const [selectedMessageInfo, setSelectedMessageInfo] = useState(null);
    const [menuPlacement, setMenuPlacement] = useState("menu-down");
    const [menuMaxHeight, setMenuMaxHeight] = useState(null);
    const messageContainerRef = useRef(null);
    const activeMessageButtonRef = useRef(null);
    const messageMenuRef = useRef(null);
    const messageActionsRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [showCopyToast, setShowCopyToast] = useState(false);
    const copyToastTimerRef = useRef(null);
    const dispatch = useDispatch();
    const [selectedAttachments, setSelectedAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const selectedAttachmentsRef = useRef([]);

    const pinnedMessages =
        useSelector(
            (state) =>
                state.chat.pinnedMessagesByUser?.[conversation?.name] || []
        );

    const editedMessages =
        useSelector(
            (state) =>
                state.chat.editedMessagesByUser?.[conversation?.name] || {}
        );

    const deletedMessageIds = useSelector(
        (state) =>
            state.chat.deletedMessagesByUser?.[conversation?.name] || []
    );
    useEffect(() => {
        setSelectedAttachments([]);
        selectedAttachmentsRef.current = [];

        return () => {
            selectedAttachmentsRef.current.forEach((attachment) => {
                if (attachment.previewUrl) {
                    URL.revokeObjectURL(attachment.previewUrl);
                }
            });

            selectedAttachmentsRef.current = [];
        };
    }, [conversation?.name]);

    useEffect(() => {
        if (activeMessageMenu === null) return;

        const handleClickOutside = (event) => {
            if (
                messageActionsRef.current &&
                !messageActionsRef.current.contains(event.target)
            ) {
                setActiveMessageMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeMessageMenu]);

    useLayoutEffect(() => {
        if (activeMessageMenu === null) return;

        const menu = messageMenuRef.current;
        const button = activeMessageButtonRef.current;
        const container = messageContainerRef.current;

        if (!menu || !button || !container) return;

        const menuHeight = menu.offsetHeight;

        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const spaceAbove = buttonRect.top - containerRect.top;
        const spaceBelow = containerRect.bottom - buttonRect.bottom;

        const requiredSpace = menuHeight + 10;

        if (spaceBelow >= requiredSpace) {
            setMenuPlacement("menu-down");
            setMenuMaxHeight(null);
        } else if (spaceAbove >= requiredSpace) {
            setMenuPlacement("menu-up");
            setMenuMaxHeight(null);
        } else if (spaceAbove > spaceBelow) {
            setMenuPlacement("menu-up");
            setMenuMaxHeight(Math.max(100, spaceAbove - 10));
        } else {
            setMenuPlacement("menu-down");
            setMenuMaxHeight(Math.max(100, spaceBelow - 10));
        }
    }, [activeMessageMenu, messages]);

    const groupedMessages = messages.reduce((groups, item) => {
        const isDeleted = deletedMessageIds.some(
            (id) => String(id) === String(item.id)
        );

        if (isDeleted) return groups;

        const dateKey = getDateKey(item.sentAt);

        if (!groups[dateKey]) {
            groups[dateKey] = {
                date: item.sentAt,
                messages: [],
            };
        }

        groups[dateKey].messages.push(item);

        return groups;
    }, {});

    const messageInputRef = useRef(null);

    const renderAttachmentIcon = (fileName) => {
        const type = getFileType(fileName);

        const icons = {
            pdf: <FileText size={23} className="file-icon-pdf" />,
            word: <FileText size={23} className="file-icon-word" />,
            excel: <FileSpreadsheet size={23} className="file-icon-excel" />,
            powerpoint: <FileType size={23} className="file-icon-powerpoint" />,
            text: <FileText size={23} className="file-icon-text" />,
            archive: <FileArchive size={23} className="file-icon-archive" />,
            file: <File size={23} />,
        };

        return icons[type.icon];
    };

    const handleJumpToMessage = (messageId) => {
        const messageElement = document.getElementById(
            `message-${messageId}`
        );

        if (!messageElement) return;

        messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        messageElement.classList.add("message-highlight");

        setTimeout(() => {
            messageElement.classList.remove("message-highlight");
        }, 2000);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    const handleCopyMessage = async (content) => {
        try {
            await navigator.clipboard.writeText(content);

            setActiveMessageMenu(null);
            setShowCopyToast(true);

            if (copyToastTimerRef.current) {
                clearTimeout(copyToastTimerRef.current);
            }

            copyToastTimerRef.current = setTimeout(() => {
                setShowCopyToast(false);
            }, 2000);

        } catch (error) {
            console.error("Copy message failed:", error);
        }
    };

    useEffect(() => {
        return () => {
            if (copyToastTimerRef.current) {
                clearTimeout(copyToastTimerRef.current);
            }
        };
    }, []);

    const handleSend = () => {
        const content = message.trim();

        if (!content || !conversation) return;

        if (editingMessage) {
            dispatch(
                saveEditedMessage({
                    conversationName: conversation.name,
                    messageId: editingMessage.id,
                    content,
                })
            );

            setEditingMessage(null);
        } else {
            onSendMessage(content);
        }

        setMessage("");

        if (messageInputRef.current) {
            messageInputRef.current.style.height = "auto";
        }
    };

    const handleMessageChange = (e) => {
        const value = e.target.value;

        setMessage(value);

        e.target.style.height = "auto";

        e.target.style.height = `${Math.min(
            e.target.scrollHeight,
            100
        )}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    
    const handleAttachmentChange = (event) => {
        const files = Array.from(event.target.files || []);
        const isImageInput = event.target === imageInputRef.current;

        const MAX_FILE_SIZE = 20 * 1024 * 1024;
        const MAX_ATTACHMENTS = 10;

        const allowedDocumentExtensions = [
            "pdf", "doc", "docx", "xls", "xlsx",
            "ppt", "pptx", "txt", "zip"
        ];

        const validFiles = [];

        files.forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                alert(`${file.name} exceeds the 20 MB limit.`);
                return;
            }

            if (isImageInput) {
                if (!file.type.startsWith("image/")) {
                    alert(`${file.name} is not a valid image.`);
                    return;
                }
            } else {
                const extension = file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

                if (!allowedDocumentExtensions.includes(extension)) {
                    alert(`${file.name} is not a supported document.`);
                    return;
                }
            }

            validFiles.push(file);
        });

        const remainingSlots =
            MAX_ATTACHMENTS - selectedAttachmentsRef.current.length;

        if (remainingSlots <= 0) {
            alert("You can attach up to 10 files.");
            event.target.value = "";
            return;
        }

        const filesToAdd = validFiles.slice(0, remainingSlots);

        if (validFiles.length > remainingSlots) {
            alert("Only 10 attachments are allowed.");
        }

        const newAttachments = filesToAdd.map((file) => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            previewUrl: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : null,
        }));

        setSelectedAttachments((current) => {
            const updated = [...current, ...newAttachments];

            selectedAttachmentsRef.current = updated;

            return updated;
        });

        event.target.value = "";
    };

    const handleRemoveAttachment = (attachmentId) => {
        setSelectedAttachments((current) => {
            const attachmentToRemove = current.find(
                (item) => item.id === attachmentId
            );

            if (attachmentToRemove?.previewUrl) {
                URL.revokeObjectURL(attachmentToRemove.previewUrl);
            }

            const updated = current.filter(
                (item) => item.id !== attachmentId
            );

            selectedAttachmentsRef.current = updated;

            return updated;
        });
    };

    const handleClearAttachments = () => {
        selectedAttachmentsRef.current.forEach((attachment) => {
            if (attachment.previewUrl) {
                URL.revokeObjectURL(attachment.previewUrl);
            }
        });

        selectedAttachmentsRef.current = [];
        setSelectedAttachments([]);
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
            
            {messageToDelete && (
                <div
                    className="delete-message-overlay"
                    onClick={() => setMessageToDelete(null)}
                >
                    <div
                        className="delete-message-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="delete-message-icon">
                            <Trash2 size={22} />
                        </div>

                        <h3>Delete message?</h3>

                        <p>
                            This message will be removed from your chat.
                            You won't be able to see it again.
                        </p>

                        <div className="delete-message-preview">
                            {editedMessages[messageToDelete.id] ??
                                messageToDelete.content}
                        </div>

                        <div className="delete-message-actions">
                            <button
                                type="button"
                                className="delete-cancel-button"
                                onClick={() => setMessageToDelete(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-button"
                                onClick={() => {
                                    dispatch(
                                        deleteMessageForMe({
                                            conversationName: conversation.name,
                                            messageId: messageToDelete.id,
                                        })
                                    );

                                    setMessageToDelete(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCopyToast && (
                <div className="copy-toast">
                    <span>Copied</span>
                </div>
            )}

            {selectedMessageInfo && (
                <div
                    className="message-info-overlay"
                    onClick={() => setSelectedMessageInfo(null)}
                >
                    <div
                        className="message-info-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="message-info-header">
                            <h3>Message Information</h3>

                            <button
                                type="button"
                                onClick={() => setSelectedMessageInfo(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="message-info-body">
                            <div className="message-info-sender">
                                {String(selectedMessageInfo.senderId).trim().toLowerCase() ===
                                String(currentUser.username || currentUser.id).trim().toLowerCase() ? (
                                    currentUser.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt="Sender avatar"
                                            className="message-info-avatar"
                                        />
                                    ) : (
                                        <div className="message-info-avatar message-avatar-fallback">
                                            {currentUser.username?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                    )
                                ) : (
                                    <div className="message-info-avatar message-avatar-fallback">
                                        {selectedMessageInfo.senderId?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                )}

                                <div className="message-info-sender-details">
                                    <p className="message-info-name">
                                        {selectedMessageInfo.senderId}
                                    </p>
                                    <span>Sender</span>
                                </div>
                            </div>

                            <div className="message-info-field">
                                <span>Message</span>
                                <p className="message-info-content">
                                    {selectedMessageInfo.content}
                                </p>
                            </div>

                            <div className="message-info-field">
                                <span>Date and time</span>
                                <p className="message-info-time">
                                    {formatMessageDateTime(selectedMessageInfo.sentAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="chat-header">
                <button
                    type="button"
                    className="mobile-back-button"
                    title="Back to conversations"
                    onClick={onBack}
                >
                    <ArrowLeft size={21} />
                </button>

                <div className="chat-user-info">
                    <div className="chat-header-avatar">
                        {Number(conversation.type) === 1 ? (
                            <Users size={24} />
                        ) : conversation.avatar ? (
                            <img
                                src={conversation.avatar}
                                alt={conversation.name}
                            />
                        ) : (
                            <UserRound size={24} />
                        )}

                        {conversation.status === "online" && (
                            <span className="online-indicator"></span>
                        )}
                    </div>

                    <div className="chat-user-details">
                        <h3 title={conversation.name}>
                            {conversation.name}
                        </h3>

                        <p>
                            {conversation.status === "online"
                                ? "Active now"
                                : "Offline"}
                        </p>
                    </div>
                </div>

                <div className="chat-header-actions">
                    <button
                        type="button"
                        className="icon-button"
                        title="Voice call"
                    >
                        <Phone size={19} />
                    </button>

                    <button
                        type="button"
                        className="icon-button"
                        title="Video call"
                    >
                        <Video size={20} />
                    </button>

                    <button
                        type="button"
                        className="icon-button"
                        title="More"
                    >
                        <MoreHorizontal size={21} />
                    </button>
                </div>
            </header>

            {pinnedMessages.length > 0 && (
                <div className="pinned-messages-panel">
                    <div className="pinned-messages-header">
                        <div className="pinned-messages-title">
                            <Pin size={15} />
                            <span>Pinned Messages</span>

                            <span className="pinned-messages-count">
                                {pinnedMessages.length}
                            </span>
                        </div>

                        {pinnedMessages.length > 1 && (
                            <button
                                type="button"
                                className="pinned-view-all"
                                onClick={() =>
                                    setShowAllPinned((current) => !current)
                                }
                            >
                                {showAllPinned
                                    ? "Show less"
                                    : `View all (${pinnedMessages.length})`}
                            </button>
                        )}
                    </div>

                    {(showAllPinned
                        ? pinnedMessages
                        : [pinnedMessages[0]]
                    ).map((pinned) => (
                        <div
                            className="pinned-message-item"
                            key={pinned.id}
                        >
                            <button
                                type="button"
                                className="pinned-message-content"
                                onClick={() => handleJumpToMessage(pinned.id)}
                                title="Jump to message"
                            >
                                <span className="pinned-message-sender">
                                    {pinned.senderId}
                                </span>

                                <p>{editedMessages[pinned.id] ?? pinned.content}</p>
                            </button>

                            <button
                                type="button"
                                className="pinned-message-unpin"
                                title="Unpin message"
                                onClick={() => {
                                    dispatch(
                                        togglePinMessage({
                                            conversationName: conversation.name,
                                            message: pinned,
                                        })
                                    );
                                }}
                            >
                                <PinOff size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <section className="message-container" ref={messageContainerRef}>

                {Object.entries(groupedMessages).map(([dateKey, group]) => (
                    <div className="message-group" key={dateKey}>

                        <div className="message-date">
                            <span>{formatMessageDate(group.date)}</span>
                        </div>

                        {group.messages.map((item, index) => {
                            const messageMenuKey = getMessageMenuKey(
                                item,
                                dateKey,
                                index
                            );

                            const isMine =
                                String(item.senderId).trim().toLowerCase() ===
                                String(currentUser.username || currentUser.id).trim().toLowerCase();

                            return (
                                    <div
                                        id={`message-${item.id}`}
                                        key={messageMenuKey}
                                        className={`message-row ${
                                            isMine ? "message-mine" : "message-theirs"
                                        }`}
                                    >
                                    {!isMine && (
                                        <div className="message-avatar message-avatar-fallback">
                                            {item.senderId?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                    )}

                                    <div className="message-content">
                                        <div className="message-bubble-wrapper">
                                            {pinnedMessages.some(
                                                (pinned) => String(pinned.id) === String(item.id)
                                            ) && (
                                                <div className="message-pinned-indicator" title="Pinned message">
                                                    <Pin size={13} />
                                                </div>
                                            )}

                                            <div className="message-bubble">
                                                {editedMessages[item.id] ?? item.content}
                                            </div>
                                        </div>

                                        <span className="message-time">
                                            {item.time}
                                        </span>
                                    </div>

                                    <div className="message-actions"
                                        ref={activeMessageMenu === messageMenuKey
                                            ? messageActionsRef
                                            : null}
                                    >
                                        <button
                                            ref={
                                                activeMessageMenu === messageMenuKey
                                                    ? activeMessageButtonRef
                                                    : null
                                            }
                                            type="button"
                                            className="message-menu-button"
                                            title="Message options"
                                            onClick={() => {
                                                setMenuPlacement("menu-down");
                                                setMenuMaxHeight(null);

                                                setActiveMessageMenu((currentId) =>
                                                    currentId === messageMenuKey ? null : messageMenuKey
                                                );
                                            }}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {activeMessageMenu === messageMenuKey && (
                                            <div ref={messageMenuRef}
                                                className={`message-action-menu ${
                                                    isMine ? "sent" : "received"
                                                } ${menuPlacement}`}
                                                style={{
                                                    maxHeight: menuMaxHeight
                                                        ? `${menuMaxHeight}px`
                                                        : undefined,
                                                }}>
                                                <button type="button" className="message-action-item"
                                                    onClick={() => handleCopyMessage(item.content)}
                                                >
                                                    Copy message
                                                </button>   

                                                <button type="button" className="message-action-item"
                                                    onClick={() => {
                                                        setReplyTo(item);
                                                        setActiveMessageMenu(null);
                                                        messageInputRef.current?.focus();
                                                    }}
                                                >
                                                    Reply
                                                </button>

                                                <button type="button" className="message-action-item"
                                                    onClick={() => {
                                                        setSelectedMessageInfo(item);
                                                        setActiveMessageMenu(null);
                                                    }}
                                                >
                                                    View info
                                                </button>

                                                <button type="button" className="message-action-item"
                                                    onClick={() => {
                                                        dispatch(
                                                            togglePinMessage({
                                                                conversationName: conversation.name,
                                                                message: item,
                                                            })
                                                        );
                                                        setActiveMessageMenu(null);
                                                    }}
                                                >
                                                    {pinnedMessages.some(
                                                        (pinned) => String(pinned.id) === String(item.id)
                                                    )
                                                        ? "Unpin message"
                                                        : "Pin message"}
                                                </button>

                                                {isMine && (
                                                    <button type="button" className="message-action-item" disabled={!item.id}
                                                        onClick={() => {
                                                            setEditingMessage(item);
                                                            setMessage(editedMessages[item.id] ?? item.content);
                                                            setReplyTo(null);
                                                            setActiveMessageMenu(null);
                                                            requestAnimationFrame(() => {
                                                                messageInputRef.current?.focus();
                                                            });
                                                        }}
                                                    >
                                                        Edit message
                                                    </button>
                                                )}

                                                <button type="button" className="message-action-item danger" disabled={!item.id}
                                                    onClick={() => {
                                                        setMessageToDelete(item);
                                                        setActiveMessageMenu(null);
                                                    }}
                                                >
                                                    Delete message
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                ))}

                <div ref={messagesEndRef}></div>

            </section>

            <footer className="chat-input-area">

                <input ref={fileInputRef} type="file" hidden multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                    onChange={handleAttachmentChange}
                />

                <input ref={imageInputRef} type="file" hidden multiple accept="image/*"
                    onChange={handleAttachmentChange}
                />

                {replyTo && (
                    <div className="reply-preview">
                        <div className="reply-preview-content">
                            <span className="reply-preview-label">
                                Replying to {replyTo.senderId}
                            </span>

                            <p>{replyTo.content}</p>
                        </div>

                        <button
                            type="button"
                            className="reply-preview-close"
                            onClick={() => setReplyTo(null)}
                            aria-label="Cancel reply"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                {editingMessage && (
                    <div className="editing-message-preview">
                        <div className="editing-message-content">
                            <span>Editing message</span>
                            <p>{editingMessage.content}</p>
                        </div>

                        <button
                            type="button"
                            className="editing-message-close"
                            title="Cancel editing"
                            onClick={() => {
                                setEditingMessage(null);
                                setMessage("");

                                if (messageInputRef.current) {
                                    messageInputRef.current.style.height = "auto";
                                }
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {selectedAttachments.length > 0 && (
                    <div className="attachment-preview-list">

                        <div className="attachment-preview-header">
                            <div className="attachment-preview-heading">
                                <span>Attachments</span>

                                <span className="attachment-count">
                                    {selectedAttachments.length}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="attachment-clear-button"
                                onClick={handleClearAttachments}
                            >
                                Remove all
                            </button>
                        </div>

                        <div className="attachment-preview-items">
                        {selectedAttachments.map((attachment) => (
                            <div
                                className="attachment-preview-item"
                                key={attachment.id}
                            >
                                {attachment.previewUrl ? (
                                    <img
                                        src={attachment.previewUrl}
                                        alt={attachment.file.name}
                                        className="attachment-preview-image"
                                    />
                                ) : (
                                    <div className="attachment-preview-icon">
                                        {renderAttachmentIcon(attachment.file.name)}
                                    </div>
                                )}

                                <div className="attachment-preview-info">
                                    <span
                                        className="attachment-preview-name"
                                        title={attachment.file.name}
                                    >
                                        {attachment.file.name}
                                    </span>

                                    <span className="attachment-preview-size">
                                        {getFileType(attachment.file.name).label}
                                        {" · "}
                                        {formatFileSize(attachment.file.size)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="attachment-remove-button"
                                    title="Remove attachment"
                                    onClick={() =>
                                        handleRemoveAttachment(attachment.id)
                                    }
                                >
                                    ×
                                </button>

                                </div>
                                ))}
                        </div>
                    </div>
                )}

                {selectedAttachments.length > 0 && (
                    <p className="attachment-notice">
                        Attachments are for preview only and cannot be sent yet.
                    </p>
                )}

                <div className="chat-input-toolbar">
                    <button type="button" className="icon-button" title="Attach file"
                        onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={19} />
                    </button>

                    <button type="button" className="icon-button" title="Send image"
                        onClick={() => imageInputRef.current?.click()}>
                        <Image size={19} />
                    </button>

                    <button type="button" className="icon-button" title="More attachments">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="chat-input-box">

                    <textarea
                        ref={messageInputRef}
                        placeholder="Type your message..."
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />

                    <button className="icon-button" title="Emoji">
                        <Smile size={20} />
                    </button>

                    <button className="send-button" onClick={handleSend} disabled={!message.trim()}
                        title={editingMessage ? "Save changes" : "Send message"}
                    >
                        {editingMessage ? (
                            <Check size={18} />
                        ) : (
                            <Send size={18} />
                        )}
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