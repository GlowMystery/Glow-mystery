import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:8000/api/wishlist'; // Local backend

// Async thunks
export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.token || localStorage.getItem('token');
            if (!token) return [];

            const config = { headers: { 'x-auth-token': token } };
            const response = await axios.get(API_URL, config);
            return response.data; // array of WishlistItem
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching wishlist');
        }
    }
);

export const toggleWishlist = createAsyncThunk(
    'wishlist/toggleWishlist',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.token || localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to use wishlist');
                return rejectWithValue('Not logged in');
            }

            const config = { headers: { 'x-auth-token': token } };
            const response = await axios.post(`${API_URL}/toggle`, { productId }, config);

            // Toast feedback
            if (response.data.action === 'added') {
                toast.success(response.data.message);
            } else {
                toast.info(response.data.message);
            }

            return { productId, action: response.data.action, item: response.data.item };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error toggling wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch List
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload; // array of WishlistItems objects with `.product` and `.productId`
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle Item
            .addCase(toggleWishlist.pending, (state) => {
                state.error = null;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                if (action.payload.action === 'added') {
                    state.items.push(action.payload.item);
                } else if (action.payload.action === 'removed') {
                    state.items = state.items.filter(item => item.productId !== action.payload.productId);
                }
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItemsList = (state) => state.wishlist.items;
export const selectIsItemInWishlist = (state, productId) => {
    return state.wishlist.items.some(item => Number(item.productId) === Number(productId));
};

export default wishlistSlice.reducer;
