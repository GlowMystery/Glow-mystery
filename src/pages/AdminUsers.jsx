import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, updateUserRole, deleteUser } from '../features/adminSlice';
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

const AdminUsers = () => {
    const dispatch = useDispatch();
    const { users, loadingUsers: loading } = useSelector((state) => state.admin);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [editForm, setEditForm] = useState({ id: '', name: '', email: '', role: 'USER' });

    const loadUsers = () => {
        dispatch(fetchUsers());
    };

    useEffect(() => {
        loadUsers();
    }, [dispatch]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await dispatch(addUser(addForm)).unwrap();
            setAddForm({ name: '', email: '', password: '', role: 'USER' });
            if (window.bootstrap) {
                window.bootstrap.Modal.getInstance(document.getElementById('addUserModal'))?.hide();
            }
            toast.success('User added successfully!');
            loadUsers();
        } catch (err) {
            toast.error(err || 'Failed to add user');
        }
        setActionLoading(false);
    };

    const handleEditOpen = (user) => {
        setEditForm({ id: user.id, name: user.name, email: user.email, role: user.role });
        if (window.bootstrap) {
            new window.bootstrap.Modal(document.getElementById('editUserModal')).show();
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await dispatch(updateUserRole({ id: editForm.id, userData: { name: editForm.name, email: editForm.email, role: editForm.role } })).unwrap();
            if (window.bootstrap) {
                window.bootstrap.Modal.getInstance(document.getElementById('editUserModal'))?.hide();
            }
            toast.success('User updated successfully!');
            loadUsers();
        } catch (err) {
            toast.error(err || 'Error updating user');
        }
        setActionLoading(false);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete User?',
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
                await dispatch(deleteUser(id)).unwrap();
                toast.success('User deleted successfully!');
                loadUsers();
            } catch (err) {
                toast.error(err || 'Error deleting user');
            }
            setActionLoading(false);
        }
    };

    const columns = [
        // {
        //     name: 'ID',
        //     selector: row => `#${row.id}`,
        //     sortable: true,
        //     width: '100px'
        // },
        {
            name: 'Name',
            selector: row => row.name,
            cell: row => <span className="fw-bold">{row.name}</span>,
            sortable: true,
            width: '200px'
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            width: '250px'
        },
        {
            name: 'Phone',
            selector: row => row.phone,
            sortable: true,
            width: '250px'
        },
        {
            name: 'Role',
            selector: row => row.role,
            cell: row => (
                row.role === 'ADMIN' ? (
                    <span className="badge bg-warning text-dark">ADMIN</span>
                ) : (
                    <span className="badge bg-secondary">USER</span>
                )
            ),
            sortable: true,
            width: '150px'
        },
        {
            name: 'Joined',
            selector: row => new Date(row.createdAt).toLocaleDateString(),
            sortable: true,
            sortFunction: (rowA, rowB) => new Date(rowA.createdAt) - new Date(rowB.createdAt),
            width: '150px'
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
                        <h2 className="text-gold mb-3 mb-sm-0" style={{ fontFamily: 'var(--font-heading)' }}>Manage Users</h2>
                        <div className="d-flex flex-column flex-sm-row gap-3">
                            <div className="input-group" style={{ width: 'auto', minWidth: '250px' }}>
                                <span className="input-group-text bg-dark border-secondary" style={{ color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-dark text-white border-secondary shadow-none"
                                    placeholder="Search users by name, email or role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-gold text-nowrap" data-bs-toggle="modal" data-bs-target="#addUserModal">
                                <i className="bi bi-person-plus me-1"></i> Add User
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <DataTable
                            columns={columns}
                            data={users.filter(u =>
                                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.role.toLowerCase().includes(searchQuery.toLowerCase())
                            )}
                            progressPending={loading}
                            progressComponent={<div className="text-center py-5"><Loader fullPage={false} text="Loading users..." /></div>}
                            pagination
                            theme="darkGold"
                            customStyles={customStyles}
                            noDataComponent={<div className="text-center py-4">No users found.</div>}
                        />
                    </div>
                </div>
            </section>

            {/* Add User Modal */}
            <div className="modal fade" id="addUserModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Add New User</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Full Name</label>
                                    <input type="text" className="form-control bg-dark" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Email</label>
                                    <input type="email" className="form-control bg-dark" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Password</label>
                                    <input type="password" className="form-control bg-dark" required minLength="6" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Role</label>
                                    <select className="form-select bg-dark" value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="text-end mt-4">
                                    <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-gold ms-2" disabled={actionLoading}>
                                        {actionLoading ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            <div className="modal fade" id="editUserModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content bg-dark text-white">
                        <div className="modal-header border-secondary">
                            <h5 className="modal-title text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Edit User</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditSubmit}>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Full Name</label>
                                    <input type="text" className="form-control bg-dark" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Email</label>
                                    <input type="email" className="form-control bg-dark" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-white-50 text-sm">Role</label>
                                    <select className="form-select bg-dark" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                        <option value="USER">USER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
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

export default AdminUsers;
