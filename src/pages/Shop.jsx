import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, selectIsItemInCart } from '../features/cartSlice';
import { fetchProducts } from '../features/productSlice';
import { toggleWishlist, selectIsItemInWishlist } from '../features/wishlistSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const Shop = () => {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.product);
    const cartItems = useSelector((state) => state.cart.items);
    const wishlistItems = useSelector((state) => state.wishlist.items);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchProducts());

        const socket = io('https://glow-mystery-backend.vercel.app/');
        socket.on('product_updated', () => {
            dispatch(fetchProducts());
        });

        return () => {
            socket.off('product_updated');
            socket.disconnect();
        };
    }, [dispatch]);

    const handleAddToCart = (e, product) => {
        e.preventDefault();

        if (product.stock === 0) {
            toast.error('This product is currently out of stock.');
            return;
        }

        const existing = cartItems.find(i => Number(i.productId) === Number(product.id));
        if (existing) {
            toast.info('Item is already in your cart!');
            return;
        }

        dispatch(addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl || '/creambg.png',
            quantity: 1,
            stock: product.stock !== undefined ? product.stock : 100
        }));

        // ✅ 🔥 META PIXEL EVENT HERE
        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_name: product.name,
                content_ids: [product.id],
                value: product.price,
                currency: 'INR'
            });
        }

        const btn = e.target;
        const originalText = btn.innerText;
        btn.innerText = 'Added ✓';
        setTimeout(() => { btn.innerText = originalText; }, 1500);
    };


    const handleToggleWishlist = (e, productId) => {
        e.preventDefault();
        dispatch(toggleWishlist(productId));
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
            <style>{`
.shop-header { padding-top: 140px; padding-bottom: 60px; background: linear-gradient(to bottom, #111, var(--bg-dark)); text-align: center; }
.shop-header h1 { font-family: var(--font-heading); color: var(--gold-light); font-size: 3rem; }

.product-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 12px; transition: all 0.3s ease; height: 100%; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(216, 166, 72, 0.1); border-color: rgba(216, 166, 72, 0.5); }

.product-img-wrapper { padding: 20px; text-align: center; position: relative; display: flex; align-items: center; justify-content: center; height: 250px; }
.product-img-wrapper img { max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.5)); transition: transform 0.3s; }
.product-card:hover .product-img-wrapper img { transform: scale(1.05); }

.search-input::placeholder {
  color: white;
  opacity: 1;
}

.search-input::-ms-input-placeholder {
  color: white;
}

.search-input::-webkit-input-placeholder {
  color: white;
}
`}</style>
            <section className="shop-header">
                <div className="container">
                    <h1>Our Collection</h1>
                    <p className="text-white-50">Discover pure luxury for your skin.</p>
                </div>
            </section>
            <section className="py-5" style={{ background: 'var(--bg-dark)', minHeight: '50vh' }}>
                <div className="container">
                    {loading && <Loader overlay={true} />}
                    {error && <div className="text-center text-danger py-5"><p>{error}</p></div>}
                    {!loading && !error && products.length === 0 && (
                        <div className="text-center text-white-50 py-5"><p>No products available yet.</p></div>
                    )}

                    {/* Search Bar */}
                    <div className="row justify-content-center mb-5">
                        <div className="col-md-8 col-lg-6">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'rgba(216, 166, 72, 0.5)', color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent text-white border-start-0 shadow-none ps-0 search-input"
                                    style={{ borderColor: 'rgba(216, 166, 72, 0.5)', borderRadius: '0 8px 8px 0' }}
                                    placeholder="Search products by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 justify-content-center">
                        {!loading && products.filter(p =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(p => {
                            const defaultImage = '/creambg.png';
                            const originalPrice = Math.round(p.price / 0.6);
                            return (
                                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={p.id}>
                                    <div className="card bg-transparent border-0 h-100">
                                        <div className="card-body text-center p-4 product-card">
                                            <div className="mb-4 position-relative">
                                                <button
                                                    onClick={(e) => handleToggleWishlist(e, p.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        right: '10px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        fontSize: '1.5rem',
                                                        color: wishlistItems.some(item => Number(item.productId) === Number(p.id)) ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.5)',
                                                        zIndex: 2,
                                                        transition: 'color 0.3s ease'
                                                    }}
                                                >
                                                    <i className={wishlistItems.some(item => Number(item.productId) === Number(p.id)) ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                                                </button>
                                                <Link to={`/product/${p.id}`} className="product-img-wrapper">
                                                    <img src={p.imageUrl || defaultImage} alt={p.name} className="img-fluid" />
                                                </Link>
                                            </div>
                                            <h5 className="mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                                <Link to={`/product/${p.id}`} className="text-decoration-none text-light">{p.name}</Link>
                                            </h5>
                                            {p.stock === 0 ? (
                                                <div className="mb-3">
                                                    <span className="text-danger fw-bold fs-5">Out of Stock</span>
                                                </div>
                                            ) : (
                                                <div className="mb-3">
                                                    <span style={{ color: 'var(--gold-light)', fontSize: '1.25rem', fontWeight: 700 }}>₹{Math.round(p.price)}</span>
                                                    <span className="text-white-50 text-decoration-line-through ms-2">₹{originalPrice}</span>
                                                </div>
                                            )}
                                            <button className="btn btn-gold-outline w-100" onClick={(e) => handleAddToCart(e, p)} disabled={p.stock === 0}>
                                                {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
};
export default Shop;
