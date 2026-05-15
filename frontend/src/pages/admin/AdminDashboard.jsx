import React, { useState, useEffect } from 'react';
import { Activity, Database, TrendingDown, Clock, PackageOpen, Users, BarChart2 } from 'lucide-react';
import { getSystemStats, getSystemActivity, getAllMedicines, getExpiringSoon } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, activityData, medicinesData, expiringData] = await Promise.all([
                getSystemStats(),
                getSystemActivity(),
                getAllMedicines(),
                getExpiringSoon()
            ]);

            // Format Stats for UI
            const dashboardStats = [
                { title: 'Total Medicines', value: statsData.total_medicines, icon: Database, color: 'var(--primary)' },
                { title: 'Low Stock', value: statsData.low_stock, icon: TrendingDown, color: 'var(--warning)' },
                { title: 'Expiring Soon', value: expiringData.length, icon: Clock, color: 'var(--critical)' },
                { title: 'Total Suppliers', value: statsData.total_suppliers, icon: PackageOpen, color: 'var(--safe)' },
                { title: 'Staff Accounts', value: statsData.staff_accounts, icon: Users, color: '#8b5cf6' }
            ];
            setStats(dashboardStats);

            // System activity (formatted from top 5)
            const formattedActivity = activityData.map(act => ({
                time: new Date(act.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                action: act.transaction_type === 'IN' ? 'Stock Added' : 'Stock Issued',
                detail: `${act.medicine_name} (${act.quantity} units) at ${act.center_name} by ${act.performed_by}`
            }));
            setActivity(formattedActivity);

            // Filter medicine data for low stock
            const allMeds = Array.isArray(medicinesData) ? medicinesData : [];
            const lowMeds = allMeds.filter(m => (m.stock_quantity || 0) <= (m.threshold_quantity || 0))
                                  .slice(0, 5)
                                  .map(m => ({
                                      id: m.id,
                                      name: m.name,
                                      category: m.category,
                                      stock: m.stock_quantity || 0,
                                      threshold: m.threshold_quantity || 0,
                                      status: (m.stock_quantity || 0) <= (m.threshold_quantity * 0.2) ? 'Critical' : 'Low'
                                  }));
            setLowStock(lowMeds);

            // Populate expiring list with real data
            const formattedExpiring = expiringData.map((item, idx) => ({
                id: idx,
                name: item.medicine_name,
                batch: item.batch,
                expiry: item.expiry_date,
                days: item.days_remaining,
                status: item.status
            }));
            setExpiring(formattedExpiring);

        } catch (err) {
            console.error('Dash Error:', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    <Activity size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Overview</span>
                </div>
                <h1 style={{ marginBottom: 0 }}>System Administrator Panel</h1>
            </header>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${stat.color}` }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                            <div className="text-muted" style={{ fontWeight: 500, fontSize: '0.9rem', marginTop: '0.25rem' }}>{stat.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Low Stock Table */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Automated Low Stock Warnings</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>MEDICINE NAME</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>CATEGORY</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>STOCK / THRESHOLD</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{item.name}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.category}</td>
                                        <td style={{ padding: '1rem', fontWeight: 700 }}>{item.stock} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {item.threshold}</span></td>
                                        <td style={{ padding: '1rem' }}><span className={`badge badge-${item.status === 'Critical' ? 'critical' : 'warning'}`}>{item.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Expiring Alert Panel */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Expiring Medicines Alert</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>MEDICINE & BATCH</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>EXPIRY DATE</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>DAYS LEFT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expiring.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.batch}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{item.expiry}</td>
                                        <td style={{ padding: '1rem' }}><span className={`badge badge-${item.status === 'Urgent' ? 'critical' : 'warning'}`}>{item.days} days</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Activity Log */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent System Activity</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {activity.map((act, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.2rem' }}>{act.action}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>{act.detail}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{act.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart visual representation */}
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <BarChart2 size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Distribution</h2>
                        </div>
                        <div style={{ height: '150px', background: 'var(--bg-gradient)', borderRadius: '12px', display: 'flex', alignItems: 'end', justifyContent: 'space-around', padding: '1rem' }}>
                            <div style={{ width: '20%', height: '80%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '20%', height: '40%', background: 'var(--accent)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '20%', height: '60%', background: 'var(--warning)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '20%', height: '30%', background: 'var(--critical)', borderRadius: '4px 4px 0 0' }}></div>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '1rem' }}>Medicine categories volume spread</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
