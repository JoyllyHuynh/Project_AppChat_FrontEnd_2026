import { createSelector, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_SETTINGS } from "./settingsConfig";
import { loadAllSettings, removeSettings, saveSettings } from "./services/settingsStorage";

const initialState = {
    byUser: loadAllSettings(),
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        settingChanged(state, { payload }) {
            const { username, key, value } = payload;
            state.byUser[username] = { ...state.byUser[username], [key]: value };
        },
        settingsReset(state, { payload }) {
            delete state.byUser[payload.username];
        },
    },
});

const { settingChanged, settingsReset } = settingsSlice.actions;

const selectByUser = (state) => state.settings.byUser;
const selectUsername = (state) => state.auth.user?.username;

export const selectSettings = createSelector([selectByUser, selectUsername], (byUser, username) => ({
    ...DEFAULT_SETTINGS,
    ...(username ? byUser[username] : undefined),
}));

export const toggleSetting = (key) => (dispatch, getState) => {
    if (!(key in DEFAULT_SETTINGS)) return;

    const username = selectUsername(getState());
    if (!username) return;

    const current = selectSettings(getState())[key];
    dispatch(settingChanged({ username, key, value: !current }));
    saveSettings(username, selectSettings(getState()));
};

export const resetSettings = () => (dispatch, getState) => {
    const username = selectUsername(getState());
    if (!username) return;

    dispatch(settingsReset({ username }));
    removeSettings(username);
};

export default settingsSlice.reducer;