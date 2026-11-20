import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../features/auth/services/authService.js';

const asThunk = (type, fn) =>
    createAsyncThunk(type, async (arg, { getState, rejectWithValue }) => {
        try {
            return await fn(arg, getState().auth.user);
        } catch (err) {
            return rejectWithValue(err.message || 'Something went wrong. Try again.');
        }
    });

export const login = asThunk('auth/login', (data) => authService.login(data));
export const register = asThunk('auth/register', (data) => authService.register(data));
export const logout = asThunk('auth/logout', () => authService.logout());
export const restoreSession = asThunk('auth/restoreSession', () => authService.restoreSession());
export const updateProfile = asThunk('auth/updateProfile', (patch, user) => authService.updateProfile(user.id, patch));
export const setUserStatus = asThunk('auth/setUserStatus', (status, user) => authService.setStatus(user.id, status));
export const changePassword = asThunk('auth/changePassword', (data, user) => authService.changePassword(user.id, data));

const initialUser = authService.getSession();
const initialState = {
    user: initialUser,
    initializing: Boolean(initialUser),
    loading: false,
    saving: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthFeedback(state) {
            state.error = null;
        },
        sessionExpired(state) {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        [login, register, logout].forEach((thunk) => {
            builder
                .addCase(thunk.pending, (s) => {
                    s.loading = true;
                    s.error = null;
                })
                .addCase(thunk.rejected, (s, a) => {
                    s.loading = false;
                    s.error = a.payload;
                });
        });

        [updateProfile, changePassword].forEach((thunk) => {
            builder
                .addCase(thunk.pending, (s) => {
                    s.saving = true;
                })
                .addCase(thunk.rejected, (s) => {
                    s.saving = false;
                });
        });

        builder
            .addCase(login.fulfilled, (s, a) => {
                s.loading = false;
                s.user = a.payload;
            })
            .addCase(register.fulfilled, (s, a) => {
                s.loading = false;
                s.user = a.payload;
            })
            .addCase(logout.fulfilled, (s) => {
                s.loading = false;
                s.user = null;
            })
            .addCase(restoreSession.pending, (s) => {
                s.initializing = true;
                s.error = null;
            })
            .addCase(restoreSession.fulfilled, (s, a) => {
                s.initializing = false;
                s.user = a.payload;
            })
            .addCase(restoreSession.rejected, (s, a) => {
                s.initializing = false;
                s.user = null;
                s.error = a.payload;
            })
            .addCase(updateProfile.fulfilled, (s, a) => {
                s.saving = false;
                s.user = a.payload;
            })
            .addCase(changePassword.fulfilled, (s) => {
                s.saving = false;
            })
            .addCase(setUserStatus.fulfilled, (s, a) => {
                s.user = a.payload;
            });
    },
});

export const { clearAuthFeedback, sessionExpired } = authSlice.actions;
export default authSlice.reducer;