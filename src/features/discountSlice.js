import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'https://glow-mystery-backend.vercel.app/api/discounts';
const getToken = () => localStorage.getItem('token');

export const fetchDiscounts = createAsyncThunk('discounts/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(API, { headers: { Authorization: `Bearer ${getToken()}` } });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch discounts');
    }
});

export const createDiscount = createAsyncThunk('discounts/create', async (discountData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(API, discountData, { headers: { Authorization: `Bearer ${getToken()}` } });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create discount');
    }
});

export const updateDiscount = createAsyncThunk('discounts/update', async ({ id, discountData }, { rejectWithValue }) => {
    try {
        const { data } = await axios.put(`${API}/${id}`, discountData, { headers: { Authorization: `Bearer ${getToken()}` } });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update discount');
    }
});

export const deleteDiscount = createAsyncThunk('discounts/delete', async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${API}/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
        return id;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete discount');
    }
});

const discountSlice = createSlice({
    name: 'discounts',
    initialState: { discounts: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDiscounts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDiscounts.fulfilled, (state, action) => { state.loading = false; state.discounts = action.payload; })
            .addCase(fetchDiscounts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(createDiscount.fulfilled, (state, action) => { state.discounts.unshift(action.payload); })
            .addCase(updateDiscount.fulfilled, (state, action) => {
                const idx = state.discounts.findIndex(d => d.id === action.payload.id);
                if (idx !== -1) state.discounts[idx] = action.payload;
            })
            .addCase(deleteDiscount.fulfilled, (state, action) => {
                state.discounts = state.discounts.filter(d => d.id !== action.payload);
            });
    }
});

export default discountSlice.reducer;
