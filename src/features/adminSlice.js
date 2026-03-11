import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// Thunks
export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin stats');
    }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/admin/users');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
});

export const addUser = createAsyncThunk('admin/addUser', async (userData, { rejectWithValue }) => {
    try {
        const response = await apiClient.post('/admin/users', userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add user');
    }
});

export const updateUserRole = createAsyncThunk('admin/updateUser', async ({ id, userData }, { rejectWithValue }) => {
    try {
        const response = await apiClient.put(`/admin/users/${id}`, userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
    try {
        await apiClient.delete(`/admin/users/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
});

const initialState = {
    stats: { totalEarnings: 0, totalOrders: 0, totalUsers: 0, mostSoldProducts: [] },
    users: [],
    loadingUsers: false,
    loadingStats: false,
    error: null,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchAdminStats.pending, (state) => { state.loadingStats = true; })
            .addCase(fetchAdminStats.fulfilled, (state, action) => {
                state.loadingStats = false;
                state.stats = action.payload;
            })
            .addCase(fetchAdminStats.rejected, (state, action) => {
                state.loadingStats = false;
                state.error = action.payload;
            })
            // Users
            .addCase(fetchUsers.pending, (state) => { state.loadingUsers = true; })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loadingUsers = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loadingUsers = false;
                state.error = action.payload;
            });
    }
});

export default adminSlice.reducer;
