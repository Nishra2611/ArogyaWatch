import React, { useState, useEffect } from 'react';
import { getCenterStock } from '../services/api';
import { Search, Package, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const StoreInventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'LOW'

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const data = await getCenterStock();
            setMedicines(data);
        } catch (err) {
            console.error('Inventory Error:', err);
            const msg = err.response?.data?.message || 'Failed to load inventory';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredMeds = medicines.filter(m => {
        const matchesSearch = (m.medicine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (m.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const qty = m.total_quantity || 0;
        const threshold = m.threshold_quantity || 0;
        const isCritical = qty <= threshold * 0.2 || qty <= 0;
        const isLow = qty <= threshold && !isCritical;

        if (statusFilter === 'CRITICAL') return matchesSearch && isCritical;
        if (statusFilter === 'LOW') return matchesSearch && (isLow || isCritical);
        return matchesSearch;
    });

    const getStatus = (qty, threshold) => {
        if (qty <= 0) return { label: 'Critical Lack', class: 'badge-critical' };
        if (qty <= (threshold || 0) * 0.2) return { label: 'Critical Stock', class: 'badge-critical' };
        if (qty <= (threshold || 0)) return { label: 'Low Stock', class: 'badge-warning' };
        return { label: 'Safe', class: 'badge-safe' };
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Store-Level Inventory</h1>
                    <p className="text-muted">Real-time working inventory specific to your center.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search active stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-subtle)',
                                width: '250px'
                            }}
                        />
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setStatusFilter('ALL')} 
                    className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                >
                    All Stock
                </button>
                <button 
                    onClick={() => setStatusFilter('LOW')} 
                    className={`btn ${statusFilter === 'LOW' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', color: statusFilter === 'LOW' ? undefined : 'var(--warning)', borderColor: statusFilter === 'LOW' ? undefined : 'var(--warning)' }}
                >
                    Low Stock
                </button>
                <button 
                    onClick={() => setStatusFilter('CRITICAL')} 
                    className={`btn ${statusFilter === 'CRITICAL' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', color: statusFilter === 'CRITICAL' ? undefined : 'var(--critical)', borderColor: statusFilter === 'CRITICAL' ? undefined : 'var(--critical)' }}
                >
                    Critical Lack
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <p className="text-muted">Loading operational inventory...</p>
                </div>
            ) : (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>MEDICINE NAME</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>CATEGORY</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>CURRENT STOCK</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>THRESHOLD</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeds.length > 0 ? filteredMeds.map(med => {
                                    const status = getStatus(med.total_quantity, med.threshold_quantity);
                                    return (
                                        <tr key={med.medicine_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: 600 }}>{med.medicine_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.active_batches} active batches</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{med.category}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{med.total_quantity}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontSize: '0.9rem' }}>{med.threshold_quantity}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span className={`badge ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No active stock found matching your criteria in this store.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreInventory;
