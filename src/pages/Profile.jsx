import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../features/authSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, token, isAuthenticated } = useSelector((state) => state.auth);
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
                if (data.profileImage) {
                    setImagePreview(data.profileImage);
                }
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
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
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
            } else {
                toast.error(result.message || 'Failed to update profile.');
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
                .dashboard-section { padding-top: 140px; padding-bottom: 60px; min-height: 80vh; background: var(--bg-dark); }
                .dashboard-header { font-family: var(--font-heading); color: var(--gold-primary); margin-bottom: 30px; border-bottom: 1px solid rgba(216, 166, 72, 0.2); padding-bottom: 15px; }
                .order-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 8px; padding: 30px; margin-bottom: 20px; }
                .avatar-preview { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary); background-color: rgba(255, 255, 255, 0.1); }
                .avatar-initial { width: 120px; height: 120px; border-radius: 50%; background-color: var(--gold-primary); color: #000; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-family: var(--font-heading); font-weight: bold; border: 2px solid var(--gold-primary); }
            `}</style>
            {loading && <Loader overlay={true} text="Saving Profile..." />}
            <section className="dashboard-section">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <h2 className="dashboard-header">My Profile</h2>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="order-card pt-5">
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-4 align-items-center">
                                        <div className="col-auto">
                                            <div id="avatarContainer">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Profile" className="avatar-preview" />
                                                ) : (
                                                    <div className="avatar-initial">{firstInitial}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col">
                                            <label className="form-label text-gold">Profile Image</label>
                                            <input className="form-control text-light bg-transparent border-secondary w-100" type="file" onChange={handleFileChange} accept="image/*" />
                                            <small className="text-white-50">Max size: 5MB. Powered by Cloudinary.</small>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-white-50 small">Full Name</label>
                                            <input type="text" className="form-control text-light bg-transparent border-secondary" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-white-50 small">Email Address</label>
                                            <input type="email" className="form-control text-light bg-transparent border-secondary" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-white-50 small">Phone Number</label>
                                            <input type="tel" className="form-control text-light bg-transparent border-secondary" placeholder="+1 234 567 8900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-white-50 small">New Password (Optional)</label>
                                            <input type="password" className="form-control text-light bg-transparent border-secondary" placeholder="Leave blank to keep same" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label text-white-50 small">Shipping Address</label>
                                        <textarea className="form-control text-light bg-transparent border-secondary" rows="3" placeholder="Enter full shipping address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-gold w-100 py-2" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Profile Changes'}
                                    </button>
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Profile;
