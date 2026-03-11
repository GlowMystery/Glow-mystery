import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp } from '../features/authSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const VerifyOtp = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (!pendingEmail) {
            navigate('/login');
        } else {
            setEmail(pendingEmail);
        }
    }, [navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(verifyOtp({ email, otp })).unwrap();

            if (result.message && result.message.includes('successfully')) {
                toast.success('Email verified successfully! You can now log in.');
                localStorage.removeItem('pendingVerificationEmail');
                navigate('/login');
            } else {
                setError(result.message || 'Verification failed');
            }
        } catch (err) {
            setError(err || 'Server error during verification');
        }
        setLoading(false);
    };

    return (
        <>
            <style>{`
                .auth-section { min-height: 100vh; padding-top: 120px; padding-bottom: 60px; background: url("/bgimg.png") no-repeat center center/cover; position: relative; display: flex; align-items: center; }
                .auth-section::before { content: ""; position: absolute; inset: 0; background: rgba(5, 5, 5, 0.85); backdrop-filter: blur(5px); }
                .auth-card { background: rgba(20, 20, 20, 0.7); border: 1px solid rgba(216, 166, 72, 0.3); border-radius: 12px; padding: 40px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); position: relative; z-index: 2; }
                .auth-card h3 { font-family: var(--font-heading); color: var(--gold-light); margin-bottom: 20px; text-align: center; }
                .form-control { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(216, 166, 72, 0.2); color: #fff; border-radius: 4px; }
                .form-control:focus { background: rgba(255, 255, 255, 0.1); border-color: var(--gold-primary); color: #fff; box-shadow: 0 0 0 0.25rem rgba(216, 166, 72, 0.25); }
                .letter-spacing-2 { letter-spacing: 0.5em; }
            `}</style>
            <section className="auth-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="auth-card">
                                <h3>Verify Your Email</h3>
                                <p className="text-white-50 text-center mb-4">We've sent a 6-digit code to <strong className="text-light">{email}</strong>. Please enter it below to create your account.</p>

                                {error && <div className="alert alert-danger" role="alert">{error}</div>}

                                <form onSubmit={handleVerify}>
                                    <div className="mb-4">
                                        <label className="form-label text-white-50">6-Digit OTP</label>
                                        <input type="text" className="form-control text-center fs-4 letter-spacing-2" maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} required />
                                    </div>
                                    {loading && <Loader overlay={true} text="Verifying OTP..." />}
                                    <button type="submit" className="btn btn-gold w-100" disabled={loading}>
                                        Complete Registration
                                    </button>
                                </form>
                                <div className="text-center mt-3">
                                    <Link to="/login" className="text-white-50 text-decoration-none small">Back to Login</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default VerifyOtp;
