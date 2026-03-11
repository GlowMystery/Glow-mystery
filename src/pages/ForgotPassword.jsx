import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { requestPasswordReset, resetPassword } from '../features/authSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await dispatch(requestPasswordReset(email)).unwrap();
            if (result.message && result.message.includes('successfully')) {
                setStep(2);
                setAlertInfo({ show: false, type: '', message: '' });
            } else {
                setAlertInfo({ show: true, type: 'danger', message: result.message || 'Error requesting OTP' });
            }
        } catch (err) {
            setAlertInfo({ show: true, type: 'danger', message: err || 'Server error' });
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await dispatch(resetPassword({ email, otp, newPassword })).unwrap();
            if (result.message && result.message.includes('successful')) {
                toast.success('Password has been reset successfully. You can now login.');
                navigate('/login');
            } else {
                setAlertInfo({ show: true, type: 'danger', message: result.message || 'Failed to reset password' });
            }
        } catch (err) {
            setAlertInfo({ show: true, type: 'danger', message: err || 'Server error' });
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
      `}</style>
            <section className="auth-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="auth-card">

                                {alertInfo.show && (
                                    <div className={`alert alert-${alertInfo.type}`} role="alert">{alertInfo.message}</div>
                                )}

                                {step === 1 ? (
                                    <div>
                                        <h3>Forgot Password</h3>
                                        <p className="text-white-50 text-center mb-4">Enter your email address to receive a password reset OTP.</p>
                                        <form onSubmit={handleRequestOtp}>
                                            <div className="mb-4">
                                                <label className="form-label text-white-50">Email Address</label>
                                                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                                            </div>
                                            {loading && <Loader overlay={true} text="Sending OTP..." />}
                                            <button type="submit" className="btn btn-gold w-100" disabled={loading}>Send OTP</button>
                                        </form>
                                        <div className="text-center mt-3">
                                            <Link to="/login" className="text-white-50 text-decoration-none small"><i className="bi bi-arrow-left me-1"></i>Back to Login</Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3>Reset Password</h3>
                                        <p className="text-white-50 text-center mb-4">Check your email for the 6-digit code.</p>
                                        <form onSubmit={handleResetPassword}>
                                            <div className="mb-3">
                                                <label className="form-label text-white-50">6-Digit OTP</label>
                                                <input type="text" className="form-control text-center fs-4 letter-spacing-2" maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} required />
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label text-white-50">New Password</label>
                                                <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                            </div>
                                            {loading && <Loader overlay={true} text="Resetting password..." />}
                                            <button type="submit" className="btn btn-gold w-100" disabled={loading}>Update Password</button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ForgotPassword;
