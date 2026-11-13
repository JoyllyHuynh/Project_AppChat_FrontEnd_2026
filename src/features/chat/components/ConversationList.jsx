import {
    Search,
    Plus,
    MoreHorizontal,
    Tag,
    Pencil,
    Trash2,
    X,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchServerUsers } from "../../user/userSlice";

const DEFAULT_LABEL_COLOR = "#3B82F6";

function ConversationList({
    conversations,
    activeId,
    onSelect,
    onSearchUser,
    onSearchRoom,
    labels = [],
    onCreateLabel,
    onUpdateLabel,
    onDeleteLabel,
    onAssignLabel,
}) {
    const [keyword, setKeyword] = useState("");

    const [openLabelConversationId, setOpenLabelConversationId] = useState(null);

    const [selectedLabelId, setSelectedLabelId] = useState("all");

    const [showLabelManager, setShowLabelManager] = useState(false);

    const [editingLabel, setEditingLabel] = useState(null);

    const [labelName, setLabelName] = useState("");
    const [labelColor, setLabelColor] = useState(DEFAULT_LABEL_COLOR);
    const [labelError, setLabelError] = useState("");

    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi");

    const activeLabelId = labels.some(
        (label) => label.id === selectedLabelId
    )
        ? selectedLabelId
        : "all";

    const filteredConversations = conversations.filter((conversation) => {
        const conversationName = (conversation.name || "")
            .trim()
            .toLocaleLowerCase("vi");

        const matchesKeyword = conversationName.includes(normalizedKeyword);

        const matchesLabel =
            activeLabelId === "all" ||
            conversation.labelId === activeLabelId;

        return matchesKeyword && matchesLabel;
    });

    const dispatch = useDispatch();

    const {
        serverSearchResults,
        serverSearchLoading,
        serverSearchError,
    } = useSelector((state) => state.user);

    const [searchMode, setSearchMode] = useState("all");
    const [showSearchResults, setShowSearchResults] = useState(false);

    const filteredServerSearchResults = serverSearchResults.filter((item) => {
        const name = (item.name || "").trim().toLocaleLowerCase("vi");
        const matchesKeyword = name.includes(normalizedKeyword);

        const matchesMode =
            searchMode === "all" ||
            (searchMode === "rooms" && Number(item.type) === 1) ||
            (searchMode === "users" && Number(item.type) === 0);

        return matchesKeyword && matchesMode;
    });

    const handleOpenCreateForm = () => {
        setEditingLabel(null);
        setLabelName("");
        setLabelColor(DEFAULT_LABEL_COLOR);
        setLabelError("");
    };

    const handleOpenEditForm = (label) => {
        setEditingLabel(label);
        setLabelName(label.name);
        setLabelColor(label.color);
        setLabelError("");
    };

    const handleCancelForm = () => {
        setEditingLabel(null);
        setLabelName("");
        setLabelColor(DEFAULT_LABEL_COLOR);
        setLabelError("");
    };

    const handleSubmitLabel = (event) => {
        event.preventDefault();

        if (!labelName.trim()) {
            setLabelError("Vui lòng nhập tên nhãn.");
            return;
        }

        const success = editingLabel
            ? onUpdateLabel(
                editingLabel.id,
                labelName,
                labelColor
            )
            : onCreateLabel(labelName, labelColor);

        if (!success) {
            setLabelError(
                "Tên nhãn đã tồn tại hoặc không hợp lệ."
            );
            return;
        }

        handleCancelForm();
    };

    const handleDeleteLabel = (label) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa nhãn "${label.name}" không?`
        );

        if (!confirmed) return;

        onDeleteLabel(label.id);

        if (editingLabel?.id === label.id) {
            handleCancelForm();
        }
    };

    const handleServerSearch = async () => {
        const trimmedKeyword = keyword.trim();

        if (!trimmedKeyword) return;

        try {
            setShowSearchResults(false);

            if (searchMode === "rooms") {
                await onSearchRoom(trimmedKeyword);
            } else {
                await onSearchUser(trimmedKeyword);
            }
        } catch (error) {
            console.error("[SEARCH] Failed:", error);
        }
    };

    return (
        <section className="conversation-panel">

            <div className="conversation-header">
                <div>
                    <h2>Messages</h2>
                    <p>Your conversations</p>
                </div>

                <div className="conversation-actions">
                    <button
                        type="button"
                        className="icon-button"
                        title="Manage labels"
                        onClick={() => {
                            setShowLabelManager(true);
                            handleCancelForm();
                        }}
                    >
                        <Tag size={19} />
                    </button>

                    <button
                        type="button"
                        className="icon-button"
                        title="More"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    <button
                        type="button"
                        className="icon-button primary-icon"
                        title="New chat"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="conversation-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search users or rooms..."
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setShowSearchResults(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleServerSearch();
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={handleServerSearch}
                    disabled={serverSearchLoading}
                    title="Search"
                >
                    {serverSearchLoading ? "..." : "Search"}
                </button>
            </div>

            <div className="server-search-options">
                <label>
                    <input
                        type="radio"
                        name="searchMode"
                        checked={searchMode === "all"}
                        onChange={() => setSearchMode("all")}
                    />
                    All
                </label>

                <label>
                    <input
                        type="radio"
                        name="searchMode"
                        checked={searchMode === "rooms"}
                        onChange={() => setSearchMode("rooms")}
                    />
                    Rooms
                </label>

                <label>
                    <input
                        type="radio"
                        name="searchMode"
                        checked={searchMode === "users"}
                        onChange={() => setSearchMode("users")}
                    />
                    Users
                </label>
            </div>

            <div className="conversation-label-filters">
                <button
                    type="button"
                    className={`label-filter-button ${
                        selectedLabelId === "all" ? "active" : ""
                    }`}
                    onClick={() => setSelectedLabelId("all")}
                >
                    Tất cả
                </button>

                {labels.map((label) => (
                    <button
                        type="button"
                        key={label.id}
                        className={`label-filter-button ${
                            selectedLabelId === label.id ? "active" : ""
                        }`}
                        style={{
                            "--label-color": label.color,
                        }}
                        onClick={() => setSelectedLabelId(label.id)}
                    >
                        <span className="label-filter-dot"></span>
                        {label.name}
                    </button>
                ))}
            </div>

            <div className="conversation-list">
                {showSearchResults ? (
                    <>
                        <div className="search-results-header">
                            Search results ({filteredServerSearchResults.length})
                        </div>

                        {serverSearchLoading ? (
                            <div className="empty-conversation">
                                Searching...
                            </div>
                        ) : serverSearchError ? (
                            <div className="empty-conversation">
                                {serverSearchError}
                            </div>
                        ) : filteredServerSearchResults.length > 0 ? (
                            filteredServerSearchResults.map((item) => (
                                <button
                                    type="button"
                                    key={`${item.type}-${item.id}`}
                                    className="conversation-item"
                                    onClick={() => {
                                        const existing = conversations.find(
                                            (conversation) =>
                                                String(conversation.id) === String(item.id)
                                        );

                                        if (existing) {
                                            onSelect(existing.id);
                                        } else {
                                            console.warn(
                                                "[SEARCH] Result not in conversations:",
                                                item
                                            );
                                        }
                                    }}
                                >
                                    <div className={`conversation-avatar ${
                                        Number(item.type) === 1 ? "group-avatar" : ""
                                    }`}>
                                        {Number(item.type) === 1 ? (
                                            <Users size={23} />
                                        ) : (
                                            <span>
                                                {item.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="conversation-info">
                                        <div className="conversation-name-wrapper">
                                            <h4>{item.name}</h4>
                                            <span className="group-chat-badge">
                                                {Number(item.type) === 1 ? "Group" : "User"}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="empty-conversation">
                                No search results found
                            </div>
                        )}
                    </>
                ) : (
                filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => {
                        const assignedLabel = labels.find(
                            (label) => label.id === conversation.labelId
                        );

                        return (
                            <div
                                key={conversation.id}
                                className="conversation-item-wrapper"
                            >
                                <button
                                    type="button"
                                    className={`conversation-item ${
                                        activeId === conversation.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => onSelect(conversation.id)}
                                >
                                    <div
                                        className={`conversation-avatar ${
                                            Number(conversation.type) === 1 ? "group-avatar" : ""
                                        }`}
                                    >
                                        {Number(conversation.type) === 1 ? (
                                            <Users size={23} />
                                        ) : (
                                            <img
                                                src={conversation.avatar}
                                                alt={conversation.name}
                                            />
                                        )}

                                        {Number(conversation.type) === 0 &&
                                            conversation.status === "online" && (
                                                <span className="online-indicator"></span>
                                            )}
                                    </div>

                                    <div className="conversation-info">
                                        <div className="conversation-top">
                                            <div className="conversation-name-wrapper">
                                                <h4>{conversation.name}</h4>

                                                {Number(conversation.type) === 1 && (
                                                    <span className="group-chat-badge">
                                                        <Users size={12} />
                                                        Group
                                                    </span>
                                                )}
                                            </div>
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

                                        {assignedLabel && (
                                            <span
                                                className="conversation-label-badge"
                                                style={{
                                                    "--label-color": assignedLabel.color,
                                                }}
                                            >
                                                <span className="conversation-label-dot"></span>
                                                {assignedLabel.name}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className="conversation-label-action"
                                    title="Gán nhãn"
                                    onClick={() =>
                                        setOpenLabelConversationId((prev) =>
                                            prev === conversation.id
                                                ? null
                                                : conversation.id
                                        )
                                    }
                                >
                                    <Tag size={16} />
                                </button>

                                {openLabelConversationId === conversation.id && (
                                    <div className="conversation-label-menu">
                                        <div className="conversation-label-menu-title">
                                            Chọn nhãn
                                        </div>

                                        <button
                                            type="button"
                                            className="conversation-label-option"
                                            onClick={() => {
                                                onAssignLabel(conversation.id, null);
                                                setOpenLabelConversationId(null);
                                            }}
                                        >
                                            Không có nhãn
                                        </button>

                                        {labels.map((label) => (
                                            <button
                                                type="button"
                                                key={label.id}
                                                className={`conversation-label-option ${
                                                    conversation.labelId === label.id
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    onAssignLabel(
                                                        conversation.id,
                                                        label.id
                                                    );
                                                    setOpenLabelConversationId(null);
                                                }}
                                            >
                                                <span
                                                    className="conversation-label-dot"
                                                    style={{
                                                        "--label-color": label.color,
                                                    }}
                                                ></span>

                                                {label.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="empty-conversation">
                        No conversations found
                    </div>
                )
                )}
            </div>    

            <div className="conversation-footer">
                <span>{conversations.length} conversations</span>
                <span>WebChat</span>
            </div>

            {showLabelManager && (
                <div
                    className="label-modal-overlay"
                    onClick={() => setShowLabelManager(false)}
                >
                    <div
                        className="label-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="label-modal-header">
                            <div>
                                <h3>Manage labels</h3>
                                <p>
                                    Organize your conversations
                                </p>
                            </div>

                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => setShowLabelManager(false)}
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="label-form"
                            onSubmit={handleSubmitLabel}
                        >
                            <h4>
                                {editingLabel
                                    ? "Edit label"
                                    : "Create new label"}
                            </h4>

                            <input
                                type="text"
                                placeholder="Enter label name..."
                                value={labelName}
                                onChange={(event) => {
                                    setLabelName(event.target.value);
                                    setLabelError("");
                                }}
                                maxLength={30}
                            />

                            <div className="label-color-row">
                                <label htmlFor="label-color">
                                    Label color
                                </label>

                                <input
                                    id="label-color"
                                    type="color"
                                    value={labelColor}
                                    onChange={(event) =>
                                        setLabelColor(event.target.value)
                                    }
                                />
                            </div>

                            {labelError && (
                                <p className="label-error">
                                    {labelError}
                                </p>
                            )}

                            <div className="label-form-actions">
                                {editingLabel && (
                                    <button
                                        type="button"
                                        className="label-cancel-button"
                                        onClick={handleCancelForm}
                                    >
                                        Cancel
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="label-save-button"
                                >
                                    {editingLabel ? "Save changes" : "Create label"}
                                </button>
                            </div>
                        </form>

                        <div className="label-list-header">
                            <h4>Your labels</h4>
                            <span>{labels.length} labels</span>
                        </div>

                        <div className="label-manager-list">
                            {labels.length > 0 ? (
                                labels.map((label) => (
                                    <div
                                        className="label-manager-item"
                                        key={label.id}
                                    >
                                        <div className="label-manager-info">
                                            <span
                                                className="label-color-dot"
                                                style={{
                                                    backgroundColor: label.color,
                                                }}
                                            />

                                            <span>{label.name}</span>
                                        </div>

                                        <div className="label-manager-actions">
                                            <button
                                                type="button"
                                                className="icon-button"
                                                title="Edit label"
                                                onClick={() =>
                                                    handleOpenEditForm(label)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                className="icon-button label-delete-button"
                                                title="Delete label"
                                                onClick={() =>
                                                    handleDeleteLabel(label)
                                                }
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-label-list">
                                    No labels yet. Create your first label.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}

export default ConversationList;
