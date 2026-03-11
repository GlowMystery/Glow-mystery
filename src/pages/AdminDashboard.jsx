import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchAdminStats } from '../features/adminSlice';
import { fetchAdminOrders, updateOrderStatus } from '../features/orderSlice';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { stats, loadingStats } = useSelector((state) => state.admin);
    const { adminOrders, loading: loadingOrders } = useSelector((state) => state.order);
    const [actionLoading, setActionLoading] = useState(false);

    const recentOrders = adminOrders ? adminOrders.slice(0, 5) : [];
    const loading = loadingStats || loadingOrders;

    const loadDashboardData = () => {
        dispatch(fetchAdminStats());
        dispatch(fetchAdminOrders());
    };

    useEffect(() => {
        loadDashboardData();

        const socket = io('http://localhost:8000');
        socket.emit('join_admin_room');

        socket.on('new_order', (data) => {
            toast.info(`New order #${data.orderId} from ${data.customerName} for ₹${data.totalAmount}`);
            loadDashboardData();
        });

        socket.on('order_updated', () => {
            loadDashboardData();
        });

        const intervalId = setInterval(loadDashboardData, 60000);

        return () => {
            clearInterval(intervalId);
            socket.off('new_order');
            socket.off('order_updated');
            socket.disconnect();
        };
    }, [dispatch]);

    const changeOrderStatus = async (orderId, newStatus) => {
        setActionLoading(true);
        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
            toast.success('Order status updated!');
            loadDashboardData();
        } catch (err) {
            toast.error(err || 'Failed to update status');
        }
        setActionLoading(false);
    };

    return (
        <>
            {actionLoading && <Loader overlay={true} text="Updating..." />}
            <style>{`

            .admin-section {
                padding-top: 140px;
                padding-bottom: 60px;
                min-height: 80vh;
                width: 100%;
            }

            .stat-card {
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(216,166,72,0.2);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                transition: 0.3s;
                height: 100%;
            }

            .stat-card:hover {
                background: rgba(255,255,255,0.05);
                border-color: var(--gold-primary);
            }

            .stat-card h3 {
                font-size: 2rem;
                color: var(--gold-light);
                margin-bottom: 5px;
            }

            .stat-card p {
                color: rgba(255,255,255,0.7);
                margin-bottom: 0;
                text-transform: uppercase;
                font-size: 0.85rem;
                letter-spacing: 1px;
            }

            .table-dark-custom {
                background: rgba(20,20,20,0.8) !important;
                color: #fff !important;
            }

            .table-dark-custom th {
                background: rgba(30,30,30,0.9) !important;
                border-bottom: 1px solid rgba(216,166,72,0.3) !important;
                color: var(--gold-primary);
            }

            .table-dark-custom td {
                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                vertical-align: middle;
            }

            .order-row:hover {
                background: rgba(255,255,255,0.02);
            }

            .status-select {
                min-width: 130px;
            }

            table {
                min-width: 650px;
            }

            @media (max-width: 992px) {
                .stat-card h3 {
                    font-size: 1.7rem;
                }
            }

            @media (max-width: 768px) {
                .admin-section {
                    padding-top: 25px;
                    padding-bottom: 25px;
                }

                .stat-card {
                    padding: 16px;
                }

                .stat-card h3 {
                    font-size: 1.5rem;
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

                    <div className="row mb-4 mt-3">
                        <div className="col-12">
                            <h2 className="text-gold">Admin Overview</h2>
                            <p className="text-white-50">Monitor sales, users, and manage orders.</p>
                        </div>
                    </div>

                    <div className="row g-4 mb-5">

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="stat-card">
                                <h3>₹{stats.totalEarnings?.toFixed(2) || '0.00'}</h3>
                                <p>Total Earnings</p>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="stat-card">
                                <h3>{stats.totalOrders || 0}</h3>
                                <p>Total Orders</p>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="stat-card">
                                <h3>{stats.totalUsers || 0}</h3>
                                <p>Total Users</p>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <div className="stat-card">
                                <h3>Top</h3>
                                <p>
                                    {stats.mostSoldProducts && stats.mostSoldProducts.length > 0
                                        ? stats.mostSoldProducts[0].name
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <div className="col-12">
                            <h4 className="text-white mb-3">Recent Orders</h4>

                            <div className="table-responsive">

                                <table className="table table-dark table-dark-custom">

                                    <thead>
                                        <tr>
                                            {/* <th>Order ID</th> */}
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4">
                                                    <Loader fullPage={false} text="Loading orders..." />
                                                </td>
                                            </tr>
                                        ) : recentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4">
                                                    No recent orders.
                                                </td>
                                            </tr>
                                        ) : (
                                            recentOrders.map(o => (
                                                <tr className="order-row" key={o.id}>
                                                    {/* <td>#{o.id}</td> */}

                                                    <td>
                                                        <div>{o.user?.name}</div>
                                                        <small className="text-white-50">
                                                            {o.user?.email}
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {new Date(o.createdAt).toLocaleDateString()}
                                                    </td>

                                                    <td className="text-gold fw-bold">
                                                        ₹{o.totalAmount.toFixed(2)}
                                                    </td>

                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm bg-dark text-white border-secondary status-select"
                                                            value={o.status}
                                                            onChange={(e) =>
                                                                changeOrderStatus(o.id, e.target.value)
                                                            }
                                                        >
                                                            {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']
                                                                .map(s => (
                                                                    <option key={s} value={s}>
                                                                        {s}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </td>

                                                </tr>
                                            ))
                                        )}
                                    </tbody>

                                </table>

                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
};

export default AdminDashboard;