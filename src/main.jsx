import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { store } from "./app/store";
import authService from "./features/auth/services/authService";
import { restoreSession, sessionExpired } from "./store/authSlice";
import App from "./App";

import "./styles/global.css";
import "./styles/common.css";
import "./styles/auth.css";
import "./styles/chat-layout.css";
import "./styles/pages.css";
import "./styles/themes.css";

authService.onSessionExpired?.(() => store.dispatch(sessionExpired()));
if (store.getState().auth.user) store.dispatch(restoreSession());

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);