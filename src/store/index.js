import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        settings: settingsReducer,
    },
});
