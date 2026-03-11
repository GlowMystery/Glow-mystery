import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cartSlice';
import { fetchProductById } from '../features/productSlice';
import { createReview } from '../features/reviewSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct: product, loading, error } = useSelector((state) => state.product);
    const cartItems = useSelector((state) => state.cart.items);

    const [qty, setQty] = useState(1);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewInput, setReviewInput] = useState({ rating: 0, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewStatus, setReviewStatus] = useState(null);

    const { token, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));

            const socket = io('http://localhost:8000');
            socket.on('product_updated', () => {
                dispatch(fetchProductById(id));
            });

            return () => {
                socket.off('product_updated');
                socket.disconnect();
            };
        }
    }, [id, dispatch]);

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (product) {
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
                quantity: qty,
                stock: product.stock,
                image: product.imageUrl || '/creambg.png'
            }));
            const btn = e.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Added to Cart';
            btn.classList.replace('btn-gold', 'btn-success');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('btn-success', 'btn-gold');
            }, 2000);
        }
    };

    const handleQtyChange = (delta) => {
        let newQty = qty + delta;
        if (newQty < 1) newQty = 1;
        if (product && newQty > product.stock) {
            newQty = product.stock;
            toast.warning(`Only ${product.stock} items available in stock.`);
        }
        setQty(newQty);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewStatus(null);
        if (!isAuthenticated) {
            setReviewStatus({ type: 'danger', msg: 'You must be logged in to submit a review.' });
            return;
        }
        if (reviewInput.rating === 0) {
            setReviewStatus({ type: 'danger', msg: 'Please select a star rating.' });
            return;
        }
        setReviewLoading(true);
        try {
            const result = await dispatch(createReview({ productId: id, reviewData: { rating: reviewInput.rating, comment: reviewInput.comment } })).unwrap();
            setReviewStatus({ type: 'success', msg: 'Review submitted successfully!' });
            setReviewInput({ rating: 0, comment: '' });
            setShowReviewForm(false);
            // Re-fetch product to update reviews list
            dispatch(fetchProductById(id));
        } catch (err) {
            if (err.toLowerCase().includes('already reviewed')) {
                toast.warning('You have already reviewed this product.');
            } else {
                setReviewStatus({ type: 'danger', msg: err || 'Failed to submit review.' });
            }
        }
        setReviewLoading(false);
    };

    return (
        <>
            <style>{`
                .product-detail-section { padding-top: 120px; padding-bottom: 60px; min-height: 80vh; }
                .product-image-container { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 16px; padding: 40px; text-align: center; position: relative; display: flex; align-items: center; justify-content: center; min-height: 400px; }
                .product-image-container img { max-width: 100%; max-height: 350px; object-fit: contain; filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6)); animation: float 4s ease-in-out infinite; }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
                .product-info-container h1 { font-family: var(--font-heading); color: var(--gold-primary); margin-bottom: 15px; }
                .price-tag { font-size: 2rem; font-weight: 700; color: var(--gold-light); margin-bottom: 20px; }
                .product-desc { color: rgba(255, 255, 255, 0.7); line-height: 1.8; margin-bottom: 30px; }
                .quantity-selector { display: flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(216, 166, 72, 0.3); border-radius: 4px; width: fit-content; margin-bottom: 30px; }
                .quantity-selector button { background: transparent; border: none; color: var(--gold-primary); padding: 10px 15px; font-size: 1.2rem; }
                .quantity-selector input { background: transparent; border: none; color: #fff; text-align: center; width: 50px; font-weight: 600; }
                .review-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                .review-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; margin-right: 15px; background-color: rgba(216, 166, 72, 0.1); color: var(--gold-primary); }
                .submit-review-container { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 8px; padding: 25px; margin-top: 20px; }
                .star-rating-input { display: inline-flex; flex-direction: row-reverse; gap: 5px; }
                .star-rating-input input { display: none; }
                .star-rating-input label { cursor: pointer; font-size: 1.5rem; color: rgba(255, 255, 255, 0.2); transition: color 0.2s; }
                .star-rating-input input:checked ~ label, .star-rating-input label:hover, .star-rating-input label:hover ~ label { color: var(--gold-primary); }
                .btn-action-row { display: flex; gap: 15px; align-items: center; }
            `}</style>
            <section className="product-detail-section" style={{ background: 'var(--bg-dark)' }}>
                <div className="container">
                    {loading && <Loader overlay={true} />}
                    {error && <div className="text-center text-danger py-5"><p>{error}</p></div>}
                    {!loading && product && (
                        <div className="row">
                            <div className="col-lg-6 mb-5 mb-lg-0">
                                <div className="product-image-container">
                                    <div className="product-glow" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}></div>
                                    <img src={product.imageUrl || '/creambg.png'} alt={product.name} style={{ position: 'relative', zIndex: 2 }} />
                                </div>
                            </div>
                            <div className="col-lg-6 product-info-container">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link to="/shop" className="text-gold text-decoration-none">Shop</Link></li>
                                        <li className="breadcrumb-item active text-white-50" aria-current="page">{product.name}</li>
                                    </ol>
                                </nav>
                                <h1 className="fw-bold fs-2" style={{ fontFamily: "'Poppins', sans-serif" }}>{product.name}</h1>
                                <div className="price-tag mb-2">₹{product.price.toFixed(2)}</div>

                                <div className="d-flex align-items-center mb-4 text-gold" style={{ fontSize: '0.9rem' }}>
                                    <span>
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const avgRating = product.reviews && product.reviews.length > 0
                                                ? Math.round(product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length)
                                                : 0;
                                            return <i key={idx} className={`bi ${idx < avgRating ? 'bi-star-fill' : 'bi-star'} me-1`}></i>;
                                        })}
                                    </span>
                                    <span className="text-white-50 ms-2">({product.reviews ? product.reviews.length : 0} Reviews)</span>
                                </div>

                                <p className="product-desc">{product.description}</p>
                                <div className="mb-4">
                                    {product.stock > 0 ? (
                                        <span className="badge" style={{ backgroundColor: 'rgba(216, 166, 72, 0.1)', color: 'var(--gold-light)', fontWeight: 'normal', border: '1px solid rgba(216, 166, 72, 0.3)' }}>In Stock: {product.stock}</span>
                                    ) : (
                                        <span className="badge bg-danger text-white">Out of Stock</span>
                                    )}
                                </div>

                                <div className="btn-action-row mb-4">
                                    <div className="quantity-selector m-0">
                                        <button onClick={() => handleQtyChange(-1)} disabled={product.stock <= 0}><i className="bi bi-dash"></i></button>
                                        <input type="text" value={qty} readOnly disabled={product.stock <= 0} />
                                        <button onClick={() => handleQtyChange(1)} disabled={product.stock <= 0}><i className="bi bi-plus"></i></button>
                                    </div>
                                    <button className="btn btn-gold flex-grow-1" style={{ height: '48px' }} onClick={handleAddToCart} disabled={product.stock <= 0}>Add to bag</button>
                                </div>

                                <div className="mb-5">
                                    <a href="#" style={{ color: '#dc3545', textDecoration: 'none', fontSize: '0.9rem' }} onClick={(e) => { e.preventDefault(); setShowReviewForm(true); }}>Write a Review</a>
                                </div>

                                {showReviewForm && (
                                    <div className="submit-review-container">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5 className="text-white mb-0">Submit Review</h5>
                                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowReviewForm(false)} aria-label="Close" style={{ fontSize: '0.8rem' }}></button>
                                        </div>
                                        <form onSubmit={submitReview}>
                                            <div className="mb-3">
                                                <label className="text-white-50 d-block mb-2">Rating</label>
                                                <div className="star-rating-input">
                                                    {[5, 4, 3, 2, 1].map(num => (
                                                        <React.Fragment key={num}>
                                                            <input type="radio" id={`star${num}`} name="rating" value={num} checked={reviewInput.rating === num} onChange={() => setReviewInput({ ...reviewInput, rating: num })} />
                                                            <label htmlFor={`star${num}`} title={`${num} stars`}><i className="bi bi-star-fill"></i></label>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="reviewComment" className="text-white-50 mb-2">Comment</label>
                                                <textarea className="form-control bg-transparent text-white border-secondary" id="reviewComment" rows="4" placeholder="Share your experience..." value={reviewInput.comment} onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })} required></textarea>
                                            </div>
                                            <button type="submit" className="btn text-white w-100 mt-2" style={{ backgroundColor: '#d9534f' }} disabled={reviewLoading}>
                                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                            {reviewStatus && (
                                                <div className={`mt-3 text-center text-${reviewStatus.type}`}>{reviewStatus.msg}</div>
                                            )}
                                        </form>
                                    </div>
                                )}

                                <div className="mt-5 border-top border-secondary pt-5">
                                    <h4 className="text-white mb-4 fw-bold">Customer Reviews</h4>
                                    <div>
                                        {product.reviews && product.reviews.length > 0 ? product.reviews.map((r, i) => {
                                            const firstInitial = r.user && r.user.name ? r.user.name.charAt(0).toUpperCase() : 'U';
                                            const userName = r.user && r.user.name ? r.user.name : 'Unknown User';
                                            return (
                                                <div key={i} className="review-card shadow-sm">
                                                    <div className="d-flex align-items-start">
                                                        <div className="review-avatar shadow-sm">{firstInitial}</div>
                                                        <div className="flex-grow-1">
                                                            <div className="fw-bold fs-6 text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{userName}</div>
                                                            <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                                                                {Array.from({ length: r.rating }).map((_, j) => (
                                                                    <i key={j} className="bi bi-star-fill text-gold me-1"></i>
                                                                ))}
                                                            </div>
                                                            <p className="text-white-50 mb-0 mt-2" style={{ fontSize: '0.95rem' }}>"{r.comment || 'No comment provided.'}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : <p className="text-white-50">No reviews yet.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};
export default ProductDetails;
