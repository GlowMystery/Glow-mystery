import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../features/discountSlice';
import DataTable, { createTheme } from 'react-data-table-component';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

createTheme('darkGold', {
    text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.7)' },
    background: { default: 'rgba(20,20,20,0.8)' },
    context: { background: 'rgba(216,166,72,0.2)', text: '#FFFFFF' },
    divider: { default: 'rgba(255,255,255,0.05)' },
    button: { default: 'var(--gold-primary)', hover: 'rgba(216,166,72,0.2)', focus: 'rgba(216,166,72,0.3)', hoverText: '#ffffff' },
}, 'dark');

const emptyForm = { code: '', type: 'PERCENTAGE', value: '', minOrderAmount: '', maxUses: '', isActive: true, expiresAt: '' };

const FormFields = ({ form, setForm }) => (
    <>
        <div className="row g-3">
            <div className="col-md-6">
                <label className="form-label text-white-50">Coupon Code</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" required
                    value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. GLOW20" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            </div>
            <div className="col-md-6">
                <label className="form-label text-white-50">Discount Type</label>
                <select className="form-select bg-dark text-white border-secondary" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                </select>
            </div>
            <div className="col-md-6">
                <label className="form-label text-white-50">{form.type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount (₹)'}</label>
                <input type="number" min="0" step="0.01" className="form-control bg-dark text-white border-secondary" required
                    value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            </div>
            <div className="col-md-6">
                <label className="form-label text-white-50">Min. Order Amount (₹)</label>
                <input type="number" min="0" step="0.01" className="form-control bg-dark text-white border-secondary"
                    value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0 = no minimum" />
            </div>
            <div className="col-md-6">
                <label className="form-label text-white-50">Max Uses (blank = unlimited)</label>
                <input type="number" min="1" className="form-control bg-dark text-white border-secondary"
                    value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="Leave blank for unlimited" />
            </div>
            <div className="col-md-6">
                <label className="form-label text-white-50">Expiry Date (optional)</label>
                <input type="date" className="form-control bg-dark text-white border-secondary"
                    value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="col-12">
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="isActiveCheck" checked={form.isActive}
                        onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    <label className="form-check-label text-white-50" htmlFor="isActiveCheck">Active</label>
                </div>
            </div>
        </div>
    </>
);

const AdminDiscounts = () => {
    const dispatch = useDispatch();
    const { discounts, loading } = useSelector((state) => state.discounts);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addForm, setAddForm] = useState(emptyForm);
    const [editForm, setEditForm] = useState({ ...emptyForm, id: '' });

    const loadDiscounts = () => dispatch(fetchDiscounts());

    useEffect(() => { loadDiscounts(); }, [dispatch]);

    const openModal = (id) => { if (window.bootstrap) new window.bootstrap.Modal(document.getElementById(id)).show(); };
    const closeModal = (id) => { if (window.bootstrap) window.bootstrap.Modal.getInstance(document.getElementById(id))?.hide(); };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await dispatch(createDiscount({
                ...addForm,
                value: parseFloat(addForm.value),
                minOrderAmount: parseFloat(addForm.minOrderAmount) || 0,
                maxUses: addForm.maxUses ? parseInt(addForm.maxUses) : null,
                expiresAt: addForm.expiresAt || null
            })).unwrap();
            closeModal('addDiscountModal');
            setAddForm(emptyForm);
            toast.success('Discount created successfully!');
        } catch (err) {
            toast.error(err || 'Error creating discount');
        }
        setActionLoading(false);
    };

    const handleEditOpen = (discount) => {
        setEditForm({
            id: discount.id,
            code: discount.code,
            type: discount.type,
            value: discount.value,
            minOrderAmount: discount.minOrderAmount,
            maxUses: discount.maxUses || '',
            isActive: discount.isActive,
            expiresAt: discount.expiresAt ? discount.expiresAt.substring(0, 10) : ''
        });
        openModal('editDiscountModal');
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await dispatch(updateDiscount({
                id: editForm.id,
                discountData: {
                    code: editForm.code,
                    type: editForm.type,
                    value: parseFloat(editForm.value),
                    minOrderAmount: parseFloat(editForm.minOrderAmount) || 0,
                    maxUses: editForm.maxUses ? parseInt(editForm.maxUses) : null,
                    isActive: editForm.isActive,
                    expiresAt: editForm.expiresAt || null
                }
            })).unwrap();
            closeModal('editDiscountModal');
            toast.success('Discount updated successfully!');
        } catch (err) {
            toast.error(err || 'Error updating discount');
        }
        setActionLoading(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Discount?',
            text: 'This action cannot be undone.',
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
                await dispatch(deleteDiscount(id)).unwrap();
                toast.success('Discount deleted!');
            } catch (err) {
                toast.error(err || 'Error deleting discount');
            }
            setActionLoading(false);
        }
    };

    const columns = [
        {
            name: 'Code',
            selector: row => row.code,
            cell: row => <span className="fw-bold text-gold" style={{ letterSpacing: '0.1em' }}>{row.code}</span>,
            sortable: true,
            width: '150px'
        },
        {
            name: 'Type',
            selector: row => row.type,
            cell: row => (
                <span className={`badge ${row.type === 'PERCENTAGE' ? 'bg-info' : 'bg-warning text-dark'}`}>
                    {row.type === 'PERCENTAGE' ? '% Off' : '₹ Flat'}
                </span>
            ),
            width: '100px'
        },
        {
            name: 'Value',
            selector: row => row.value,
            cell: row => <span>{row.type === 'PERCENTAGE' ? `${row.value}%` : `₹${row.value}`}</span>,
            sortable: true,
            width: '100px'
        },
        {
            name: 'Min Order',
            selector: row => row.minOrderAmount,
            cell: row => <span className="text-white-50">₹{row.minOrderAmount}</span>,
            sortable: true,
            width: '120px'
        },
        {
            name: 'Uses',
            cell: row => (
                <span className="text-white-50">
                    {row.usedCount}{row.maxUses ? ` / ${row.maxUses}` : ' / ∞'}
                </span>
            ),
            width: '100px'
        },
        {
            name: 'Expires',
            cell: row => (
                <span className="text-white-50 small">
                    {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : 'Never'}
                </span>
            ),
            width: '110px'
        },
        {
            name: 'Status',
            cell: row => (
                <span className={`badge ${row.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '100px'
        },
        {
            name: 'Actions',
            cell: row => (
                <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-light" onClick={() => handleEditOpen(row)}><i className="bi bi-pencil" /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash" /></button>
                </div>
            ),
            width: '110px'
        }
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: 'rgba(30,30,30,0.9)', borderBottom: '1px solid rgba(216,166,72,0.3)' } },
        headCells: { style: { color: 'var(--gold-primary)', fontWeight: '600', fontSize: '15px' } },
        rows: {
            style: {
                minHeight: '68px',
                '&:not(:last-of-type)': { borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: 'rgba(255,255,255,0.05)' },
                '&:hover': { backgroundColor: 'rgba(216,166,72,0.05)' },
            }
        },
        pagination: {
            style: { color: 'var(--gold-light)', backgroundColor: 'rgba(20,20,20,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)' },
            pageButtonsStyle: {
                color: 'var(--gold-primary)', fill: 'var(--gold-primary)', backgroundColor: 'transparent',
                '&:disabled': { color: 'rgba(255,255,255,0.2)', fill: 'rgba(255,255,255,0.2)' },
                '&:hover:not(:disabled)': { backgroundColor: 'rgba(216,166,72,0.1)' },
                '&:focus': { outline: 'none', backgroundColor: 'rgba(216,166,72,0.2)' },
            }
        }
    };

    const filteredDiscounts = discounts.filter(d =>
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );



    return (
        <>
            {actionLoading && <Loader overlay={true} text="Processing..." />}
            <style>{`
                .admin-section { padding-top: 140px; padding-bottom: 60px; min-height: 80vh; width: 100%; }
                .table-dark-custom { background: rgba(20,20,20,0.8) !important; color: #fff !important; }
                .form-control.bg-dark, .form-select.bg-dark { color: #fff; }
                .form-control.bg-dark:focus, .form-select.bg-dark:focus { border-color: var(--gold-primary); box-shadow: 0 0 0 0.25rem rgba(216,166,72,0.25); }
                .modal-content.bg-dark { border: 1px solid var(--gold-primary); }
                .rdt_Table { min-width: 800px; }
                @media (max-width: 768px) { .admin-section { padding-top: 25px; padding-bottom: 25px; } }
                @media (max-width: 576px) { h2.text-gold { font-size: 1.6rem; } }
            `}</style>

            <section className="admin-section">
                <div className="container-fluid px-3 px-sm-4 px-lg-5">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 mt-3">
                        <h2 className="text-gold mb-3 mb-sm-0" style={{ fontFamily: 'var(--font-heading)' }}>
                            <i className="bi bi-tag me-2" />Manage Discounts
                        </h2>
                        <div className="d-flex flex-column flex-sm-row gap-3">
                            <div className="input-group" style={{ width: 'auto', minWidth: '250px' }}>
                                <span className="input-group-text bg-dark border-secondary" style={{ color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-search" />
                                </span>
                                <input type="text" className="form-control bg-dark text-white border-secondary shadow-none"
                                    placeholder="Search by code or type..."
                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                            <button className="btn btn-gold text-nowrap" onClick={() => openModal('addDiscountModal')}>
                                <i className="bi bi-plus-circle me-1" /> Add Discount
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <DataTable
                            columns={columns}
                            data={filteredDiscounts}
                            progressPending={loading}
                            progressComponent={<div className="text-center py-5"><Loader fullPage={false} text="Loading discounts..." /></div>}
                            pagination
                            theme="darkGold"
                            customStyles={customStyles}
                            noDataComponent={<div className="text-center py-4 text-white-50">No discounts found. Create one above!</div>}
                        />
                    </div>
                </div>
            </section>

            {/* Add Discount Modal */}
            <div className="modal fade" id="addDiscountModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>
                                <i className="bi bi-tag me-2" />Create Discount
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddSubmit}>
                                <FormFields form={addForm} setForm={setAddForm} />
                                <div className="text-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                                        {actionLoading ? 'Creating...' : 'Create Discount'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Discount Modal */}
            <div className="modal fade" id="editDiscountModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>
                                <i className="bi bi-pencil me-2" />Edit Discount
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditSubmit}>
                                <FormFields form={editForm} setForm={setEditForm} />
                                <div className="text-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-gold" disabled={actionLoading}>
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

export default AdminDiscounts;
