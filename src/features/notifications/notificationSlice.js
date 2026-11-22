import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import notificationService from "./services/notificationService";
import { logout, restoreSession, sessionExpired } from "../../store/authSlice";

const toMessage = (err) => err?.message || "Something went wrong. Try again.";
const usernameOf = (getState) => getState().auth.user?.username;

export const fetchNotifications = createAsyncThunk(
    "notifications/fetch",
    async (_, { signal, getState, rejectWithValue }) => {
        try {
            const username = usernameOf(getState);
            if (!username) return [];
            return await notificationService.fetchNotifications({ signal, username });
        } catch (err) {
            return rejectWithValue(toMessage(err));
        }
    }
);

export const addNotification = createAsyncThunk(
    "notifications/add",
    async (notification, { getState, rejectWithValue }) => {
        try {
            const username = usernameOf(getState);
            if (!username) return null;
            return await notificationService.addNotification(notification, { username });
        } catch (err) {
            return rejectWithValue(toMessage(err));
        }
    }
);

export const markAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (id, { getState, rejectWithValue }) => {
        try {
            return await notificationService.markAsRead(id, { username: usernameOf(getState) });
        } catch (err) {
            return rejectWithValue(toMessage(err));
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { getState, rejectWithValue }) => {
        try {
            return await notificationService.markAllAsRead({ username: usernameOf(getState) });
        } catch (err) {
            return rejectWithValue(toMessage(err));
        }
    }
);

const initialState = {
    items: [],
    status: "idle",
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearNotificationError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.status = "failed";
                state.error = action.payload ?? action.error.message;
            })
            .addCase(addNotification.fulfilled, (state, action) => {
                const saved = action.payload;
                if (!saved) return;
                state.items = [saved, ...state.items.filter((n) => n.id !== saved.id)];
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const item = state.items.find((n) => n.id === action.payload);
                if (item) item.read = true;
            })
            .addCase(markAsRead.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach((n) => {
                    n.read = true;
                });
            })
            .addCase(markAllAsRead.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, () => initialState)
            .addCase(sessionExpired, () => initialState)
            .addCase(restoreSession.rejected, () => initialState);
    },
});

export const { clearNotificationError } = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;