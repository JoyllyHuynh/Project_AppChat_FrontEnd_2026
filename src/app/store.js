import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../features/notifications/notificationSlice";

import authReducer from "../store/authSlice";
import userReducer from "../features/user/userSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        chat: chatReducer,
        notifications: notificationReducer
    }
});