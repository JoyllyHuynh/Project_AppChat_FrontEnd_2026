import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notificationService from './services/notificationService';

const toMessage = (err) => err?.message || 'Something went wrong. Try again.';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { signal, rejectWithValue }) => {
    try {
        return await notificationService.fetchNotifications({ signal });
    } catch (err) {
        return rejectWithValue(toMessage(err));
    }
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id, { rejectWithValue }) => {
    try {
        return await notificationService.markAsRead(id);
    } catch (err) {
        return rejectWithValue(toMessage(err));
    }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
    try {
        return await notificationService.markAllAsRead();
    } catch (err) {
        return rejectWithValue(toMessage(err));
    }
});

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification(state, { payload }) {
            state.items.unshift({ id: `n_${Date.now()}`, read: false, createdAt: new Date().toISOString(), ...payload });
        },
        clearNotificationError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.status = 'failed';
                state.error = action.payload ?? action.error.message;
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
            });
    },
});

export const { addNotification, clearNotificationError } = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;