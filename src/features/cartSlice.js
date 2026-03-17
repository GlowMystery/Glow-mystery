import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/apiClient';

export const checkoutCart = createAsyncThunk('cart/checkoutCart', async (checkoutData, { rejectWithValue }) => {
    try {
        const { orderItems, totalAmount } = checkoutData;

        // 1. Create order in DB
        const orderRes = await apiClient.post('/orders', { orderItems, totalAmount });
        const orderData = orderRes.data;

        // 2. Create Razorpay order
        const checkoutRes = await apiClient.post('/payments/create-checkout-session', {
            orderItems,
            orderId: orderData.id,
        });

        const rzpData = checkoutRes.data; // { id, amount, currency, orderId }

        // 3. Open Razorpay Modal
        return new Promise((resolve, reject) => {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SPaPgXRq8uN8Nu',
                amount: rzpData.amount,
                currency: rzpData.currency,
                name: "Glow Mystery",
                description: "Premium Skincare Products",
                order_id: rzpData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await apiClient.post('/payments/verify-session', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: rzpData.orderId,
                        });
                        resolve({ success: true, orderId: rzpData.orderId, verifyRes: verifyRes.data });
                    } catch (err) {
                        await apiClient.delete(`/orders/${rzpData.orderId}/pending`).catch(e => console.error(e));
                        reject(rejectWithValue(err.response?.data?.message || 'Payment Verification Failed'));
                    }
                },
                theme: { color: "#d8a648" },
                modal: {
                    ondismiss: async function () {
                        await apiClient.delete(`/orders/${rzpData.orderId}/pending`).catch(e => console.error(e));
                        reject(rejectWithValue('Payment cancelled by user'));
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', async function (response) {
                await apiClient.delete(`/orders/${rzpData.orderId}/pending`).catch(e => console.error(e));
                reject(rejectWithValue(response.error.description));
            });
            rzp.open();
        });
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Error processing checkout');
    }
});

const sanitizeCart = (cartItems) => {
    if (!Array.isArray(cartItems)) return [];
    return cartItems.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
    })).filter(item => item.productId);
};

const initialState = {
    items: sanitizeCart(JSON.parse(localStorage.getItem('cart')) || []),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existing = state.items.find(i => Number(i.productId) === Number(action.payload.productId));
            if (existing) {
                // If it already exists, we do nothing to quantity (as per user request: "show already into cart popup")
                // Keep stock updated in case it changed
                existing.stock = action.payload.stock;
            } else {
                state.items.push({ ...action.payload });
            }
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(i => i.productId !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const existing = state.items.find(i => i.productId === productId);
            if (existing) {
                // Determine max allowed stock, fallback to Infinity if undefined for older cart items
                const maxStock = existing.stock !== undefined ? existing.stock : Infinity;
                existing.quantity = quantity > maxStock ? maxStock : quantity;
            }
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem('cart');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkoutCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkoutCart.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(checkoutCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
export const selectCartTotal = (state) => state.cart.items.reduce((acc, item) => acc + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)), 0);
export const selectCartCount = (state) => state.cart.items.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
export const selectIsItemInCart = (state, productId) => state.cart.items.some(item => item.productId === productId);
