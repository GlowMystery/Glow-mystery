import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    messages: [],
    isOpen: false,
    isConnected: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setChatOpen: (state, action) => {
            state.isOpen = action.payload;
        },
        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
        },
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
});

export const { addMessage, setChatOpen, toggleChat, setConnected, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
