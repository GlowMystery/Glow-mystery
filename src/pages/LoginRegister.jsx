import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../features/authSlice';
import Loader from '../components/Loader';

const LoginRegister = () => {
    const [activeTab, setActiveTab] = useState('login');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regError, setRegError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const result = await dispatch(loginUser({ email: loginEmail, password: loginPassword })).unwrap();
            if (result.user?.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setLoginError(err || 'Server error');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegError('');
        try {
            await dispatch(registerUser({ name: regName, email: regEmail, password: regPassword })).unwrap();
            localStorage.setItem('pendingVerificationEmail', regEmail);
            navigate('/verify-otp');
        } catch (err) {
            setRegError(err || 'Server error');
        }
    };

    return (
        <>
            <style>{`
                .auth-section { min-height: 100vh; padding-top: 120px; padding-bottom: 60px; background: url("/bgimg.png") no-repeat center center/cover; position: relative; display: flex; align-items: center; }
                .auth-section::before { content: ""; position: absolute; inset: 0; background: rgba(5, 5, 5, 0.85); backdrop-filter: blur(5px); }
                .auth-card { background: rgba(20, 20, 20, 0.7); border: 1px solid rgba(216, 166, 72, 0.3); border-radius: 12px; padding: 40px; backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); position: relative; z-index: 2; }
                .auth-card h3 { font-family: var(--font-heading); color: var(--gold-light); margin-bottom: 30px; text-align: center; }
                .form-control { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(216, 166, 72, 0.2); color: #fff; border-radius: 4px; }
                .form-control:focus { background: rgba(255, 255, 255, 0.1); border-color: var(--gold-primary); color: #fff; box-shadow: 0 0 0 0.25rem rgba(216, 166, 72, 0.25); }
                .nav-tabs .nav-link { color: rgba(255, 255, 255, 0.7); border: none; font-family: var(--font-body); font-weight: 600; background: transparent; cursor: pointer; }
                .nav-tabs .nav-link.active { background: transparent; color: var(--gold-primary); border-bottom: 2px solid var(--gold-primary); }
                .nav-tabs { border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; justify-content: center; }
            `}</style>
            <section className="auth-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="auth-card">
                                <ul className="nav nav-tabs" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')} type="button" role="tab">Login</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')} type="button" role="tab">Register</button>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    {activeTab === 'login' && (
                                        <div className="tab-pane fade show active">
                                            <h3>Welcome Back</h3>
                                            {loginError && <div className="alert alert-danger" role="alert">{loginError}</div>}
                                            <form onSubmit={handleLogin}>
                                                <div className="mb-3">
                                                    <label className="form-label text-white-50">Email Address</label>
                                                    <input type="email" className="form-control" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50">Password</label>
                                                    <input type="password" className="form-control" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                                                </div>
                                                <div className="mb-3 text-end">
                                                    <Link to="/forgot-password" className="text-gold text-decoration-none small">Forgot Password?</Link>
                                                </div>
                                                {loading && <Loader overlay={true} text="Signing in..." />}
                                                <button type="submit" className="btn btn-gold w-100" disabled={loading}>Sign In</button>
                                            </form>
                                        </div>
                                    )}

                                    {activeTab === 'register' && (
                                        <div className="tab-pane fade show active">
                                            <h3>Create Account</h3>
                                            {regError && <div className="alert alert-danger" role="alert">{regError}</div>}
                                            <form onSubmit={handleRegister}>
                                                <div className="mb-3">
                                                    <label className="form-label text-white-50">Full Name</label>
                                                    <input type="text" className="form-control" value={regName} onChange={e => setRegName(e.target.value)} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label text-white-50">Email Address</label>
                                                    <input type="email" className="form-control" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="form-label text-white-50">Password</label>
                                                    <input type="password" className="form-control" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                                                </div>
                                                {loading && <Loader overlay={true} text="Creating account..." />}
                                                <button type="submit" className="btn btn-gold w-100" disabled={loading}>Sign Up</button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LoginRegister;
