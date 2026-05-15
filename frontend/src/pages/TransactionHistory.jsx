import React, { useState, useEffect } from 'react';
import { getTransactionHistory } from '../services/api';
import { History, ArrowUpRight, ArrowDownRight, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await getTransactionHistory();
            setHistory(data);
        } catch (err) {
            console.error('History Error:', err);
            const msg = err.response?.data?.message || 'Failed to load transaction logs';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Transaction History</h1>
                    <p className="text-muted">Audit log of all stock movements (IN/OUT).</p>
                </div>

                <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Filter size={18} />
                    Filter Logs
                </button>
            </header>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <p className="text-muted">Loading logs...</p>
                </div>
            ) : (
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>DATE & TIME</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>MEDICINE</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>TYPE</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>QUANTITY</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? history.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                                {new Date(log.transaction_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(log.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 600 }}>{log.medicine_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batch: {log.batch_number || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: log.transaction_type === 'IN' ? 'var(--safe)' : 'var(--critical)' }}>
                                                {log.transaction_type === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                {log.transaction_type}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 700 }}>{log.quantity}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{log.remarks || '---'}</p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No transactions recorded yet.
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

export default TransactionHistory;
