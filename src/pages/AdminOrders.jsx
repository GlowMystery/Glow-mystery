import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import DataTable, { createTheme } from 'react-data-table-component';
import { fetchAdminOrders, updateOrderStatus, updateReturnStatus } from '../features/orderSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

createTheme('darkGold', {
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
    },
    background: {
        default: 'rgba(20, 20, 20, 0.8)',
    },
    context: {
        background: 'rgba(216, 166, 72, 0.2)',
        text: '#FFFFFF',
    },
    divider: {
        default: 'rgba(255, 255, 255, 0.05)',
    },
    button: {
        default: 'var(--gold-primary)',
        hover: 'rgba(216, 166, 72, 0.2)',
        focus: 'rgba(216, 166, 72, 0.3)',
        hoverText: '#ffffff',
    },
}, 'dark');

const AdminOrders = () => {
    const dispatch = useDispatch();
    const { adminOrders: orders, loading } = useSelector((state) => state.order);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const token = localStorage.getItem('token');

    // Return Modals state
    const [returnReq, setReturnReq] = useState(null);
    const [adminReason, setAdminReason] = useState('');
    const [adminAction, setAdminAction] = useState('ACCEPTED');
    const [verifySameProduct, setVerifySameProduct] = useState(false);
    const [verifySeal, setVerifySeal] = useState(false);

    // Main Order returned state
    const [pendingOrderId, setPendingOrderId] = useState(null);

    const loadOrders = () => {
        dispatch(fetchAdminOrders());
    };

    useEffect(() => {
        loadOrders();

        const socket = io('https://glow-mystery-backend.vercel.app/');
        socket.emit('join_admin_room');
        socket.on('new_order', (data) => {
            toast.info(`New order #${data.orderId} from ${data.customerName}`);
            loadOrders();
        });

        socket.on('order_updated', () => {
            loadOrders();
        });

        return () => {
            socket.off('new_order');
            socket.off('order_updated');
            socket.disconnect();
        }
    }, [dispatch, token]);

    const changeOrderStatus = async (orderId, newStatus) => {
        if (newStatus === 'RETURNED') {
            setPendingOrderId(orderId);
            setVerifySameProduct(false);
            setVerifySeal(false);
            if (window.bootstrap) {
                new window.bootstrap.Modal(document.getElementById('mainStatusVerifyModal')).show();
            }
            return;
        }

        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success('Order status updated!');
            loadOrders();
        } catch (err) {
            toast.error(err || 'Failed to update status');
            loadOrders(); // reset select
        }
    };

    const confirmMainStatusReturned = async () => {
        if (!verifySameProduct || !verifySeal) {
            toast.warning('You must verify both delivery conditions before marking this item as Returned.');
            return;
        }
        setActionLoading(true);
        try {
            await dispatch(updateOrderStatus({ orderId: pendingOrderId, status: 'RETURNED' })).unwrap();
            if (window.bootstrap) {
                window.bootstrap.Modal.getInstance(document.getElementById('mainStatusVerifyModal'))?.hide();
            }
            toast.success('Order status updated to RETURNED!');
            loadOrders();
        } catch (err) {
            toast.error(err || 'Failed to update status');
        }
        setActionLoading(false);
    };

    const openReturnModal = (r) => {
        setReturnReq(r);
        setAdminAction(r.status !== 'PENDING' ? r.status : 'ACCEPTED');
        setAdminReason(r.adminReason || '');
        setVerifySameProduct(false);
        setVerifySeal(false);
        if (window.bootstrap) {
            new window.bootstrap.Modal(document.getElementById('adminReturnModal')).show();
        }
    };

    const submitReturnDecision = async () => {
        if (adminAction === 'REJECTED' && !adminReason.trim()) {
            toast.warning('Please provide a reason for rejecting the return.');
            return;
        }
        if (adminAction === 'RETURNED' && (!verifySameProduct || !verifySeal)) {
            toast.warning('You must verify both delivery conditions before marking this item as Returned.');
            return;
        }

        setActionLoading(true);
        try {
            await dispatch(updateReturnStatus({ returnId: returnReq.id, status: adminAction, adminReason })).unwrap();
            if (window.bootstrap) {
                window.bootstrap.Modal.getInstance(document.getElementById('adminReturnModal'))?.hide();
            }
            toast.success('Return status updated!');
            loadOrders();
        } catch (err) {
            toast.error(err || 'Error updating return status.');
        }
        setActionLoading(false);
    };

    // Expanded Component for order details
    const ExpandedComponent = ({ data }) => {
        const isPaid = data.status !== 'PENDING' && data.status !== 'CANCELLED';
        const paymentMode = data.razorpayPaymentId || data.razorpayOrderId ? 'Online (Razorpay)' : 'Cash on Delivery';

        return (
            <div className="p-4" style={{ backgroundColor: 'rgba(216, 166, 72, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h6 className="text-gold border-bottom border-secondary pb-1">Delivery Address</h6>
                        {data.shippingStreet ? (
                            <div className="text-white-50 small">
                                <div className="fw-bold">{data.shippingName}</div>
                                <div>{data.shippingStreet}</div>
                                <div>{data.shippingCity}, {data.shippingState} {data.shippingZip}</div>
                                <div>Phone: {data.shippingPhone || data.user?.phone || 'N/A'}</div>
                            </div>
                        ) : (
                            <span className="text-white-50 small">No shipping address provided.</span>
                        )}
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h6 className="text-gold border-bottom border-secondary pb-1">Payment Info</h6>
                        <div className="text-white-50 small">
                            <div className="mb-1"><strong>Method:</strong> {paymentMode}</div>
                            <div>
                                <strong>Status:</strong>{' '}
                                {isPaid ? (
                                    <span className="text-success"><i className="bi bi-check-circle"></i> Paid</span>
                                ) : (
                                    <span className="text-warning"><i className="bi bi-x-circle"></i> Unpaid</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <h6 className="text-gold border-bottom border-secondary pb-1">Order Items</h6>
                        <div className="text-white-50 small">
                            {data.orderItems && data.orderItems.length > 0 ? (
                                <ul className="list-unstyled mb-0">
                                    {data.orderItems.map((item, idx) => (
                                        <li key={idx} className="mb-1 d-flex justify-content-between">
                                            <span>{item.quantity}x {item.product?.name || `Product #${item.productId}`}</span>
                                            <span className="text-white">₹{item.price}</span>
                                        </li>
                                    ))}
                                    <li className="mt-2 pt-2 border-top border-secondary d-flex justify-content-between">
                                        <strong className="text-gold">Total</strong>
                                        <strong className="text-gold">₹{data.totalAmount?.toFixed(2)}</strong>
                                    </li>
                                </ul>
                            ) : (
                                <span>No items found.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // DataTable Columns Definition
    const columns = [
        // {
        //     name: 'Order ID',
        //     selector: row => `#${row.id}`,
        //     sortable: true,
        //     width: '120px'
        // },
        {
            name: 'Customer',
            cell: row => (
                <div>
                    <div className="fw-bold">{row.user?.name}</div>
                    <small className="text-white-50">{row.user?.email}</small>
                </div>
            ),
            sortable: true,
            sortFunction: (rowA, rowB) => {
                const a = rowA.user?.name?.toLowerCase() || '';
                const b = rowB.user?.name?.toLowerCase() || '';
                if (a > b) return 1;
                if (b > a) return -1;
                return 0;
            }
        },
        {
            name: 'Date',
            selector: row => new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
            sortFunction: (rowA, rowB) => {
                const dateA = new Date(rowA.createdAt);
                const dateB = new Date(rowB.createdAt);
                return dateA - dateB;
            },
            width: '150px'
        },
        {
            name: 'Amount',
            selector: row => row.totalAmount,
            cell: row => <span className="text-gold fw-bold">₹{row.totalAmount.toFixed(2)}</span>,
            sortable: true,
            width: '150px'
        },
        {
            name: 'Status',
            cell: row => (
                <select
                    className="form-select form-select-sm bg-dark text-white border-secondary w-auto"
                    value={row.status}
                    onChange={(e) => changeOrderStatus(row.id, e.target.value)}
                    style={{ minWidth: '130px' }}
                >
                    {['PENDING', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_ACCEPTED', 'OUT_FOR_PICKUP', 'RETURNED'].map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            ),
            width: '200px'
        },
        {
            name: 'Return Status',
            cell: row => {
                let badgeColor = 'secondary';
                if (row.returnRequest) {
                    badgeColor = row.returnRequest.status === 'PENDING' ? 'warning text-dark' : (row.returnRequest.status === 'ACCEPTED' ? 'success' : 'danger');
                    return (
                        <div className="d-flex align-items-center">
                            <span className={`badge bg-${badgeColor} me-2`}>{row.returnRequest.status}</span>
                            <button className="btn btn-sm btn-outline-light" style={{ fontSize: '0.75rem' }} onClick={() => openReturnModal(row.returnRequest)}>Review</button>
                        </div>
                    );
                }
                return <span className="text-white-50">-</span>;
            },
            width: '200px'
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: 'rgba(30, 30, 30, 0.9)',
                borderBottom: '1px solid rgba(216, 166, 72, 0.3)',
            },
        },
        headCells: {
            style: {
                color: 'var(--gold-primary)',
                fontWeight: '600',
                fontSize: '15px'
            },
        },
        rows: {
            style: {
                minHeight: '72px',
                '&:not(:last-of-type)': {
                    borderBottomStyle: 'solid',
                    borderBottomWidth: '1px',
                    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                },
                '&:hover': {
                    backgroundColor: 'rgba(216, 166, 72, 0.05)',
                },
            },
        },
        pagination: {
            style: {
                color: 'var(--gold-light)',
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            },
            pageButtonsStyle: {
                color: 'var(--gold-primary)',
                fill: 'var(--gold-primary)',
                backgroundColor: 'transparent',
                '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.2)',
                    fill: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover:not(:disabled)': {
                    backgroundColor: 'rgba(216, 166, 72, 0.1)',
                },
                '&:focus': {
                    outline: 'none',
                    backgroundColor: 'rgba(216, 166, 72, 0.2)',
                },
            },
        },
        expanderCell: {
            style: {
                color: 'var(--gold-primary)',
            },
        },
        expanderButton: {
            style: {
                color: 'var(--gold-primary)',
                fill: 'var(--gold-primary)',
                '&:hover:enabled': {
                    backgroundColor: 'rgba(216, 166, 72, 0.1)',
                },
                '&:focus': {
                    outline: 'none',
                    backgroundColor: 'rgba(216, 166, 72, 0.2)',
                },
                svg: {
                    fill: 'var(--gold-primary)',
                }
            },
        },
    };

    return (
        <>
            {actionLoading && <Loader overlay={true} text="Processing..." />}
            <style>{`
            .admin-section {
                padding-top: 140px;
                padding-bottom: 60px;
                min-height: 80vh;
                width: 100%;
            }
            .table-dark-custom { background: rgba(20, 20, 20, 0.8) !important; color: #fff !important; }
            .table-dark-custom th { background: rgba(30, 30, 30, 0.9) !important; border-bottom: 1px solid rgba(216, 166, 72, 0.3) !important; color: var(--gold-primary); font-weight: 600; }
            .table-dark-custom td { border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; vertical-align: middle; }
            
            .rdt_Table {
                min-width: 800px;
            }

            .order-row:hover { background: rgba(216, 166, 72, 0.05); }
            .modal-content.table-dark-custom { border: 1px solid rgba(216, 166, 72, 0.3); }

            @media (max-width: 768px) {
                .admin-section {
                    padding-top: 25px;
                    padding-bottom: 25px;
                }
            }
            @media (max-width: 576px) {
                h2.text-gold {
                    font-size: 1.6rem;
                }
            }
            `}</style>
            <section className="admin-section">
                <div className="container-fluid px-3 px-sm-4 px-lg-5">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center justify-content-sm-between mb-4 mt-3">
                        <h2 className="text-gold mb-3 mb-sm-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage All Orders</h2>
                        <div className="input-group" style={{ width: 'auto', minWidth: '250px' }}>
                            <span className="input-group-text bg-dark border-secondary" style={{ color: 'var(--gold-primary)' }}>
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control bg-dark text-white border-secondary shadow-none"
                                placeholder="Search orders by customer or status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <DataTable
                            columns={columns}
                            data={orders.filter(o =>
                                o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                o.status.toLowerCase().includes(searchQuery.toLowerCase())
                            )}
                            progressPending={loading}
                            progressComponent={<div className="text-center py-5"><Loader fullPage={false} text="Loading orders..." /></div>}
                            pagination
                            theme="darkGold"
                            customStyles={customStyles}
                            noDataComponent={<div className="text-center py-4">No orders found.</div>}
                            expandableRows
                            expandableRowsComponent={ExpandedComponent}
                        />
                    </div>
                </div>
            </section>

            {/* Admin Return Modal */}
            <div className="modal fade" id="adminReturnModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content table-dark-custom">
                        <div className="modal-header border-bottom border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Review Return Request</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            {returnReq && (
                                <>
                                    <div className="mb-3">
                                        <h6 className="text-white-50 mb-1 border-bottom border-secondary pb-1">Reason for Return</h6>
                                        <p className="text-white fw-bold mb-3">{returnReq.reason}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h6 className="text-white-50 mb-1 border-bottom border-secondary pb-1">Description</h6>
                                        <p className="text-white mb-3" style={{ whiteSpace: 'pre-wrap' }}>{returnReq.description}</p>
                                    </div>
                                    {returnReq.images && returnReq.images.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="text-white-50 mb-2 border-bottom border-secondary pb-1">Attached Images</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {returnReq.images.map((img, i) => (
                                                    <a href={img} target="_blank" rel="noreferrer" key={i}>
                                                        <img src={img} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid var(--gold-primary)', borderRadius: '4px' }} alt="Return Attachment" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-3 border-top border-secondary pt-3 mt-4">
                                        <label className="form-label text-gold">Admin Decision</label>
                                        <select className="form-select bg-dark text-white border-secondary mb-3" value={adminAction} onChange={e => setAdminAction(e.target.value)}>
                                            <option value="ACCEPTED">Accept Return</option>
                                            <option value="REJECTED">Reject Return</option>
                                            <option value="OUT_FOR_PICKUP">Out For Pickup</option>
                                            <option value="RETURNED">Returned (Verified)</option>
                                        </select>

                                        {adminAction === 'REJECTED' && (
                                            <div>
                                                <label className="form-label text-danger">Rejection Reason</label>
                                                <textarea className="form-control bg-dark text-white border-secondary" rows="2" placeholder="Explain why..." value={adminReason} onChange={e => setAdminReason(e.target.value)}></textarea>
                                            </div>
                                        )}

                                        {adminAction === 'RETURNED' && (
                                            <div className="mt-3 p-3 border border-warning rounded" style={{ background: 'rgba(255,193,7,0.05)' }}>
                                                <h6 className="text-warning mb-2">Delivery Verification Checklist</h6>
                                                <div className="form-check mb-2">
                                                    <input className="form-check-input" type="checkbox" checked={verifySameProduct} onChange={e => setVerifySameProduct(e.target.checked)} />
                                                    <label className="form-check-label text-white-50">Is it the exact same product originally delivered?</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={verifySeal} onChange={e => setVerifySeal(e.target.checked)} />
                                                    <label className="form-check-label text-white-50">Is the packaging/seal intact and unbroken?</label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer border-top border-secondary">
                            <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-gold" onClick={submitReturnDecision} disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save Decision'}</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Status Verification Modal */}
            <div className="modal fade" id="mainStatusVerifyModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content table-dark-custom">
                        <div className="modal-header border-bottom border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Verify Return Delivery</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="text-white">Before marking this entire order as <strong>RETURNED</strong>, please verify the following:</p>
                            <p className="text-warning small mb-3"><i className="bi bi-info-circle me-1"></i> Confirming this return will automatically dispatch a full refund to the customer's original payment method.</p>

                            <div className="p-3 border border-warning rounded" style={{ background: 'rgba(255,193,7,0.05)' }}>
                                <div className="form-check mb-3">
                                    <input className="form-check-input" type="checkbox" checked={verifySameProduct} onChange={e => setVerifySameProduct(e.target.checked)} />
                                    <label className="form-check-label text-white-50">Is it the exact same product originally delivered?</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" checked={verifySeal} onChange={e => setVerifySeal(e.target.checked)} />
                                    <label className="form-check-label text-white-50">Is the packaging/seal intact and unbroken?</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top border-secondary">
                            <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal" onClick={() => loadOrders()}>Cancel</button>
                            <button type="button" className="btn btn-gold" onClick={confirmMainStatusReturned}>Confirm Return</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminOrders;
