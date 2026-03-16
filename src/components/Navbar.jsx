import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../features/authSlice';
import { selectCartCount } from '../features/cartSlice';

const Navbar = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const cartCount = useSelector(selectCartCount);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    // Close mobile navbar and dropdowns on route navigation
    useEffect(() => {
        const menu = document.getElementById('menu');
        if (menu && menu.classList.contains('show')) {
            menu.classList.remove('show');
            const toggler = document.querySelector('.navbar-toggler');
            if (toggler) {
                toggler.classList.add('collapsed');
                toggler.setAttribute('aria-expanded', 'false');
            }
        }

        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.remove('show');
            userDropdown.setAttribute('aria-expanded', 'false');
        }
        document.querySelectorAll('.dropdown-menu.show').forEach(el => el.classList.remove('show'));
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logoutSuccess());
        navigate('/');
    };

    const isAdmin = user && user.role === 'ADMIN';

    const getAvatarHtml = () => {
        if (user.profileImage) {
            return <img src={user.profileImage} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-primary)', marginRight: '5px' }} />;
        } else {
            const firstLet = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            return (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--gold-primary)', color: '#000', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 'bold', marginRight: '5px' }}>
                    {firstLet}
                </div>
            );
        }
    };

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark fixed-top custom-nav ${isScrolled ? 'shadow' : ''}`}>
            <div className="container">
                <Link className="navbar-brand brand-logo" to="/">
                    <img src="/file.svg" alt="Glow Mystery Icon" />
                    <span className="brand-text">GLOW MYSTERY</span>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="menu">
                    {!isAdmin && (
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link></li>
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} to="/about">About</Link></li>
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`} to="/shop">Products</Link></li>
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`} to="/services">Services</Link></li>
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`} to="/portfolio">Portfolio</Link></li>
                            <li className="nav-item"><Link className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} to="/contact">Contact</Link></li>
                        </ul>
                    )}

                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        {isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: 'var(--gold-primary)' }}>
                                    {getAvatarHtml()}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="userDropdown">
                                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                                    {!isAdmin ? (
                                        <li><Link className="dropdown-item" to="/dashboard">My Orders</Link></li>
                                    ) : (
                                        <li><Link className="dropdown-item" to="/admin">Dashboard</Link></li>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login" style={{ color: 'var(--gold-primary)' }}>Login / Register</Link>
                            </li>
                        )}

                        {!isAdmin && (
                            <li className="nav-item ms-lg-3 d-flex align-items-center mt-2 mt-lg-0">
                                
                                    <Link to="/cart" className="btn btn-gold">
                                        <i className="bi bi-cart3"></i> Cart <span id="cartCount" className="badge bg-dark text-gold ms-1">{cartCount}</span>
                                    </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
