import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../features/authSlice';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        dispatch(logoutSuccess());
        window.location.href = '/login';
    };

    return (
        <div className="admin-layout-wrapper">

            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-nav shadow">
                <div className="container-fluid px-3 px-md-4">

                    <Link className="navbar-brand brand-logo d-flex align-items-center" to="/admin">
                        <img src="/file.svg" alt="Glow Mystery Icon" />
                        <span className="brand-text">GLOW MYSTERY</span>
                    </Link>

                    <div className="ms-auto d-flex align-items-center">

                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: 'var(--gold-primary)' }}>
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-primary)', marginRight: '5px' }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--gold-primary)', color: '#000', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginRight: '5px' }}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                        </div>
                                    )}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="userDropdown">
                                    <li><Link className="dropdown-item" to="/admin/profile">My Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                                </ul>
                            </li>
                        </ul>

                        {/* Mobile menu */}
                        <button
                            className="btn btn-sm btn-outline-light d-lg-none ms-3"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#adminSidebar"
                        >
                            <i className="bi bi-list fs-5"></i>
                        </button>

                    </div>
                </div>
            </nav>

            {/* MAIN LAYOUT */}
            <div className="admin-main">
                <AdminSidebar />
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            <style>{`

            .admin-layout-wrapper{
                min-height:100vh;
                background:var(--bg-dark);
            }

            .admin-main{
                width:100%;
            }

            /* BRAND */
            .brand-logo img{
                width:34px;
                margin-right:8px;
            }

            .brand-text{
                font-weight:600;
                letter-spacing:1px;
            }

            /* TABLET / MOBILE TWEAKS */
            @media (min-width:768px) and (max-width:991px){
                .brand-text{
                    font-size:15px;
                }
            }

            @media (max-width:767px){
                .brand-text{
                    font-size:14px;
                }
                .brand-logo img{
                    width:28px;
                }
                .navbar{
                    padding-top:8px;
                    padding-bottom:8px;
                }
            }

            `}</style>
        </div>
    );
};

export default AdminLayout;