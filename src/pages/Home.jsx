import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import { fetchProducts } from '../features/productSlice';
import { fetchProfile } from '../features/authSlice';
import { toggleWishlist } from '../features/wishlistSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const Home = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
    const { products, loading: productsLoading } = useSelector((state) => state.product);
    const cartItems = useSelector((state) => state.cart.items);
    const wishlistItems = useSelector((state) => state.wishlist.items);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchProfile());
        }
        dispatch(fetchProducts());

        const socket = io('https://glow-mystery-backend.vercel.app/');
        socket.on('product_updated', () => {
            dispatch(fetchProducts());
        });

        return () => {
            socket.off('product_updated');
            socket.disconnect();
        };
    }, [isAuthenticated, dispatch]);

    const handleAddToCart = (e, product) => {
        e.preventDefault();

        if (product.stock === 0) {
            toast.error('This product is currently out of stock.');
            return;
        }

        const existing = cartItems.find(i => Number(i.productId) === Number(product.productId));
        if (existing) {
            toast.info('Item is already in your cart!');
            return;
        }

        dispatch(addToCart(product));
        const btn = e.target;
        const originalText = btn.innerText;
        btn.innerText = 'Added ✓';
        setTimeout(() => { btn.innerText = originalText; }, 1500);
    };

    const handleToggleWishlist = (e, productId) => {
        e.preventDefault();

        const product = products.find(p => Number(p.id) === Number(productId));

        dispatch(toggleWishlist(productId));

        // ✅ 🔥 META PIXEL EVENT
        if (window.fbq && product) {
            window.fbq('track', 'AddToWishlist', {
                content_name: product.name,
                content_ids: [product.id],
                value: product.price,
                currency: 'INR'
            });
        }
    };

    return (
        <>
            {authLoading && <Loader overlay={true} text="Loading..." />}
            {/* ================= HERO ================= */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center">

                        {/* LEFT */}
                        <div className="col-lg-6 text-light hero-text">
                            <h1>Welcome to <br /> Glow Mystery</h1>
                            <p>Uncover the brilliance. Reveal the mystery.</p>
                            <Link to="/shop" className="btn btn-gold mt-3">Shop Now</Link>
                        </div>

                        {/* RIGHT PRODUCT */}
                        <div className="col-lg-6 text-center mt-5 mt-lg-0">
                            <div className="logo-container">
                                <span className="script-text">Glow Mystery</span>
                                <div className="product-glow"></div>
                                <Link to="/shop/">
                                    <img src="/creambg.png" alt="Glow Mystery Cream" className="img-fluid product-img" />
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* SERVICES PREVIEW */}
                    <div className="row feature-row text-center mt-5">
                        <div className="col-12 mb-4">
                            <h2 className="text-gold">Our Services</h2>
                            <p className="text-white-50">Discover our range of premium treatments.</p>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-box">
                                <i className="bi bi-stars"></i>
                                <h5>Luxury Facials</h5>
                                <p>Rejuvenate your skin with our signature gold-infused facial treatments.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-box">
                                <i className="bi bi-droplet-half"></i>
                                <h5>Skin Analysis</h5>
                                <p>Advanced AI-driven skin analysis to uncover your skin's unique needs.</p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-box">
                                <i className="bi bi-magic"></i>
                                <h5>Anti-Aging</h5>
                                <p>Timeless beauty solutions that smooth and restore youthful vitality.</p>
                            </div>
                        </div>

                        <div className="col-12 mt-4">
                            <Link to="/services" className="btn btn-gold-outline">View All Services</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= PRODUCTS SECTION ================= */}
            <section className="products-section py-5" style={{ background: 'linear-gradient(to bottom, #0a0a0a, var(--bg-dark))' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-heading)' }}>Exclusive Collection</h2>
                        <p className="text-white-50">Experience the luxury of Ayurveda.</p>
                    </div>

                    <div className="row justify-content-center">
                        {productsLoading ? (
                            <Loader />
                        ) : (
                            products.slice(0, 3).map((product) => {
                                const originalPrice = Math.round(product.price / 0.6);
                                const defaultImage = '/creambg.png';
                                return (
                                    <div className="col-md-4 mb-4" key={product.id}>
                                        <div className="card bg-transparent border-0 h-100">
                                            <div className="card-body text-center p-4"
                                                style={{ border: '1px solid rgba(216, 166, 72, 0.2)', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)' }}>
                                                <div className="mb-4 position-relative">
                                                    <button
                                                        onClick={(e) => handleToggleWishlist(e, product.id)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '10px',
                                                            right: '10px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            fontSize: '1.5rem',
                                                            color: wishlistItems.some(item => Number(item.productId) === Number(product.id)) ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.5)',
                                                            zIndex: 2,
                                                            transition: 'color 0.3s ease'
                                                        }}
                                                    >
                                                        <i className={wishlistItems.some(item => Number(item.productId) === Number(product.id)) ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                                                    </button>
                                                    <Link to={`/product/${product.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', padding: '15px' }}>
                                                        <img src={product.imageUrl || defaultImage} alt={product.name} className="img-fluid"
                                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))', transition: 'transform 0.3s' }}
                                                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                                                    </Link>
                                                </div>
                                                <h5 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                                    <Link to={`/product/${product.id}`} className="text-decoration-none text-light">{product.name}</Link>
                                                </h5>
                                                {product.stock === 0 ? (
                                                    <div className="mb-3">
                                                        <span className="text-danger fw-bold fs-5">Out of Stock</span>
                                                    </div>
                                                ) : (
                                                    <div className="mb-3">
                                                        <span style={{ color: 'var(--gold-light)', fontSize: '1.25rem', fontWeight: 700 }}>₹{Math.round(product.price)}</span>
                                                        <span className="text-white-50 text-decoration-line-through ms-2">₹{originalPrice}</span>
                                                    </div>
                                                )}
                                                <button className="btn btn-gold-outline w-100 add-to-cart-btn"
                                                    onClick={(e) => handleAddToCart(e, {
                                                        productId: product.id,
                                                        name: product.name,
                                                        price: product.price,
                                                        image: product.imageUrl || defaultImage,
                                                        quantity: 1,
                                                        stock: product.stock !== undefined ? product.stock : 100
                                                    })} disabled={product.stock === 0}>
                                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {!productsLoading && products.length > 3 && (
                        <div className="text-center mt-5">
                            <Link to="/shop" className="btn btn-gold px-4 py-2">View All Products</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ================= ABOUT ================= */}
            <section className="about-section">
                <div className="container">
                    <div className="row align-items-center">
                        {/* LEFT: TEXT */}
                        <div className="col-lg-6">
                            <h2 className="mb-4">About Glow Mystery</h2>
                            <p className="mb-4" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                                Welcome to Glow Mystery, where elegance meets mystery. We are dedicated to unveiling the secret to radiant,
                                timeless beauty. Our journey began with a simple passion: to create skincare products that not only nourish
                                the skin but also inspire the soul.
                            </p>
                            <Link to="/about" className="btn btn-gold">Read Full Story</Link>
                        </div>

                        {/* RIGHT: LOGO */}
                        <div className="col-lg-6 text-center mt-5 mt-lg-0">
                            <div className="about-logo-container">
                                <img src="/file.svg" alt="Glow Mystery Logo" height="250"
                                    style={{ filter: 'drop-shadow(0 0 20px rgba(216, 166, 72, 0.3))' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= PORTFOLIO PREVIEW ================= */}
            <section className="portfolio-section-home py-5" style={{ background: '#0a0a0a' }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-heading)' }}>Our Latest Work</h2>
                        <p className="text-white-50">Witness the glow we create.</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '250px', background: 'linear-gradient(45deg, #1a1a1a, #333)' }}></div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '250px', background: 'linear-gradient(45deg, #2c2c2c, #4a3b2a)' }}></div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '250px', background: 'linear-gradient(45deg, #111, #222)' }}></div>
                            </div>
                        </div>
                        <div className="col-12 text-center mt-4">
                            <Link to="/portfolio" className="btn btn-gold">View Full Portfolio</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CONTACT CTA ================= */}
            <section className="contact-cta-section py-5"
                style={{ background: 'url("/bgimg.png") no-repeat center center/cover', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}></div>
                <div className="container position-relative z-2 text-center">
                    <h2 className="mb-3" style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-heading)' }}>Ready to Reveal Your Glow?
                    </h2>
                    <p className="text-white-50 mb-4" style={{ fontSize: '1.2rem' }}>Book your appointment or get in touch with us today.</p>
                    <Link to="/contact" className="btn btn-gold btn-lg">Contact Us</Link>
                </div>
            </section>
        </>
    );
};

export default Home;
