import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../features/cartSlice';
import apiClient from '../api/apiClient';

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const dispatch = useDispatch();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        dispatch(clearCart());
        setVerifying(false);
    }, [dispatch]);

    return (
        <>
            <style>{`
        .success-section { padding-top: 140px; padding-bottom: 60px; min-height: 80vh; background: var(--bg-dark); display: flex; align-items: center; justify-content: center; }
        .success-card { background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(216, 166, 72, 0.3); border-radius: 16px; padding: 50px; text-align: center; max-width: 600px; width: 100%; }
        .success-icon { font-size: 5rem; color: var(--gold-primary); margin-bottom: 20px; animation: bounce 2s ease infinite; }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); } }
        .success-title { font-family: var(--font-heading); color: var(--gold-light); font-size: 2.5rem; margin-bottom: 15px; }
        .success-text { color: rgba(255, 255, 255, 0.8); margin-bottom: 30px; font-size: 1.1rem; }
      `}</style>
            <section className="success-section">
                <div className="container d-flex justify-content-center">
                    <div className="success-card">
                        <i className="bi bi-check-circle-fill success-icon"></i>
                        <h1 className="success-title">Payment Successful!</h1>
                        <p className="success-text">Thank you for your purchase. Your order has been placed successfully and we will begin processing it right away.</p>
                        {orderId && (
                            <p className="text-white-50 mb-4">Order ID: <span className="text-gold">#{orderId}</span></p>
                        )}
                        <div className="d-flex justify-content-center gap-3">
                            <Link to="/dashboard" className="btn btn-gold">View Order History</Link>
                            <Link to="/shop" className="btn btn-outline-light">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Success;
