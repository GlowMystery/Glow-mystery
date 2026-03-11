import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// Thunks
export const fetchUserOrders = createAsyncThunk('order/fetchUserOrders', async (params, { rejectWithValue }) => {
    try {
        const queryParams = new URLSearchParams(params || {}).toString();
        const response = await apiClient.get(`/orders/myorders?${queryParams}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user orders');
    }
});

export const fetchAdminOrders = createAsyncThunk('order/fetchAdminOrders', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/orders');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin orders');
    }
});

export const fetchOrderDetails = createAsyncThunk('order/fetchOrderDetails', async (orderId, { rejectWithValue }) => {
    try {
        const response = await apiClient.get(`/orders/myorders/${orderId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
});

export const updateOrderStatus = createAsyncThunk('order/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
    try {
        const response = await apiClient.put(`/orders/${orderId}/deliver`, { status });
        return { orderId, status: response.data.status || status };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
});

export const requestReturn = createAsyncThunk('order/requestReturn', async ({ orderId, formData }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post(`/orders/${orderId}/return`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to submit return request');
    }
});

export const updateReturnStatus = createAsyncThunk('order/updateReturnStatus', async ({ returnId, status, adminReason }, { rejectWithValue }) => {
    try {
        const response = await apiClient.put(`/orders/return/${returnId}/status`, { status, adminReason });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update return status');
    }
});


const initialState = {
    orders: [],
    adminOrders: [],
    currentOrder: null,
    pagination: { page: 1, totalPages: 1 },
    loading: false,
    error: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Orders
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders || [];
                state.pagination = action.payload.pagination || { page: 1, totalPages: 1 };
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.orders = [];
            })
            // Fetch Admin Orders
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.adminOrders = action.payload;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Order Details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentOrder = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Order Status (Admin)
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, status } = action.payload;
                const order = state.adminOrders.find(o => o.id === orderId);
                if (order) {
                    order.status = status;
                }
            })
            // Update Return Status (Admin)
            .addCase(updateReturnStatus.fulfilled, (state, action) => {
                // Return payload usually has the updated order or return request
                // Since our components re-fetch, this can be largely ignored,
                // but if we want to mutate state, we'd do it here.
            });
    }
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
