import React, { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Phone, Mail, MapPin, X, Save } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/api';
import toast from 'react-hot-toast';

const empty = { name: '', contact_number: '', email: '', address: '' };

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | supplier obj
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getSuppliers();
            setSuppliers(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const openAdd  = () => { setForm(empty); setModal('add'); };
    const openEdit = (s) => { setForm({ name: s.name, contact_number: s.contact_number || '', email: s.email || '', address: s.address || '' }); setModal(s); };

    const save = async () => {
        if (!form.name.trim()) return toast.error('Supplier name required');
        setSaving(true);
        try {
            if (modal === 'add') {
                await createSupplier(form);
                toast.success('Supplier added');
            } else {
                await updateSupplier(modal.id, form);
                toast.success('Supplier updated');
            }
            setModal(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save supplier');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (s) => {
        if (!window.confirm(`Remove supplier "${s.name}"?`)) return;
        try {
            await deleteSupplier(s.id);
            toast.success('Supplier removed');
            load();
        } catch {
            toast.error('Failed to remove supplier');
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <Truck size={18} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procurement</span>
                    </div>
                    <h1 style={{ marginBottom: 0 }}>Supplier Management</h1>
                </div>
                <button id="add-supplier-btn" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }} onClick={openAdd}>
                    <Plus size={18} />Add Supplier
                </button>
            </header>

            {loading
                ? <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading suppliers...</p>
                : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {suppliers.length === 0
                            ? <p className="text-muted">No suppliers found. Add one to get started.</p>
                            : suppliers.filter(s => s.is_active !== 0).map(sup => (
                                <div key={sup.id} className="card" style={{ padding: '2rem', borderTop: '3px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SUP-{String(sup.id).padStart(3, '0')}</div>
                                            <h3 style={{ fontWeight: 700, margin: 0 }}>{sup.name}</h3>
                                        </div>
                                        <span className="badge badge-safe">Active</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                        {sup.contact_number && <div style={{ display: 'flex', gap: '0.5rem' }}><Phone size={14} />{sup.contact_number}</div>}
                                        {sup.email && <div style={{ display: 'flex', gap: '0.5rem' }}><Mail size={14} />{sup.email}</div>}
                                        {sup.address && <div style={{ display: 'flex', gap: '0.5rem' }}><MapPin size={14} />{sup.address}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button className="btn btn-outline" style={{ flex: 1, gap: '0.4rem', fontSize: '0.85rem' }} onClick={() => openEdit(sup)}><Edit size={14} />Edit</button>
                                        <button className="btn btn-outline" style={{ flex: 1, gap: '0.4rem', fontSize: '0.85rem', color: 'var(--critical)', borderColor: 'var(--critical)' }} onClick={() => remove(sup)}><Trash2 size={14} />Remove</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
            }

            {/* Modal */}
            {modal !== null && (
                <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem', overflowY: 'auto' }}>
                    <div onClick={e => e.stopPropagation()} className="fade-in" style={{
                        width: '100%', maxWidth: '480px', padding: '2.5rem',
                        margin: 'auto', transform: 'none',
                        background: 'white', borderRadius: '20px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{modal === 'add' ? 'Add New Supplier' : 'Edit Supplier'}</h2>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
                        </div>
                        {['name', 'contact_number', 'email', 'address'].map(field => (
                            <div className="input-group" key={field}>
                                <label style={{ textTransform: 'capitalize' }}>{field.replace('_', ' ')}{field === 'name' ? ' *' : ''}</label>
                                <input type={field === 'email' ? 'email' : 'text'} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={field.replace('_', ' ')} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={save} disabled={saving} className="btn btn-primary" style={{ flex: 2, gap: '0.5rem' }}>
                                <Save size={16} />{saving ? 'Saving...' : (modal === 'add' ? 'Add Supplier' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
