import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authService from '../features/auth/services/authMockService';

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
export const forgotPassword = asThunk('auth/forgotPassword', (data) => authService.forgotPassword(data));
export const updateProfile = asThunk('auth/updateProfile', (patch, user) => authService.updateProfile(user.id, patch));
export const setUserStatus = asThunk('auth/setUserStatus', (status, user) => authService.setStatus(user.id, status));
export const changePassword = asThunk('auth/changePassword', (data, user) => authService.changePassword(user.id, data));

const initialState = {
    user: authService.getSession(),
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
    },
    extraReducers: (builder) => {
        [login, register, logout, forgotPassword].forEach((thunk) => {
            builder
                .addCase(thunk.pending, (s) => {
                    s.loading = true;
                    s.error = null;
                })
                .addCase(thunk.fulfilled, (s) => {
                    s.loading = false;
                })
                .addCase(thunk.rejected, (s, a) => {
                    s.loading = false;
                    s.error = a.payload;
                });
        });
        builder
            .addCase(login.fulfilled, (s, a) => {
                s.user = a.payload;
            })
            .addCase(register.fulfilled, (s, a) => {
                s.user = a.payload;
            })
            .addCase(logout.fulfilled, (s) => {
                s.user = null;
            });

        [updateProfile, changePassword].forEach((thunk) => {
            builder
                .addCase(thunk.pending, (s) => {
                    s.saving = true;
                })
                .addCase(thunk.fulfilled, (s) => {
                    s.saving = false;
                })
                .addCase(thunk.rejected, (s) => {
                    s.saving = false;
                });
        });
        builder
            .addCase(updateProfile.fulfilled, (s, a) => {
                s.user = a.payload;
            })
            .addCase(setUserStatus.fulfilled, (s, a) => {
                s.user = a.payload;
            });
    },
});

export const { clearAuthFeedback } = authSlice.actions;
export default authSlice.reducer;