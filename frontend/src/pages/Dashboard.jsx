import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, TriangleAlert, TrendingDown, PackageOpen, LayoutDashboard, Plus, Minus, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { getCenterStock, getCenterAlerts, resolveAlert, getTransactionHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddStockModal from '../components/AddStockModal';
import IssueStockModal from '../components/IssueStockModal';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stock, setStock] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [s, a, h] = await Promise.all([
                getCenterStock().catch(() => []),
                getCenterAlerts().catch(() => []),
                getTransactionHistory().catch(() => [])
            ]);
            setStock(Array.isArray(s) ? s : []);
            setAlerts(Array.isArray(a) ? a : []);
            setHistory(Array.isArray(h) ? h : []);
        } catch (err) {
            console.error('Dashboard load failed', err);
        } finally {
            setLoading(false);
        }
    };

    const criticalMeds = stock.filter(m => (m.total_quantity || 0) <= 0);
    const lowStockMeds = stock.filter(m => (m.total_quantity || 0) > 0 && (m.total_quantity || 0) <= (m.threshold_quantity || 0));

    // Sort to get top 5 low stock / critical items
    const snapshotMeds = [...criticalMeds, ...lowStockMeds].slice(0, 5);
    const recentActivity = history.slice(0, 5);

    const stats = [
        { key: 'ALL',      label: 'Medicines in Store',   value: stock.length,        icon: ShieldCheck,   color: 'var(--safe)' },
        { key: 'CRITICAL', label: 'Critical Lack',        value: criticalMeds.length, icon: TriangleAlert, color: 'var(--critical)' },
        { key: 'LOW',      label: 'Low Stock Alerts',     value: lowStockMeds.length, icon: TrendingDown,  color: 'var(--warning)' },
        { key: 'WARNING',  label: 'Active System Alerts', value: alerts.length,       icon: PackageOpen,   color: 'var(--primary)' },
    ];

    const handleStatClick = (filterKey) => {
        if (filterKey === 'WARNING') {
            // we could scroll to alerts or do something else
            return;
        }
        navigate('/store-inventory', { state: { statusFilter: filterKey } });
    };

    const getStatusBadge = (qty, threshold) => {
        if (qty <= 0) return <span className="badge badge-critical">Critical</span>;
        if (qty <= (threshold || 0)) return <span className="badge badge-warning">Low</span>;
        return <span className="badge badge-safe">OK</span>;
    };

    if (loading) return (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p className="text-muted fade-in" style={{ fontWeight: 500, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Clock className="spin" size={18} /> Syncing Portal Data...
            </p>
        </div>
    );

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        <LayoutDashboard size={18} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Overview</span>
                    </div>
                    <h1 style={{ marginBottom: 0 }}>Portal Dashboard, {user?.full_name || user?.username}</h1>
                </div>
            </header>

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutDashboard size={18} /> Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="card quick-action-card" 
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: 'none', background: 'var(--card-glass)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Add Stock</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Record new arrivals</div>
                    </div>
                </button>
                <button 
                    onClick={() => setIsIssueModalOpen(true)}
                    className="card quick-action-card" 
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: 'none', background: 'var(--card-glass)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Issue Stock</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribute to patients</div>
                    </div>
                </button>
                <button 
                    onClick={() => navigate('/store-inventory')}
                    className="card quick-action-card" 
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: 'none', background: 'var(--card-glass)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PackageOpen size={20} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>View Inventory</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full active stock list</div>
                    </div>
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="card stat-card"
                        onClick={() => handleStatClick(stat.key)}
                        title={stat.key !== 'WARNING' ? 'Click to filter inventory' : 'Active system alerts'}
                        style={{
                            padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                            borderLeft: `4px solid ${stat.color}`,
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: stat.key && stat.value > 0 ? stat.color : 'inherit' }}>{stat.value}</div>
                            <div className="text-muted" style={{ fontWeight: 500, marginTop: '0.25rem' }}>{stat.label}</div>
                        </div>
                        <ArrowRight size={16} style={{ position: 'absolute', bottom: '1.75rem', right: '1.75rem', color: 'var(--text-muted)', opacity: 0.3 }} />
                    </div>
                ))}
            </div>

            {/* Complex Views */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Store Inventory Snapshot */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PackageOpen size={18} color="var(--primary)" /> Store Inventory Snapshot
                    </h2>
                    {snapshotMeds.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {snapshotMeds.map(med => (
                                <div key={med.medicine_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{med.medicine_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current: {med.total_quantity || 0} / Min: {med.threshold_quantity}</div>
                                    </div>
                                    {getStatusBadge(med.total_quantity || 0, med.threshold_quantity)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <ShieldCheck size={32} color="var(--safe)" style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>All medicine stocks are at safe levels.</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity Feed */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} color="var(--accent)" /> Recent Activity
                    </h2>
                    {recentActivity.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentActivity.map(txn => (
                                <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: txn.transaction_type === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: txn.transaction_type === 'IN' ? 'var(--safe)' : 'var(--critical)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {txn.transaction_type === 'IN' ? <Plus size={16} /> : <Minus size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {txn.transaction_type === 'IN' ? 'Added' : 'Issued'} {txn.quantity} units
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.medicine_name} • {new Date(txn.transaction_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent activity to show.</p>
                        </div>
                    )}
                </div>

            </div>

            {alerts.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                        <AlertCircle size={18} /> Administrative Alerts
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {alerts.map(alert => (
                            <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <TriangleAlert size={14} color="var(--warning)" />
                                {alert.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AddStockModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={loadData} />
            <IssueStockModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} onRefresh={loadData} />
        </div>
    );
};

export default Dashboard;
