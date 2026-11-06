
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {getPeopleChatMessages, sendPeopleChatMessage,} from "./services/chatSocketService";

const hasMessageId = (message) =>
    message.id != null && String(message.id) !== "0";

const getMessageTimestamp = (message) => {
    const value = message.createAt;
    const timestamp =
        typeof value === "number"
            ? value
            : new Date(
                typeof value === "string" ? value.replace(" ", "T") : value
            ).getTime();

    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
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
            const responseDate = message.createAt == null
                ? null
                : new Date(
                    typeof message.createAt === "string"
                        ? message.createAt.replace(" ", "T")
                        : message.createAt
                );

            return {
                ...message,
                name: message.name || name,
                to: message.to || to,
                mes: message.mes || mes.trim(),
                createAt:
                    responseDate && !Number.isNaN(responseDate.getTime())
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
} = chatSlice.actions;

export default chatSlice.reducer;
