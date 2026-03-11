import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../features/productSlice';
import DataTable, { createTheme } from 'react-data-table-component';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';

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

const AdminProducts = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.product);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Add form state
    const [addForm, setAddForm] = useState({ name: '', description: '', price: '', stock: '', image: null });
    // Edit form state
    const [editForm, setEditForm] = useState({ id: '', name: '', description: '', price: '', stock: '', image: null });

    const addModalRef = useRef(null);
    const editModalRef = useRef(null);

    const loadProducts = () => {
        dispatch(fetchProducts());
    };

    useEffect(() => {
        loadProducts();

        const socket = io('http://localhost:8000');
        socket.on('product_updated', () => {
            loadProducts();
        });

        return () => {
            socket.off('product_updated');
            socket.disconnect();
        };
    }, [dispatch]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const formData = new FormData();
        formData.append('name', addForm.name);
        formData.append('description', addForm.description);
        formData.append('price', addForm.price);
        formData.append('stock', addForm.stock);
        if (addForm.image) formData.append('image', addForm.image);

        try {
            await dispatch(createProduct(formData)).unwrap();
            setAddForm({ name: '', description: '', price: '', stock: '', image: null });
            if (window.bootstrap) {
                const modal = window.bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                if (modal) modal.hide();
            }
            toast.success('Product added successfully!');
            loadProducts();
        } catch (err) {
            toast.error(err || 'Error adding product');
        }
        setActionLoading(false);
    };

    const handleEditOpen = (product) => {
        setEditForm({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: null
        });
        if (window.bootstrap) {
            const modal = new window.bootstrap.Modal(document.getElementById('editProductModal'));
            modal.show();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('description', editForm.description);
        formData.append('price', editForm.price);
        formData.append('stock', editForm.stock);
        if (editForm.image) formData.append('image', editForm.image);

        try {
            await dispatch(updateProduct({ id: editForm.id, productData: formData })).unwrap();
            if (window.bootstrap) {
                const modal = window.bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
                if (modal) modal.hide();
            }
            toast.success('Product updated successfully!');
            loadProducts();
        } catch (err) {
            toast.error(err || 'Error updating product');
        }
        setActionLoading(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Product?',
            text: "This action cannot be undone.",
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
                await dispatch(deleteProduct(id)).unwrap();
                toast.success('Product deleted successfully!');
                loadProducts();
            } catch (err) {
                toast.error(err || 'Error deleting product');
            }
            setActionLoading(false);
        }
    };

    const columns = [
        {
            name: 'Image',
            cell: row => <img src={row.imageUrl?.startsWith('http') ? row.imageUrl : `http://localhost:8000${row.imageUrl}`} className="img-preview" alt="Product" />,
            width: '100px'
        },
        {
            name: 'Name',
            selector: row => row.name,
            cell: row => <span className="fw-bold text-gold">{row.name}</span>,
            sortable: true,
            width: '250px'
        },
        {
            name: 'Description',
            selector: row => row.description,
            cell: row => <span className="small text-white-50">{row.description.length > 40 ? row.description.substring(0, 40) + '...' : row.description}</span>,
            sortable: true,
            width: '300px'
        },
        {
            name: 'Price',
            selector: row => row.price,
            cell: row => <span>₹{row.price.toFixed(2)}</span>,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Stock',
            selector: row => row.stock,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="text-end w-100">
                    <button className="btn btn-sm btn-outline-light me-1" onClick={() => handleEditOpen(row)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>
                </div>
            ),
            width: '120px'
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
            .table-hover tbody tr:hover td { background: rgba(216, 166, 72, 0.05); color: #fff; }
            .modal-content.bg-dark { border: 1px solid var(--gold-primary); }
            .modal-header.border-secondary, .modal-footer.border-secondary { border-color: rgba(216, 166, 72, 0.2) !important; }
            .form-control.bg-dark, .form-select.bg-dark { color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
            .form-control.bg-dark:focus, .form-select.bg-dark:focus { border-color: var(--gold-primary); box-shadow: 0 0 0 0.25rem rgba(216, 166, 72, 0.25); }
            .img-preview { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--gold-primary); }

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
                        <h2 className="text-gold mb-3 mb-sm-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage Products</h2>
                        <div className="d-flex flex-column flex-sm-row gap-3">
                            <div className="input-group" style={{ width: 'auto', minWidth: '250px' }}>
                                <span className="input-group-text bg-dark border-secondary" style={{ color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-secondary shadow-none"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-gold text-nowrap" data-bs-toggle="modal" data-bs-target="#addProductModal">
                                <i className="bi bi-box-seam me-1"></i> Add Product
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <DataTable
                            columns={columns}
                            data={products.filter(p =>
                                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
                            )}
                            progressPending={loading}
                            progressComponent={<div className="text-center py-5"><Loader fullPage={false} text="Loading products..." /></div>}
                            pagination
                            theme="darkGold"
                            customStyles={customStyles}
                            noDataComponent={<div className="text-center py-4">No products found. Add one above!</div>}
                        />
                    </div>
                </div>
            </section>

            {/* Add Product Modal */}
            <div className="modal fade" id="addProductModal" tabIndex="-1" aria-hidden="true" ref={addModalRef}>
                <div className="modal-dialog">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Add New Product</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Product Name</label>
                                    <input type="text" className="form-control bg-dark" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Description</label>
                                    <textarea className="form-control bg-dark" rows="3" required value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })}></textarea>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white-50 text-sm">Price (₹)</label>
                                        <input type="number" step="0.01" className="form-control bg-dark" required value={addForm.price} onChange={e => setAddForm({ ...addForm, price: e.target.value })} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white-50 text-sm">Stock Quantity</label>
                                        <input type="number" className="form-control bg-dark" required value={addForm.stock} onChange={e => setAddForm({ ...addForm, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Product Image</label>
                                    <input type="file" className="form-control bg-dark" accept="image/*" required onChange={e => setAddForm({ ...addForm, image: e.target.files[0] })} />
                                </div>
                                <div className="text-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-gold ms-2" disabled={actionLoading}>
                                        {actionLoading ? 'Uploading...' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Product Modal */}
            <div className="modal fade" id="editProductModal" tabIndex="-1" aria-hidden="true" ref={editModalRef}>
                <div className="modal-dialog">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Edit Product</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Product Name</label>
                                    <input type="text" className="form-control bg-dark" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Description</label>
                                    <textarea className="form-control bg-dark" rows="3" required value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}></textarea>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white-50 text-sm">Price (₹)</label>
                                        <input type="number" step="0.01" className="form-control bg-dark" required value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-white-50 text-sm">Stock Quantity</label>
                                        <input type="number" className="form-control bg-dark" required value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Update Image (Optional)</label>
                                    <input type="file" className="form-control bg-dark" accept="image/*" onChange={e => setEditForm({ ...editForm, image: e.target.files[0] })} />
                                </div>
                                <div className="text-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-gold ms-2" disabled={actionLoading}>
                                        {actionLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminProducts;
