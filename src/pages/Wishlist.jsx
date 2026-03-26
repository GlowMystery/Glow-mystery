import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toggleWishlist } from '../features/wishlistSlice';
import { toast } from 'react-toastify';
import { IoTrashOutline } from "react-icons/io5";

const Wishlist = () => {
    const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <div className="container py-5 text-center" style={{ minHeight: '60vh', marginTop: '100px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)' }}>Please Login</h2>
                <p className="text-white-50 mt-3">You need to be logged in to view your wishlist.</p>
                <button className="btn btn-gold mt-3" onClick={() => navigate('/login')}>Login Now</button>
            </div>
        );
    }

    const handleRemove = (e, productId) => {
        e.preventDefault();
        dispatch(toggleWishlist(productId));
    };

    return (
        <section className="py-5" style={{ background: 'var(--bg-dark)', minHeight: '80vh', paddingTop: '120px' }}>
            <div className="container" style={{ marginTop: '80px', maxWidth: '1000px' }}>
                <h2 className="mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)' }}>
                    My Wishlist ({wishlistItems.length})
                </h2>

                {loading ? (
                    <div className="text-center text-white-50"><p>Loading wishlist...</p></div>
                ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-5 bg-transparent" style={{ border: '1px solid rgba(216, 166, 72, 0.2)', borderRadius: '12px' }}>
                        <i className="bi bi-heart text-white-50 mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                        <h4 className="text-white-50">Your wishlist is empty.</h4>
                        <Link to="/shop" className="btn btn-gold mt-4">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="wishlist-list-container" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(216, 166, 72, 0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                        {wishlistItems.map((item, index) => {
                            const p = item.product;
                            if (!p) return null;
                            const defaultImage = '/creambg.png';
                            const originalPrice = Math.round(p.price / 0.6);
                            const discountPercent = Math.round(((originalPrice - p.price) / originalPrice) * 100);

                            const isLastItem = index === wishlistItems.length - 1;

                            return (
                                <div key={item.id} className="wishlist-item row align-items-center position-relative py-4 px-3 m-0"
                                     style={{ borderBottom: isLastItem ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    
                                    {/* Left: Product Image */}
                                    <div className="col-4 col-md-3 col-lg-2 text-center">
                                        <Link to={`/product/${p.id}`} className="d-block" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={p.imageUrl || defaultImage} alt={p.name} className="img-fluid" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                                        </Link>
                                        {p.stock === 0 && (
                                            <div className="mt-2 text-danger" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                                                Currently unavailable
                                            </div>
                                        )}
                                    </div>

                                    {/* Middle: Product Details */}
                                    <div className="col-6 col-md-7 col-lg-8">
                                        <h5 className="mb-2 d-none d-md-block" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                                            <Link to={`/product/${p.id}`} className="text-decoration-none text-light">{p.name}</Link>
                                        </h5>
                                        <h5 className="mb-2 d-md-none" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                                            <Link to={`/product/${p.id}`} className="text-decoration-none text-light">
                                                {p.name.length > 50 ? p.name.substring(0, 50) + '...' : p.name}
                                            </Link>
                                        </h5>
                                        <div className="d-flex align-items-center mb-1">
                                            <span style={{ color: 'var(--gold-light)', fontSize: '1.4rem', fontWeight: '700', marginRight: '10px' }}>₹{Math.round(p.price)}</span>
                                            <span className="text-white-50 text-decoration-line-through me-2" style={{ fontSize: '0.95rem' }}>₹{originalPrice}</span>
                                            <span className="text-success fw-bold" style={{ fontSize: '0.9rem' }}>{discountPercent}% off</span>
                                        </div>
                                    </div>

                                    {/* Right: Trash Icon */}
                                    <div className="col-2 col-md-2 col-lg-2 text-end">
                                        <button
                                            onClick={(e) => handleRemove(e, p.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(255, 255, 255, 0.4)',
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#dc3545'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                                            title="Remove from wishlist"
                                        >
                                            <IoTrashOutline />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Wishlist;
