import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminReviews, deleteReview } from '../features/reviewSlice';
import DataTable, { createTheme } from 'react-data-table-component';
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

const AdminReviews = () => {
    const dispatch = useDispatch();
    const { adminReviews: reviews, loading } = useSelector((state) => state.review);
    const [actionLoading, setActionLoading] = useState(false);

    const loadReviews = () => {
        dispatch(fetchAdminReviews());
    };

    useEffect(() => {
        loadReviews();
    }, [dispatch]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Review?',
            text: "Are you certain you want to delete this review? This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--gold-primary)',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, delete it!',
            background: 'var(--bg-dark)',
            color: '#fff'
        });

        if (result.isConfirmed) {
            setActionLoading(true);
            try {
                await dispatch(deleteReview(id)).unwrap();
                toast.success('Review deleted successfully!');
                loadReviews();
            } catch (err) {
                toast.error(err || 'Error deleting review');
            }
            setActionLoading(false);
        }
    };

    const columns = [
        {
            name: 'User Details',
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
            },
            width: '200px'
        },
        {
            name: 'Product',
            selector: row => row.product?.name,
            sortable: true,
            width: '200px'
        },
        {
            name: 'Rating',
            selector: row => row.rating,
            cell: row => {
                const stars = '★'.repeat(row.rating) + '☆'.repeat(5 - row.rating);
                return <span className="text-warning">{stars}</span>;
            },
            sortable: true,
            width: '120px'
        },
        {
            name: 'Comment',
            selector: row => row.comment,
            cell: row => <span className="small text-white-50">{row.comment || <i>No comment text provided</i>}</span>,
            sortable: true,
            width: '35%'
        },
        {
            name: 'Date',
            selector: row => new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
            sortFunction: (rowA, rowB) => new Date(rowA.createdAt) - new Date(rowB.createdAt),
            width: '150px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="text-end w-100">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            ),
            width: '100px'
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
                minHeight: '60px',
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
    };

    return (
        <>
            {actionLoading && <Loader overlay={true} text="Deleting..." />}
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
            .table-hover tbody tr:hover td { background: rgba(216, 166, 72, 0.05); color: #fff; }

            .rdt_Table {
                min-width: 800px;
            }

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
                        <h2 className="text-gold mb-3 mb-sm-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage Product Reviews</h2>
                    </div>

                    <div className="table-responsive">
                        <DataTable
                            columns={columns}
                            data={reviews}
                            progressPending={loading}
                            progressComponent={<div className="text-center py-5"><Loader fullPage={false} text="Loading reviews..." /></div>}
                            pagination
                            theme="darkGold"
                            customStyles={customStyles}
                            noDataComponent={<div className="text-center py-4">No reviews found.</div>}
                        />
                    </div>
                </div>
            </section>
        </>
    );
};

export default AdminReviews;
