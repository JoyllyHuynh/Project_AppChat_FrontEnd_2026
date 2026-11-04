import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "../features/notifications/notificationSlice";

import authReducer from "../store/authSlice";
import userReducer from "../features/user/userSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        notifications: notificationReducer
    }
});