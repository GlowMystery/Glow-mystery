import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, toggleChat, setChatOpen } from '../features/chatSlice';
import { io } from 'socket.io-client';

const ChatWidget = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { messages, isOpen } = useSelector((state) => state.chat);
    const dispatch = useDispatch();
    const [inputVal, setInputVal] = useState('');
    const chatBodyRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            socketRef.current = io('https://glow-mystery-backend.vercel.app/');

            if (user.role === 'ADMIN') {
                socketRef.current.emit('join_admin_room');
            } else {
                socketRef.current.emit('join_user_room', user.id);
            }

            socketRef.current.on('receive_message', (data) => {
                dispatch(addMessage(data));
            });

            return () => {
                socketRef.current.disconnect();
            };
        }
    }, [isAuthenticated, user, dispatch]);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (inputVal.trim() && socketRef.current) {
            const msgData = {
                senderId: user.id,
                content: inputVal.trim(),
                role: user.role
            };
            socketRef.current.emit('send_message', msgData);
            setInputVal('');
        }
    };

    if (!isAuthenticated || !user) return null;

    return (
        <>
            <button
                id="chatToggle"
                className="btn btn-gold rounded-circle shadow"
                style={{ position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', zIndex: 1040 }}
                onClick={() => dispatch(toggleChat())}
            >
                <i className="bi bi-chat-dots fs-3"></i>
            </button>

            <div
                id="chatWindow"
                className="card shadow-lg"
                style={{
                    position: 'fixed', bottom: '90px', right: '20px', width: '350px', zIndex: 1040,
                    display: isOpen ? 'block' : 'none',
                    background: 'rgba(20, 20, 20, 0.95)', border: '1px solid var(--gold-primary)'
                }}
            >
                <div className="card-header bg-dark text-gold d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--gold-primary)' }}>
                    <h5 className="mb-0" style={{ fontFamily: 'var(--font-heading)' }}><i className="bi bi-headset me-2"></i>Support</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => dispatch(setChatOpen(false))}></button>
                </div>
                <div className="card-body" ref={chatBodyRef} style={{ height: '300px', overflowY: 'auto' }}>
                    <div className="text-center text-white-50 mt-5 w-100">
                        <small>Welcome to Glow Mystery Support.<br />How can we help you today?</small>
                    </div>
                    {messages.map((m, idx) => {
                        const isMe = m.senderId === user.id;
                        return (
                            <div key={idx} className={`mb-2 ${isMe ? 'text-end' : 'text-start'}`}>
                                <div className={`d-inline-block px-3 py-2 rounded ${isMe ? 'bg-gold text-dark' : 'bg-secondary text-white'}`} style={{ maxWidth: '80%' }}>
                                    {m.content}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="card-footer bg-dark" style={{ borderTop: '1px solid var(--gold-primary)' }}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            placeholder="Type a message..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="btn btn-gold" onClick={handleSend}><i className="bi bi-send"></i></button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;
