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

  // Close mobile menu on route change
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
  }, [location]);

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
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
    if (user?.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt="Profile"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid var(--gold-primary)',
            marginRight: '5px',
          }}
        />
      );
    }
    const firstLet = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--gold-primary)',
          color: '#000',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 'bold',
          marginRight: '5px',
        }}
      >
        {firstLet}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width:768px){
          .brand-text { display:none; }
          .brand-logo img { width:35px; }
        }
      `}</style>

      <nav
        className={`navbar navbar-expand-lg navbar-dark fixed-top custom-nav ${
          isScrolled ? 'shadow' : ''
        }`}
      >
        <div className="container d-flex align-items-center">
          {/* LOGO */}
          <Link className="navbar-brand brand-logo d-flex align-items-center" to="/">
            <img
              src="/file.svg"
              alt="Glow Mystery Icon"
              style={{ width: '40px', marginRight: '8px' }}
            />
            <span className="brand-text">GLOW MYSTERY</span>
          </Link>

          {/* CART BUTTON ALWAYS VISIBLE (Mobile) */}
          {!isAdmin && (
            <Link to="/cart" className="btn btn-gold ms-auto me-2 d-lg-none">
              <i className="bi bi-cart3"></i>
              <span className="badge bg-dark text-gold ms-1">{cartCount}</span>
            </Link>
          )}

          {/* MOBILE TOGGLER */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#menu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="menu">
            {!isAdmin && (
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    to="/about"
                  >
                    About
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}
                    to="/shop"
                  >
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
                    to="/services"
                  >
                    Services
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
                    to="/portfolio"
                  >
                    Portfolio
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                    to="/contact"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            )}

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              {isAuthenticated ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    style={{ color: 'var(--gold-primary)' }}
                  >
                    {getAvatarHtml()}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-dark">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        My Profile
                      </Link>
                    </li>
                    {!isAdmin ? (
                      <li>
                        <Link className="dropdown-item" to="/dashboard">
                          My Orders
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link className="dropdown-item" to="/admin">
                          Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={{ color: 'var(--gold-primary)' }}>
                    Login / Register
                  </Link>
                </li>
              )}

              {/* DESKTOP CART */}
              {!isAdmin && (
                <li className="nav-item ms-lg-3 d-none d-lg-block">
                  <Link to="/cart" className="btn btn-gold">
                    <i className="bi bi-cart3"></i> Cart
                    <span className="badge bg-dark text-gold ms-1">{cartCount}</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;