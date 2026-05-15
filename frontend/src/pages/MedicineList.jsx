import React, { useState, useEffect } from 'react';
import { getAllMedicines } from '../services/api';
import { Search, Package, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicineList = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'LOW'

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const data = await getAllMedicines();
            setMedicines(data);
        } catch (err) {
            console.error('Inventory Error:', err);
            const msg = err.response?.data?.message || 'Failed to load master inventory';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredMeds = medicines.filter(m => {
        const matchesSearch = (m.name || m.medicine_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    <h1 style={{ marginBottom: '0.25rem' }}>Center Inventory (Master)</h1>
                    <p className="text-muted">Master list of all available medicines across the system.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search medicines..."
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



            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <p className="text-muted">Loading inventory data...</p>
                </div>
            ) : (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>MEDICINE NAME</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>CATEGORY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeds.length > 0 ? filteredMeds.map(med => {
                                    const qty = med.total_quantity || 0;
                                    const status = getStatus(qty, med.threshold_quantity);
                                    return (
                                        <tr key={med.medicine_id || med.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: 600 }}>{med.name || med.medicine_name}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{med.category}</span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No medicines found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <Info size={20} className="text-primary" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    As Staff, you can view inventory levels, but only Administrators can add new medicines or modify minimum thresholds.
                </p>
            </div>
        </div>
    );
};

export default MedicineList;
