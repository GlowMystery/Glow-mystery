import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrderError, requestReturn } from '../features/orderSlice';
import Loader from '../components/Loader';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentOrder, loading, error } = useSelector((state) => state.order);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('Damaged Product');
    const [returnDesc, setReturnDesc] = useState('');
    const [returnImages, setReturnImages] = useState([]);
    const [isReturning, setIsReturning] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchOrderDetails(id));

        const socket = io('http://localhost:8000');
        socket.on(`order_status_${id}`, () => {
            dispatch(fetchOrderDetails(id));
        });

        return () => {
            socket.off(`order_status_${id}`);
            socket.disconnect();
            dispatch(clearOrderError());
        };
    }, [id, isAuthenticated, dispatch, navigate]);

    const submitReturn = async (e) => {
        e.preventDefault();
        if (!returnReason || !returnDesc) {
            toast.error('Please provide a reason and description for the return.');
            return;
        }

        setIsReturning(true);
        const formData = new FormData();
        formData.append('reason', returnReason);
        formData.append('description', returnDesc);
        for (let i = 0; i < returnImages.length; i++) {
            formData.append('images', returnImages[i]);
        }

        try {
            await dispatch(requestReturn({ orderId: id, formData })).unwrap();
            toast.success('Return requested successfully!');
            setShowReturnModal(false);
            setReturnDesc('');
            setReturnImages([]);
            // Socket.io will automatically trigger a fetchOrderDetails update here!
        } catch (err) {
            toast.error(err || 'Failed to submit return request.');
        }
        setIsReturning(false);
    };

    if (loading) {
        return <div style={{ paddingTop: '150px' }}><Loader overlay={true} text="Loading order details..." /></div>;
    }

    if (error) {
        return (
            <section className="dashboard-section text-center">
                <div className="container">
                    <h3 className="text-danger">Error Loading Order</h3>
                    <p className="text-white-50">{error}</p>
                    <Link to="/dashboard" className="btn btn-gold mt-3">Back to Dashboard</Link>
                </div>
            </section>
        );
    }

    if (!currentOrder) {
        return null;
    }

    const { status, totalAmount, shippingAddress, paymentStatus, orderItems, createdAt, user } = currentOrder;

    // Address format
    let addressText = 'Address not provided.';
    let addressName = user?.name || shippingAddress?.name || '-';
    let addressPhone = user?.phone || shippingAddress?.phone || 'Not provided';

    if (shippingAddress) {
        if (typeof shippingAddress === 'string') {
            addressText = shippingAddress;
        } else if (shippingAddress.addressLine1) {
            addressText = `${shippingAddress.addressLine1}, ${shippingAddress.city || ''} - ${shippingAddress.zipCode || ''}`;
        }
    } else if (user?.address) {
        addressText = user.address;
    }

    // Subtotal logic
    let subTotal = 0;
    if (orderItems) {
        orderItems.forEach(item => {
            subTotal += (item.price * item.quantity);
        });
    }

    // Delivery amount logic
    let deliveryAmount = currentOrder.shippingAmount || 0;
    if (!currentOrder.shippingAmount && (totalAmount - subTotal - (currentOrder.taxAmount || 0)) > 0) {
        deliveryAmount = totalAmount - subTotal - (currentOrder.taxAmount || 0);
    }

    // Payment String
    const paymentMethodDisplay = (currentOrder.paymentMethod === 'CARD' || currentOrder.paymentMethod === 'ONLINE' || currentOrder.paymentMethod === 'RAZORPAY')
        ? 'Online/Card'
        : (currentOrder.paymentMethod || 'Online/Card');

    // Timeline logic
    const dateObj = new Date(createdAt);
    const shippedDate = new Date(dateObj); shippedDate.setDate(shippedDate.getDate() + 1);
    const outDate = new Date(dateObj); outDate.setDate(outDate.getDate() + 3);
    const delDate = new Date(dateObj); delDate.setDate(delDate.getDate() + 4);

    const statusMap = {
        'PENDING': 0, 'PAID': 0, 'SHIPPED': 1, 'OUT_FOR_DELIVERY': 2, 'DELIVERED': 3,
        'RETURN_ACCEPTED': 4, 'OUT_FOR_PICKUP': 5, 'RETURNED': 6
    };

    let sIndex = statusMap[status] !== undefined ? statusMap[status] : -1;
    let maxIndex = 3;

    if (currentOrder.returnRequest && currentOrder.returnRequest.status !== 'REJECTED') {
        maxIndex = 6;
        if (currentOrder.returnRequest.status === 'ACCEPTED') sIndex = Math.max(sIndex, 4);
        if (currentOrder.returnRequest.status === 'OUT_FOR_PICKUP') sIndex = Math.max(sIndex, 5);
        if (currentOrder.returnRequest.status === 'RETURNED') sIndex = 6;
    }

    if (status === 'CANCELLED') sIndex = -1;
    const fillPercent = sIndex === 0 ? 0 : (sIndex / maxIndex) * 100;

    // Action button logic
    let actionBtnText = 'Return Requested (Pending Review)';
    let actionBtnClass = 'btn btn-outline-warning w-100 mt-4 py-2';
    let actionBtnStyle = { opacity: 1, cursor: 'default' };
    let actionBtnDisabled = true;

    if (currentOrder.returnRequest) {
        actionBtnStyle = { opacity: 1, cursor: 'default' };
        if (currentOrder.returnRequest.status === 'REJECTED') {
            actionBtnText = 'Return Rejected' + (currentOrder.returnRequest.adminReason ? ` - ${currentOrder.returnRequest.adminReason}` : '');
            actionBtnClass = 'btn btn-outline-danger w-100 mt-4 py-2';
        } else if (status === 'RETURNED' || currentOrder.returnRequest.status === 'RETURNED') {
            actionBtnText = 'Returned Successfully';
            actionBtnClass = 'btn btn-outline-secondary w-100 mt-4 py-2';
        } else if (status === 'OUT_FOR_PICKUP' || currentOrder.returnRequest.status === 'OUT_FOR_PICKUP') {
            actionBtnText = 'Return Accepted - Out for Pickup';
            actionBtnClass = 'btn btn-outline-info w-100 mt-4 py-2';
        } else if (status === 'RETURN_ACCEPTED' || currentOrder.returnRequest.status === 'ACCEPTED' || currentOrder.returnRequest.status === 'RETURN_ACCEPTED') {
            actionBtnText = 'Return Accepted';
            actionBtnClass = 'btn btn-outline-success w-100 mt-4 py-2';
        }
    } else if (status !== 'DELIVERED') {
        actionBtnStyle = { opacity: 0.5, cursor: 'not-allowed' };
        actionBtnText = 'Return Order';
        actionBtnDisabled = true;
    } else if (status === 'DELIVERED') {
        actionBtnText = 'Request Return';
        actionBtnDisabled = false;
        // Allows user to click Return Request
    }

    if (status === 'CANCELLED') {
        actionBtnClass += ' d-none';
    }

    return (
        <>
            <style>{`
                .order-details-section { padding-top: 140px; padding-bottom: 60px; min-height: 80vh; background: var(--bg-dark); }
                .details-header { font-family: var(--font-heading); color: var(--gold-primary); margin-bottom: 20px; border-bottom: 1px solid rgba(216, 166, 72, 0.2); padding-bottom: 15px; }
                .details-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(216, 166, 72, 0.2); border-radius: 8px; padding: 24px; margin-bottom: 20px; }
                .product-img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(216, 166, 72, 0.3); background: rgba(255, 255, 255, 0.05); }
                .offer-text { color: #28a745; font-size: 0.85rem; font-weight: 500; }
                
                /* Timeline Styles */
                .timeline { position: relative; padding-left: 30px; margin-top: 20px; margin-bottom: 10px; }
                .timeline::before { content: ''; position: absolute; left: 11px; top: 5px; bottom: 30px; width: 2px; background: rgba(255, 255, 255, 0.1); }
                .timeline-step { position: relative; margin-bottom: 30px; }
                .timeline-step:last-child { margin-bottom: 0; }
                .timeline-icon { position: absolute; left: -30px; width: 24px; height: 24px; border-radius: 50%; background: var(--bg-dark); border: 3px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; z-index: 1; }
                .timeline-icon i { font-size: 14px; color: transparent; }
                .timeline-step.active .timeline-icon { background: #28a745; border-color: #28a745; }
                .timeline-step.active .timeline-icon i { color: #fff; }
                .timeline-line-fill { position: absolute; left: 11px; top: 5px; width: 2px; background: #28a745; z-index: 0; transition: height 0.5s ease; }
                .timeline-content h6 { margin-bottom: 4px; color: rgba(255, 255, 255, 0.4); font-size: 1rem; }
                .timeline-step.active .timeline-content h6 { color: var(--text-light); }
                .timeline-content p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.3); margin-bottom: 0; }
                .timeline-step.active .timeline-content p { color: rgba(255, 255, 255, 0.6); }
                .timeline-message { background: rgba(0, 123, 255, 0.1); padding: 8px 12px; border-radius: 4px; margin-top: 8px; font-size: 0.85rem; color: #6ea8fe; display: inline-block; }
                
                /* Price Details */
                .price-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; color: rgba(255, 255, 255, 0.7); }
                .price-row.total { font-weight: 700; font-size: 1.1rem; color: var(--text-light); }
                .price-row.info { font-size: 0.85rem; margin-bottom: 6px; }
                .price-row.info span:last-child { font-weight: 600; }
                .dashed-top { border-top: 1px dashed rgba(255, 255, 255, 0.2) !important; }
            `}</style>

            <section className="order-details-section">
                <div className="container">
                    <div className="row">
                        {/* Main Info Column */}
                        <div className="col-lg-8 mb-4">
                            {/* Products */}
                            <div>
                                {orderItems && orderItems.map((item) => {
                                    const productImg = item.product?.imageUrl
                                        ? (item.product.imageUrl.startsWith('http') ? item.product.imageUrl : `http://localhost:8000${item.product.imageUrl}`)
                                        : 'https://dummyimage.com/100x100/222/d8a648&text=No+Image';

                                    // Calculate if we should show offer text (basic check)
                                    const showOffer = currentOrder.discountAmount > 0;

                                    return (
                                        <div className="details-card mb-4" key={item.id}>
                                            <div className="row align-items-center">
                                                <div className="col-auto">
                                                    <img src={productImg} alt={item.product?.name} className="product-img" />
                                                </div>
                                                <div className="col">
                                                    <h5 className="text-white mb-2 fs-5">{item.product?.name || 'Unknown Product'}</h5>
                                                    <p className="text-white-50 small mb-2">Quantity: {item.quantity} &bull; Seller: Glow Mystery</p>
                                                    <div className="d-flex align-items-center mb-0">
                                                        <span className="text-white fs-5 fw-bold me-3">₹{(item.price || 0).toFixed(2)}</span>
                                                        {showOffer && <span className="offer-text"><i className="bi bi-tag-fill me-1"></i>Offer applied</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Status */}
                            <div className="details-card">
                                <h5 className="text-gold mb-4 fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Order Status</h5>

                                {status === 'CANCELLED' ? (
                                    <div className="alert alert-danger" style={{ background: 'rgba(220, 53, 69, 0.2)', color: '#dc3545', border: 'none' }}>Order has been Cancelled.</div>
                                ) : (
                                    <div className="timeline">
                                        <div className="timeline-line-fill" style={{ height: fillPercent + '%' }}></div>

                                        <div className={`timeline-step ${sIndex >= 0 ? 'active' : ''}`}>
                                            <div className="timeline-icon"><i className="bi bi-check"></i></div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">Order Confirmed</h6>
                                                <p>{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className={`timeline-step ${sIndex >= 1 ? 'active' : ''}`}>
                                            <div className="timeline-icon"><i className="bi bi-check"></i></div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">Shipped</h6>
                                                <p>{shippedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                {sIndex >= 1 && <div className="timeline-message">Your item is currently shipped.</div>}
                                            </div>
                                        </div>
                                        <div className={`timeline-step ${sIndex >= 2 ? 'active' : ''}`}>
                                            <div className="timeline-icon"><i className="bi bi-check"></i></div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">Out For Delivery</h6>
                                                <p>{outDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className={`timeline-step ${sIndex >= 3 ? 'active' : ''}`}>
                                            <div className="timeline-icon"><i className="bi bi-check"></i></div>
                                            <div className="timeline-content">
                                                <h6 className="fw-bold">Delivered</h6>
                                                <p>{delDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        {/* Return Logic */}
                                        {currentOrder.returnRequest && currentOrder.returnRequest.status !== 'REJECTED' && (
                                            <>
                                                <div className={`timeline-step ${sIndex >= 4 ? 'active' : ''}`}>
                                                    <div className="timeline-icon"><i className="bi bi-arrow-return-left"></i></div>
                                                    <div className="timeline-content">
                                                        <h6 className="fw-bold text-warning">Return Accepted</h6>
                                                        <p>-</p>
                                                    </div>
                                                </div>
                                                <div className={`timeline-step ${sIndex >= 5 ? 'active' : ''}`}>
                                                    <div className="timeline-icon"><i className="bi bi-truck"></i></div>
                                                    <div className="timeline-content">
                                                        <h6 className="fw-bold text-warning">Out For Pickup</h6>
                                                        <p>-</p>
                                                    </div>
                                                </div>
                                                <div className={`timeline-step ${sIndex >= 6 ? 'active' : ''}`}>
                                                    <div className="timeline-icon"><i className="bi bi-check-circle-fill"></i></div>
                                                    <div className="timeline-content">
                                                        <h6 className="fw-bold text-success">Returned Successfully</h6>
                                                        <p>-</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Details Column */}
                        <div className="col-lg-4">
                            {/* Delivery Details */}
                            <div className="details-card mb-4">
                                <h6 className="text-white mb-3 fw-bold border-bottom border-secondary pb-3">Delivery details</h6>

                                <div className="d-flex mb-3 mt-3">
                                    <i className="bi bi-house-door text-gold me-3 mt-1 fs-5"></i>
                                    <div>
                                        <div className="text-white fw-bold mb-1">{addressName}</div>
                                        <div className="text-white-50 small lh-base mb-0">{addressText}</div>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <i className="bi bi-telephone text-gold me-3 fs-5"></i>
                                    <div className="text-white-50 align-self-center small fw-bold">{addressPhone}</div>
                                </div>
                            </div>

                            {/* Price Details */}
                            <div className="details-card">
                                <h6 className="text-white mb-3 fw-bold border-bottom border-secondary pb-3">Price details</h6>

                                <div className="mt-3">
                                    <div className="price-row">
                                        <span>Listing price</span>
                                        <span>₹{subTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Tax</span>
                                        <span>₹{(currentOrder.taxAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span className="text-white-50">Delivery Charges</span>
                                        {deliveryAmount <= 0 ? (
                                            <span className="text-success">Free</span>
                                        ) : (
                                            <span className="text-white">₹{deliveryAmount.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="price-row total dashed-top pt-3 mt-3">
                                    <span>Total Amount</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>

                                <div className="payment-status-container mt-4 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="price-row info mb-2">
                                        <span className="text-white-50">Payment Mode</span>
                                        <span className="text-white">{paymentMethodDisplay}</span>
                                    </div>
                                    <div className="price-row info mb-0">
                                        <span className="text-white-50">Payment Status</span>
                                        <span className={status === 'PENDING' ? 'text-warning text-uppercase' : 'text-success'}>
                                            {status === 'PENDING' ? 'Pending' : 'Paid'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className={actionBtnClass}
                                    style={{ color: actionBtnStyle.color || 'var(--gold-light)', borderColor: actionBtnStyle.borderColor || 'var(--gold-primary)', fontFamily: 'var(--font-body)', opacity: actionBtnStyle.opacity, cursor: actionBtnStyle.cursor, transition: '0.3s' }}
                                    disabled={actionBtnDisabled}
                                    onClick={() => {
                                        if (status === 'DELIVERED' && !currentOrder.returnRequest) {
                                            setShowReturnModal(true);
                                        }
                                    }}
                                >
                                    {actionBtnText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom React Return Request Modal */}
            {showReturnModal && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                    <div className="modal fade show" style={{ display: 'block', zIndex: 1045 }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content bg-dark border-secondary">
                                <div className="modal-header border-secondary">
                                    <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Request a Return</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowReturnModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={submitReturn}>
                                        <div className="mb-3">
                                            <label className="text-white-50 form-label text-sm">Reason for Return</label>
                                            <select className="form-select bg-dark text-white border-secondary" value={returnReason} onChange={(e) => setReturnReason(e.target.value)} required>
                                                <option value="Damaged Product">Damaged Product</option>
                                                <option value="Wrong Item Received">Wrong Item Received</option>
                                                <option value="Quality Unacceptable">Quality Unacceptable</option>
                                                <option value="Changed Mind">Changed Mind</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="text-white-50 form-label text-sm">Detailed Description</label>
                                            <textarea className="form-control bg-dark text-white border-secondary" required rows="3" placeholder="Please elaborate on your reason..." value={returnDesc} onChange={e => setReturnDesc(e.target.value)}></textarea>
                                        </div>
                                        <div className="mb-4">
                                            <label className="text-white-50 form-label text-sm">Upload Photos (Optional, max 5)</label>
                                            <input type="file" className="form-control bg-dark text-white-50 border-secondary" multiple accept="image/*" onChange={(e) => setReturnImages(e.target.files)} />
                                        </div>
                                        <div className="text-end">
                                            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowReturnModal(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-gold" disabled={isReturning}>{isReturning ? 'Submitting...' : 'Submit Request'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default OrderDetails;
