import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Filter, Edit, Trash2, X, Save } from 'lucide-react';
import { getAllMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Analgesic', 'Antibiotic', 'Antihistamine', 'NSAID', 'Antidiabetic', 'Antihypertensive', 'Antifungal', 'General', 'Other'];

const MedicineManagement = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | {id, name, ...}
    const [form, setForm] = useState({ name: '', category: 'General', threshold_quantity: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadMedicines(); }, []);

    const loadMedicines = async () => {
        setLoading(true);
        try {
            const data = await getAllMedicines();
            setMedicines(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm({ name: '', category: 'General', threshold_quantity: '' });
        setModal('add');
    };

    const openEdit = (med) => {
        setForm({ name: med.name, category: med.category || 'General', threshold_quantity: med.threshold_quantity || '' });
        setModal(med);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error('Medicine name is required');
        setSaving(true);
        try {
            if (modal === 'add') {
                await createMedicine({ name: form.name, category: form.category, threshold_quantity: Number(form.threshold_quantity) || 0 });
                toast.success('Medicine added!');
            } else {
                await updateMedicine(modal.medicine_id, { name: form.name, category: form.category, threshold_quantity: Number(form.threshold_quantity) || 0, is_active: 1 });
                toast.success('Medicine updated!');
            }
            setModal(null);
            loadMedicines();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save medicine');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Deactivate "${name}"?`)) return;
        try {
            await deleteMedicine(id);
            toast.success('Medicine deactivated');
            loadMedicines();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const filtered = medicines.filter(m =>
        m.name?.toLowerCase().includes(search.toLowerCase()) &&
        (filterCat === '' || m.category === filterCat)
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <Database size={18} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Master Data</span>
                    </div>
                    <h1 style={{ marginBottom: 0 }}>Medicine Management</h1>
                </div>
                <button className="btn btn-primary" id="add-medicine-btn" style={{ display: 'flex', gap: '0.5rem' }} onClick={openAdd}>
                    <Plus size={18} />Add Medicine
                </button>
            </header>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input id="medicine-search" type="text" placeholder="Search medicines..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '2.5rem', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }} />
                    </div>
                    <select id="category-filter" value={filterCat} onChange={e => setFilterCat(e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'white', minWidth: '160px' }}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {loading
                    ? <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
                    : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
                                        {['Medicine Name', 'Category', 'Min Threshold', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>{h.toUpperCase()}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0
                                        ? <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No medicines found.</td></tr>
                                        : filtered.map(med => (
                                            <tr key={med.medicine_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                    {med.name}
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: MED-{String(med.medicine_id).padStart(4, '0')}</div>
                                                </td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{med.category || '—'}</td>
                                                <td style={{ padding: '1rem', fontWeight: 700 }}>{med.threshold_quantity || 0}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="badge badge-safe">Active</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => openEdit(med)} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(med.medicine_id, med.name)} className="btn btn-outline" style={{ padding: '0.5rem', minWidth: 'auto', color: 'var(--critical)', borderColor: 'var(--critical)' }}><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>

            {/* Add/Edit Modal */}
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
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{modal === 'add' ? 'Add New Medicine' : 'Edit Medicine'}</h2>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
                        </div>
                        <div className="input-group">
                            <label>Medicine Name *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol 500mg" />
                        </div>
                        <div className="input-group">
                            <label>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Minimum Stock Threshold</label>
                            <input type="number" min="0" value={form.threshold_quantity} onChange={e => setForm({ ...form, threshold_quantity: e.target.value })} placeholder="e.g. 500" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setModal(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 2, gap: '0.5rem' }}>
                                <Save size={16} />{saving ? 'Saving...' : (modal === 'add' ? 'Add Medicine' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineManagement;
