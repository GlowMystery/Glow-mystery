import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import cartReducer from '../features/cartSlice';
import productReducer from '../features/productSlice';
import orderReducer from '../features/orderSlice';
import reviewReducer from '../features/reviewSlice';
import chatReducer from '../features/chatSlice';
import adminReducer from '../features/adminSlice';
import discountReducer from '../features/discountSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        product: productReducer,
        order: orderReducer,
        review: reviewReducer,
        chat: chatReducer,
        admin: adminReducer,
        discounts: discountReducer,
    },
});
