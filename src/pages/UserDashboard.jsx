import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchUserOrders } from '../features/orderSlice';
import Loader from '../components/Loader';

const UserDashboard = () => {
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const { orders, pagination, loading } = useSelector((state) => state.order);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [timeFilter, setTimeFilter] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const loadOrders = (page = 1) => {
        dispatch(fetchUserOrders({
            page,
            limit: 5,
            ...(search && { search }),
            ...(statusFilter && { status: statusFilter }),
            ...(timeFilter && { timeframe: timeFilter })
        }));
    };

    useEffect(() => {
        if (token) {
            loadOrders();
        }
    }, [token, statusFilter, timeFilter, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadOrders(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.totalPages) {
            loadOrders(page);
        }
    };

    useEffect(() => {
        const socket = io('http://localhost:8000');

        orders.forEach(order => {
            socket.on(`order_status_${order.id}`, (data) => {
                // To keep state in sync, real-time re-fetch is best or we dispatch a slice action to update only status
                // But re-fetch maintains pagination properly without complex manual slice updates
                loadOrders(pagination.page);
            });
        });

        return () => {
            orders.forEach(order => {
                socket.off(`order_status_${order.id}`);
            });
            socket.disconnect();
        };
    }, [orders]);

    return (
        <>
            <style>{`
                .dashboard-section { padding-top: 140px; padding-bottom: 60px; min-height: 80vh; background: var(--bg-dark); }
                .dashboard-header { font-family: var(--font-heading); color: var(--gold-primary); margin-bottom: 30px; border-bottom: 1px solid rgba(216, 166, 72, 0.2); padding-bottom: 15px; }
                .new-order-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(216, 166, 72, 0.3); border-radius: 6px; padding: 20px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease-in-out; }
                .new-order-card:hover { box-shadow: 0 4px 15px rgba(216, 166, 72, 0.1); border-color: var(--gold-primary); }
                .order-product-img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; background: #f8f9fa; }
                .order-details-col { flex-grow: 1; padding: 0 25px; }
                .order-price-col { min-width: 100px; font-weight: 600; color: #fff; }
                .order-status-col { min-width: 150px; text-align: right; }
                .status-dot { height: 10px; width: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
                .status-dot.delivered { background-color: #28a745; }
                .status-dot.shipped { background-color: #17a2b8; }
                .status-dot.cancelled { background-color: #dc3545; }
                .status-dot.returned { background-color: #6c757d; }
                .status-dot.return_accepted { background-color: #fd7e14; }
                .status-dot.out_for_pickup { background-color: #6f42c1; }
                .status-dot.pending { background-color: #ffc107; }
                .form-check-input:checked { background-color: var(--gold-primary); border-color: var(--gold-primary); }
                .page-link { background-color: transparent; border-color: rgba(216, 166, 72, 0.3); color: var(--gold-light); }
                .page-link:hover { background-color: rgba(216, 166, 72, 0.1); border-color: var(--gold-primary); color: var(--gold-primary); }
                .page-item.active .page-link { background-color: var(--gold-primary); border-color: var(--gold-primary); color: #000; }
                
                @media (max-width: 768px) {
                    .new-order-card { flex-direction: column; align-items: flex-start; }
                    .order-details-col { padding: 15px 0; width: 100%; }
                    .order-price-col { text-align: left !important; width: 100%; margin-bottom: 10px; }
                    .order-status-col { text-align: left !important; width: 100%; }
                    .status-dot { display: inline-block; }
                    .order-status-col .d-flex { justify-content: flex-start !important; }
                }
                    .order-search-input::placeholder {
  color: white;
  opacity: 1;
}

.order-search-input::-webkit-input-placeholder {
  color: white;
}

.order-search-input::-ms-input-placeholder {
  color: white;
}
            `}</style>
            <section className="dashboard-section">
                <div className="container">
                    <div className="row mb-4">
                        <div className="col-12"><h2 className="dashboard-header text-center text-md-start">My Orders</h2></div>
                    </div>

                    <div className="row">
                        <div className="col-md-3 mb-4">
                            <div className="filters-sidebar p-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(216, 166, 72, 0.2)', borderRadius: '8px' }}>
                                <h5 className="text-white mb-3 fw-bold">Filters</h5>
                                <hr style={{ borderColor: 'rgba(216, 166, 72, 0.3)' }} />

                                <div className="mb-4 mt-3">
                                    <h6 className="text-gold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>ORDER STATUS</h6>
                                    {['SHIPPED', 'DELIVERED', 'CANCELLED', 'PENDING'].map(status => (
                                        <div className="form-check mb-2" key={status}>
                                            <input className="form-check-input filter-status" type="checkbox" checked={statusFilter === status} onChange={() => setStatusFilter(statusFilter === status ? '' : status)} />
                                            <label className="form-check-label text-white-50">{status === 'SHIPPED' ? 'On the way (Shipped)' : status.charAt(0) + status.slice(1).toLowerCase()}</label>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-3">
                                    <h6 className="text-gold mb-3" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>ORDER TIME</h6>
                                    {[{ val: 'last30', label: 'Last 30 days' }, { val: '2024', label: '2024' }, { val: '2023', label: '2023' }, { val: 'older', label: 'Older' }, { val: '', label: 'All Time' }].map(time => (
                                        <div className="form-check mb-2" key={time.val}>
                                            <input className="form-check-input filter-time" type="radio" value={time.val} checked={timeFilter === time.val} onChange={() => setTimeFilter(time.val)} />
                                            <label className={`form-check-label ${time.val === '' ? 'text-gold' : 'text-white-50'}`}>{time.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-9 mb-4">
                            <div className="row align-items-center mb-4">
                                <div className="col-12">
                                    <form onSubmit={handleSearch} className="d-flex">
                                        <input
                                            type="text"
                                            className="form-control me-2 order-search-input"
                                            placeholder="Search your orders here by product name..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                                border: '1px solid rgba(216, 166, 72, 0.3)'
                                            }}
                                        />                                        <button type="submit" className="btn btn-gold px-4"><i className="bi bi-search me-2"></i> Search Orders</button>
                                    </form>
                                </div>
                            </div>

                            {loading ? (
                                <Loader overlay={true} />
                            ) : orders.length === 0 ? (
                                <div className="text-center py-5" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(216, 166, 72, 0.2)', borderRadius: '8px' }}>
                                    <i className="bi bi-box-seam text-white-50 mb-3" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-white-50 fs-5">No orders found.</p>
                                    <Link to="/shop" className="btn btn-gold mt-2">Browse Products</Link>
                                </div>
                            ) : (
                                <>
                                    <div id="ordersContainer">
                                        {orders.map(order => {
                                            const date = new Date(order.createdAt).toLocaleDateString();
                                            const mainItem = order.orderItems[0];
                                            const productImg = mainItem.product.imageUrl
                                                ? (mainItem.product.imageUrl.startsWith('http') ? mainItem.product.imageUrl : `http://localhost:8000${mainItem.product.imageUrl}`)
                                                : 'https://dummyimage.com/80x80/222/d8a648&text=Pic';
                                            const productName = mainItem.product.name;

                                            return (
                                                <div className="new-order-card" key={order.id}>
                                                    <div className="d-flex align-items-center flex-grow-1">
                                                        <img src={productImg} alt="Product" className="order-product-img" />
                                                        <div className="order-details-col">
                                                            <h5 className="text-white mb-1 fs-5">{productName}</h5>
                                                            {order.orderItems.length > 1 && <><br /><small className="text-white-50">and {order.orderItems.length - 1} other item(s)</small></>}
                                                            <div className="mt-2"><small className="text-white-50">{date}</small></div>
                                                        </div>
                                                    </div>

                                                    <div className="order-price-col text-end me-4">
                                                        <span className="fs-5">₹{order.totalAmount.toFixed(2)}</span>
                                                    </div>

                                                    <div className="order-status-col text-end">
                                                        <div className="mb-2 d-flex justify-content-end align-items-center">
                                                            <span className={`status-dot ${order.status.toLowerCase()}`}></span>
                                                            <span className="text-white-50 fw-bold">{order.status.replace(/_/g, ' ')}</span>
                                                        </div>
                                                        {order.status === 'DELIVERED' ? (
                                                            <Link to={`/product/${mainItem.productId}`} style={{ display: 'block', color: 'var(--gold-light)', fontSize: '0.85rem', marginBottom: '8px', textDecoration: 'none' }}>
                                                                <i className="bi bi-star-fill me-1"></i> Rate & Reviews
                                                            </Link>
                                                        ) : (
                                                            ['RETURN_ACCEPTED', 'OUT_FOR_PICKUP', 'RETURNED'].includes(order.status)
                                                                ? <small className="text-warning d-block mb-2">Item Return in Process</small>
                                                                : <small className="text-white-50 d-block mb-2">Your item is being processed</small>
                                                        )}
                                                        <Link to={`/dashboard/order/${order.id}`} className="btn btn-sm btn-outline-light mt-1 w-100" style={{ fontSize: '0.8rem' }}>View Details</Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {pagination.totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-5">
                                            <ul className="pagination">
                                                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>Previous</button>
                                                </li>
                                                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                                                    <li key={i + 1} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                                                    <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>Next</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default UserDashboard;
