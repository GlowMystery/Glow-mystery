import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../features/authSlice';

const AdminSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('admin-mode-active');
        return () => {
            document.body.classList.remove('admin-mode-active');
        };
    }, []);

    const handleLogout = () => {
        dispatch(logoutSuccess());
        navigate('/');
    };

    return (
        <aside id="adminSidebar" className="admin-sidebar offcanvas-lg offcanvas-start shadow-lg text-bg-dark" tabIndex="-1">
            <div className="sidebar-header offcanvas-header">
                <h4 className="offcanvas-title text-gold" style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Glow Admin</h4>
                <button type="button" className="btn-close btn-close-white d-lg-none" data-bs-dismiss="offcanvas" data-bs-target="#adminSidebar" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body d-flex flex-column p-0" style={{ height: 'calc(100% - 60px)' }}>
                <ul className="sidebar-nav">
                    <li><NavLink to="/admin" end><i className="bi bi-speedometer2 me-2"></i> Dashboard</NavLink></li>
                    {/* <li><NavLink to="/admin/profile"><i className="bi bi-person me-2"></i> My Profile</NavLink></li> */}
                    <li><NavLink to="/admin/products"><i className="bi bi-box-seam me-2"></i> Products</NavLink></li>
                    <li><NavLink to="/admin/orders"><i className="bi bi-receipt me-2"></i> Orders</NavLink></li>
                    <li><NavLink to="/admin/users"><i className="bi bi-people me-2"></i> Users</NavLink></li>
                    <li><NavLink to="/admin/reviews"><i className="bi bi-star-half me-2"></i> Reviews</NavLink></li>
                    <li><NavLink to="/admin/discounts"><i className="bi bi-tag me-2"></i> Discounts</NavLink></li>
                </ul>
                {/* <div className="sidebar-footer border-top border-secondary mt-auto w-100 p-3">
                    <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                </div> */}
            </div>
        </aside>
    );
};

export default AdminSidebar;
