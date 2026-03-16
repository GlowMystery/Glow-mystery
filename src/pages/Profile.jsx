import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../features/authSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaCamera, FaLock } from 'react-icons/fa';

const Profile = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
    });

    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                const data = await dispatch(fetchProfile()).unwrap();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    password: ''
                });
                if (data.profileImage) setImagePreview(data.profileImage);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        loadProfile();
    }, [isAuthenticated, navigate, dispatch]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('email', formData.email);
        submitData.append('phone', formData.phone);
        submitData.append('address', formData.address);
        if (formData.password) submitData.append('password', formData.password);
        if (profileImage) submitData.append('profileImage', profileImage);

        try {
            const result = await dispatch(updateProfile(submitData)).unwrap();
            if (result.user) {
                toast.success('Profile updated successfully!');
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } catch (err) {
            toast.error(err || 'Server error during update.');
        }
        setLoading(false);
    };

    const firstInitial = formData.name ? formData.name.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <style>{`
                .dashboard-section {
                    padding: 80px 15px; /* Added horizontal padding for mobile */
                    background-color: #000;
                    min-height: 100vh;
                    color: #fff;
                    display: flex;
                    align-items: center;
                }

                .profile-card {
                    background: #0a0a0a;
                    border: 1px solid #333;
                    border-radius: 15px;
                    padding: 30px; /* Responsive padding */
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                /* Avatar Styling */
                .avatar-wrapper {
                    flex-shrink: 0;
                    width: 120px;
                    height: 120px;
                    margin-right: 20px;
                }

                .avatar-main {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #d4af37;
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
                }

                .avatar-initial-bg {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: linear-gradient(145deg, #1a1a1a, #000);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    color: #d4af37;
                    border: 2px solid #d4af37;
                }

                /* Custom Upload Button */
                .upload-btn-custom {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 18px;
                    border: 1px solid #d4af37;
                    border-radius: 8px;
                    color: #d4af37;
                    cursor: pointer;
                    transition: 0.3s;
                    font-weight: 500;
                    background: transparent;
                    white-space: nowrap;
                }

                .upload-btn-custom:hover {
                    background: rgba(212, 175, 55, 0.1);
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
                }

                /* Form Controls */
                .form-label {
                    color: #aaa;
                    font-size: 0.85rem;
                    margin-bottom: 6px;
                    display: block;
                }

                .custom-input {
                    background: #111 !important;
                    border: 1px solid #222 !important;
                    color: #fff !important;
                    border-radius: 8px !important;
                    padding: 12px 15px !important;
                    width: 100%;
                }

                .custom-input:focus {
                    border-color: #d4af37 !important;
                    box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
                    outline: none;
                }

                .custom-input-group {
                    position: relative;
                }

                .input-icon-wrapper {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #d4af37;
                }

                .has-icon {
                    padding-left: 45px !important;
                }

                .btn-save {
                    background: linear-gradient(90deg, #d4af37, #b8860b);
                    border: none;
                    color: #000;
                    font-weight: bold;
                    padding: 14px;
                    border-radius: 8px;
                    margin-top: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    width: 100%;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                }

                .btn-save:active {
                    transform: scale(0.98);
                }

                /* Responsive Breakpoints */
                @media (max-width: 576px) {
                    .dashboard-section {
                        padding: 40px 15px;
                    }

                    .profile-card {
                        padding: 45px 20px ;
                    }

                    .avatar-wrapper {
                        width: 80px;
                        height: 80px;
                        margin-right: 15px;
                    }

                    .avatar-initial-bg {
                        font-size: 2rem;
                    }

                    .upload-btn-custom {
                        font-size: 0.8rem;
                        padding: 8px 12px;
                        gap: 5px;
                    }

                    h5 {
                        font-size: 1rem;
                        margin-bottom: 8px !important;
                    }
                }
            `}</style>

            <section className="dashboard-section">
                <div className="container d-flex justify-content-center">
                    <div className="profile-card">
                        <form onSubmit={handleSubmit}>
                            {/* Avatar Section */}
                            <div className="d-flex align-items-center mb-4">
                                <div className="avatar-wrapper">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="avatar-main" />
                                    ) : (
                                        <div className="avatar-initial-bg">{firstInitial}</div>
                                    )}
                                </div>
                                <div className="avatar-info">
                                    <h5 className="mb-2" style={{fontWeight: '400', color: '#fff'}}>Profile Image</h5>
                                    <label htmlFor="file-upload" className="upload-btn-custom">
                                        <FaCamera /> <span>Upload Photo</span>
                                    </label>
                                    <input 
                                        id="file-upload" 
                                        type="file" 
                                        hidden 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control custom-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control custom-input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control custom-input"
                                        placeholder="+1 234 567 8900"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="col-12 mb-4">
                                    <label className="form-label">New Password (Optional)</label>
                                    <div className="custom-input-group">
                                        <span className="input-icon-wrapper"><FaLock /></span>
                                        <input
                                            type="password"
                                            className="form-control custom-input has-icon"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Profile;