import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { downloadReport } from '../../services/api';
import toast from 'react-hot-toast';

const REPORTS = [
    {
        key: 'stock',
        title: 'Medicine Stock Report',
        description: 'Full system-wide stock levels, thresholds, and status for all medicines grouped by store.',
        icon: '💊',
        color: 'var(--primary)'
    },
    {
        key: 'movement',
        title: 'Inventory Movement Report',
        description: 'Complete log of stock-in and stock-out transactions across all centers.',
        icon: '📦',
        color: 'var(--warning)'
    },
    {
        key: 'suppliers',
        title: 'Supplier Report',
        description: 'All registered suppliers with contact details and current status.',
        icon: '🚚',
        color: 'var(--safe)'
    },
];

const Reports = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [downloading, setDownloading] = useState(null);

    const handleDownload = async (key) => {
        if ((key === 'movement') && from && to && from > to) {
            return toast.error('From date must be before To date');
        }
        setDownloading(key);
        try {
            downloadReport(key, from, to);
            toast.success('Report download started!');
        } catch {
            toast.error('Failed to download report');
        } finally {
            setTimeout(() => setDownloading(null), 1500);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    <FileText size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analytics</span>
                </div>
                <h1 style={{ marginBottom: 0 }}>Reports & Exports</h1>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>Download CSV reports for critical medicine stock, expiry, movement, and supplier data.</p>
            </header>

            {/* Date Range Filter */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    Date Range Filter <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>(applies to Movement Report)</span>
                </h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                        <label>From Date</label>
                        <input id="from-date" type="date" value={from} onChange={e => setFrom(e.target.value)} />
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
                        <label>To Date</label>
                        <input id="to-date" type="date" value={to} onChange={e => setTo(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn btn-outline" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
                    </div>
                </div>
            </div>

            {/* Report Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {REPORTS.map(r => (
                    <div key={r.key} className="card" style={{ padding: '2rem', borderTop: `3px solid ${r.color}` }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{r.icon}</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{r.title}</h3>
                        <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{r.description}</p>
                        <button
                            id={`download-${r.key}-btn`}
                            className="btn btn-primary"
                            style={{ width: '100%', gap: '0.5rem', background: r.color, boxShadow: 'none' }}
                            onClick={() => handleDownload(r.key)}
                            disabled={downloading === r.key}
                        >
                            <Download size={16} />
                            {downloading === r.key ? 'Downloading...' : 'Download CSV'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
