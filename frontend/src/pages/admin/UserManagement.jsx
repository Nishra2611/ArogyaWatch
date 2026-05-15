import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, ShieldOff } from 'lucide-react';
import { getAllUsers, deactivateUser, activateUser } from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load users: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const toggle = async (u) => {
        if (u.role === 'ADMIN') return toast.error('Cannot deactivate admin accounts');
        const action = u.is_active ? 'Deactivate' : 'Activate';
        if (!window.confirm(`${action} "${u.full_name}"?`)) return;
        try {
            if (u.is_active) {
                await deactivateUser(u.id);
                toast.success('User deactivated');
            } else {
                await activateUser(u.id);
                toast.success('User activated');
            }
            load();
        } catch (err) {
            toast.error('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const filtered = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.designation?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    <Users size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Control</span>
                </div>
                <h1 style={{ marginBottom: 0 }}>User Management</h1>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>Search and manage all registered staff accounts. New users must self-register.</p>
            </header>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '2rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input id="user-search" type="text" placeholder="Search by name, username, email..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }} />
                </div>

                {loading
                    ? <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</p>
                    : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
                                        {['Full Name', 'Username / Email', 'Role', 'Designation', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>{h.toUpperCase()}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0
                                        ? <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                                        : filtered.map(u => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: u.is_active ? 1 : 0.6 }}>
                                                <td style={{ padding: '1rem', fontWeight: 700 }}>
                                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                                                            {u.full_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        {u.full_name}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                                                    <div style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`badge badge-${u.role === 'ADMIN' ? 'critical' : 'safe'}`}>{u.role}</span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.designation || '—'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`badge badge-${u.is_active ? 'safe' : 'warning'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {u.role !== 'ADMIN' && (
                                                        <button onClick={() => toggle(u)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', gap: '0.4rem', color: u.is_active ? 'var(--critical)' : 'var(--safe)', borderColor: u.is_active ? 'var(--critical)' : 'var(--safe)' }}>
                                                            {u.is_active ? <><UserX size={14} />Deactivate</> : <><UserCheck size={14} />Activate</>}
                                                        </button>
                                                    )}
                                                    {u.role === 'ADMIN' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><ShieldOff size={14} />Protected</span>}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default UserManagement;
