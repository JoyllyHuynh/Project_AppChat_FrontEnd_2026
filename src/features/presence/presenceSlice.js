import { createSlice } from "@reduxjs/toolkit";
import { logout, restoreSession, sessionExpired } from "../../store/authSlice";

const initialState = { byUser: {} };

const presenceSlice = createSlice({
    name: "presence",
    initialState,
    reducers: {
        presenceUpdated(state, { payload }) {
            state.byUser[payload.name] = payload.online;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logout.fulfilled, () => initialState)
            .addCase(sessionExpired, () => initialState)
            .addCase(restoreSession.rejected, () => initialState);
    },
});

export const { presenceUpdated } = presenceSlice.actions;

export default presenceSlice.reducer;