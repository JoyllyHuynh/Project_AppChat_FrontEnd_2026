import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { userService } from "../../services/userService";
import { getUserList } from "./services/userSocketService";

export const fetchUsers = createAsyncThunk(
    "user/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            return await getUserList();
        } catch (error) {
            return rejectWithValue(
                error.message || "Không thể tải danh sách người dùng."
            );
        }
    }
);

export const searchServerUsers = createAsyncThunk(
    "user/searchServerUsers",
    async (_, { rejectWithValue }) => {
        try {
            return await getUserList();
        } catch (error) {
            return rejectWithValue(
                error.message || "Unable to search users and rooms."
            );
        }
    }
);

export const fetchFriends = createAsyncThunk(
    "user/fetchFriends",
    async (_, { rejectWithValue }) => {
        try {
            return await userService.getFriends();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const searchUsers = createAsyncThunk(
    "user/searchUsers",
    async (keyword, { rejectWithValue }) => {
        try {
            return await userService.searchUsers(keyword);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: "user",

    initialState: {
        users: [],
        usersLoading: false,

        friends: [],
        friendsLoading: false,

        searchResults: [],
        searchLoading: false,

        serverSearchResults: [],
        serverSearchLoading: false,
        serverSearchError: null,

        selectedUserProfile: null,
        error: null,
    },

    reducers: {
        setSelectedUserProfile: (state, action) => {
            state.selectedUserProfile = action.payload;
        },

        clearSearchResults: (state) => {
            state.searchResults = [];
        },
    },

    
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.usersLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.usersLoading = false;
                state.error = action.payload;
            })

            .addCase(fetchFriends.pending, (state) => {
                state.friendsLoading = true;
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.friendsLoading = false;
                state.friends = action.payload;
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.friendsLoading = false;
                state.error = action.payload;
            })

            .addCase(searchUsers.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchUsers.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload;
            })

            .addCase(searchServerUsers.pending, (state) => {
                state.serverSearchLoading = true;
                state.serverSearchError = null;
            })
            .addCase(searchServerUsers.fulfilled, (state, action) => {
                state.serverSearchLoading = false;
                state.serverSearchResults = action.payload;
            })
            .addCase(searchServerUsers.rejected, (state, action) => {
                state.serverSearchLoading = false;
                state.serverSearchError = action.payload;
            });
    },
});

export const {
    setSelectedUserProfile,
    clearSearchResults,
} = userSlice.actions;

export default userSlice.reducer;