
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {getPeopleChatMessages, sendPeopleChatMessage,} from "./services/chatSocketService";

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

const hasMessageId = (message) =>
    message.id != null && String(message.id) !== "0";

const getMessageTimestamp = (message) => {
    const date = parseMessageDate(message.createAt);

    return date
        ? date.getTime()
        : Number.POSITIVE_INFINITY;
};

const areSameMessage = (first, second) => {
    if (hasMessageId(first) && hasMessageId(second)) {
        return String(first.id) === String(second.id);
    }

    return (
        first.name === second.name &&
        first.to === second.to &&
        first.mes === second.mes &&
        getMessageTimestamp(first) === getMessageTimestamp(second)
    );
};

const mergeMessages = (currentMessages, newMessages) => {
    const merged = [...currentMessages];

    newMessages.forEach((message) => {
        const duplicateIndex = merged.findIndex((current) =>
            areSameMessage(current, message)
        );

        if (duplicateIndex === -1) {
            merged.push(message);
        } else {
            merged[duplicateIndex] = {
                ...merged[duplicateIndex],
                ...message,
            };
        }
    });

    return merged.sort(
        (first, second) =>
            getMessageTimestamp(first) - getMessageTimestamp(second)
    );
};

export const fetchChatMessages = createAsyncThunk(
    "chat/fetchChatMessages",
    async ({ name, page = 1 }, { rejectWithValue }) => {
        try {
            const messages = await getPeopleChatMessages(name, page);

            return {
                name,
                messages,
                page,
            };
        } catch (error) {
            return rejectWithValue({
                name,
                message:
                    error.message || "Không thể tải lịch sử tin nhắn.",
            });
        }
    }
);

export const sendChatMessage = createAsyncThunk(
    "chat/sendChatMessage",
    async ({ to, mes, name }, { rejectWithValue }) => {
        try {
            const message = await sendPeopleChatMessage(to, mes);
            const responseDate = parseMessageDate(message.createAt);

            return {
                ...message,
                name: message.name || name,
                to: message.to || to,
                mes: message.mes || mes.trim(),
                createAt: responseDate
                    ? responseDate.toISOString()
                    : new Date().toISOString(),
            };
        } catch (error) {
            return rejectWithValue(
                error.message || "Không thể gửi tin nhắn."
            );
        }
    }
);

const chatSlice = createSlice({
    name: "chat",

    initialState: {
        messagesByUser: {},
        loadingByUser: {},
        errorByUser: {},
        pinnedMessagesByUser: {},
        editedMessagesByUser: {},
        deletedMessagesByUser: {},
        sending: false,
        sendError: null,
    },

    reducers: {
        clearChatMessages: (state, action) => {
            const name = action.payload;

            delete state.messagesByUser[name];
            delete state.loadingByUser[name];
            delete state.errorByUser[name];
        },

        receiveChatMessage: (state, action) => {
            const { conversationName, message } = action.payload;

            if (!conversationName || !message) return;

            state.messagesByUser[conversationName] = mergeMessages(
                state.messagesByUser[conversationName] || [],
                [message]
            );
        },

        togglePinMessage: (state, action) => {
            const { conversationName, message } = action.payload;

            if (!conversationName || !message?.id) return;

            const pinnedMessages =
                state.pinnedMessagesByUser[conversationName] || [];

            const isPinned = pinnedMessages.some(
                (item) => String(item.id) === String(message.id)
            );

            if (isPinned) {
                state.pinnedMessagesByUser[conversationName] =
                    pinnedMessages.filter(
                        (item) => String(item.id) !== String(message.id)
                    );
            } else {
                state.pinnedMessagesByUser[conversationName] = [
                    ...pinnedMessages,
                    message,
                ];
            }
        },

        saveEditedMessage: (state, action) => {
            const { conversationName, messageId, content } = action.payload;

            if (
                !conversationName ||
                messageId == null ||
                !content?.trim()
            ) {
                return;
            }

            if (!state.editedMessagesByUser[conversationName]) {
                state.editedMessagesByUser[conversationName] = {};
            }

            state.editedMessagesByUser[conversationName][messageId] = content.trim();

            const pinnedMessages = state.pinnedMessagesByUser[conversationName] || [];

            const pinnedMessage = pinnedMessages.find(
                (item) => String(item.id) === String(messageId)
            );

            if (pinnedMessage) {
                pinnedMessage.content = content.trim();
                pinnedMessage.mes = content.trim();
            }
        },

        deleteMessageForMe: (state, action) => {
            const { conversationName, messageId } = action.payload;

            if (!conversationName || messageId == null) return;

            if (!state.deletedMessagesByUser[conversationName]) {
                state.deletedMessagesByUser[conversationName] = [];
            }

            const deletedIds = state.deletedMessagesByUser[conversationName];

            const alreadyDeleted = deletedIds.some(
                (id) => String(id) === String(messageId)
            );

            if (!alreadyDeleted) {
                deletedIds.push(messageId);
            }

            state.pinnedMessagesByUser[conversationName] = (
                state.pinnedMessagesByUser[conversationName] || []
            ).filter((item) => String(item.id) !== String(messageId));
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchChatMessages.pending, (state, action) => {
                const { name } = action.meta.arg;

                state.loadingByUser[name] = true;
                state.errorByUser[name] = null;
            })

            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                const { name, messages } = action.payload;

                state.loadingByUser[name] = false;
                state.messagesByUser[name] = mergeMessages(
                    state.messagesByUser[name] || [],
                    messages
                );
                state.errorByUser[name] = null;
            })

            .addCase(fetchChatMessages.rejected, (state, action) => {
                const name =
                    action.payload?.name || action.meta.arg.name;

                state.loadingByUser[name] = false;
                state.errorByUser[name] =
                    action.payload?.message ||
                    action.error.message ||
                    "Không thể tải lịch sử tin nhắn.";
            })

            .addCase(sendChatMessage.pending, (state) => {
                state.sending = true;
                state.sendError = null;
            })

            .addCase(sendChatMessage.fulfilled, (state, action) => {
                state.sending = false;
                state.sendError = null;

                const message = action.payload;

                if (!message?.to || !message?.mes) return;

                const conversationName = message.to;

                state.messagesByUser[conversationName] = mergeMessages(
                    state.messagesByUser[conversationName] || [],
                    [message]
                );
            })

            .addCase(sendChatMessage.rejected, (state, action) => {
                state.sending = false;
                state.sendError =
                    action.payload || "Không thể gửi tin nhắn.";
            });
    },
});

export const {
    clearChatMessages,
    receiveChatMessage,
    togglePinMessage,
    saveEditedMessage,
    deleteMessageForMe,
} = chatSlice.actions;

export default chatSlice.reducer;
