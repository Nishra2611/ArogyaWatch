import React, { useState, useEffect } from 'react';
import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { getGlobalStock } from '../../services/api';
import toast from 'react-hot-toast';

const InventoryControl = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await getGlobalStock();
            setInventory(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load global inventory');
        } finally {
            setLoading(false);
        }
    };

    const statusColor = { Good: 'var(--safe)', Low: 'var(--warning)', Critical: 'var(--critical)' };
    const badgeClass = { Good: 'badge-safe', Low: 'badge-warning', Critical: 'badge-critical' };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <Package size={18} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Data</span>
                    </div>
                    <h1 style={{ marginBottom: 0 }}>Inventory Control</h1>
                </div>
            </header>

            {/* Quick Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Total Items Tracked', value: inventory.length, color: 'var(--primary)' },
                    { label: 'Low Stock Items', value: inventory.filter(i => i.status === 'Low').length, color: 'var(--warning)' },
                    { label: 'Critical Items', value: inventory.filter(i => i.status === 'Critical').length, color: 'var(--critical)' },
                ].map((s, idx) => (
                    <div key={idx} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.9rem', marginTop: '0.25rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>System-Wide Stock Monitor</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', borderBottom: '2px solid var(--border-subtle)' }}>
                                {['Medicine Name', 'Center', 'Batch', 'Qty / Threshold', 'Expiry', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>{h.toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}>
                                    <td style={{ padding: '1.1rem 1rem', fontWeight: 600 }}>
                                        {item.status === 'Critical' && <AlertTriangle size={14} style={{ color: 'var(--critical)', marginRight: '0.4rem', verticalAlign: 'middle' }} />}
                                        {item.name}
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.center}</td>
                                    <td style={{ padding: '1.1rem 1rem', fontSize: '0.9rem' }}>{item.batch}</td>
                                    <td style={{ padding: '1.1rem 1rem', fontWeight: 700 }}>
                                        <span style={{ color: statusColor[item.status] }}>{item.qty}</span>
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {item.threshold}</span>
                                    </td>
                                    <td style={{ padding: '1.1rem 1rem', fontSize: '0.9rem' }}>{item.expiry}</td>
                                    <td style={{ padding: '1.1rem 1rem' }}>
                                        <span className={`badge ${badgeClass[item.status]}`}>{item.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryControl;
