import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

// Thunks
export const createReview = createAsyncThunk('review/createReview', async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post(`/reviews/${productId}`, reviewData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
});

export const fetchAdminReviews = createAsyncThunk('review/fetchAdminReviews', async (_, { rejectWithValue }) => {
    try {
        const response = await apiClient.get('/admin/reviews');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
});

export const deleteReview = createAsyncThunk('review/deleteReview', async (id, { rejectWithValue }) => {
    try {
        await apiClient.delete(`/admin/reviews/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
});

const initialState = {
    reviews: [],
    adminReviews: [],
    loading: false,
    error: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Review
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Admin
            .addCase(fetchAdminReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.adminReviews = action.payload;
            })
            .addCase(fetchAdminReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.adminReviews = state.adminReviews.filter(r => r.id !== action.payload);
            });
    }
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
