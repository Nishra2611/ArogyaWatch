import React, { useState } from 'react';
import { Settings, Bell, Tag, KeyRound, Database, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBackup } from '../../services/api';

const SystemSettings = () => {
    const [alertThreshold, setAlertThreshold] = useState(100);
    const [categories, setCategories] = useState([
        'Analgesic', 'Antibiotic', 'Antihistamine', 'NSAID', 'Antidiabetic', 'Antihypertensive'
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [lastBackup, setLastBackup] = useState('Never');

    const addCategory = () => {
        if (newCategory.trim()) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const res = await createBackup();
            toast.success(res.message || 'Backup created successfully');
            setLastBackup(new Date().toLocaleString());
        } catch (err) {
            toast.error('Failed to create backup');
        } finally {
            setIsBackingUp(false);
        }
    };

    const levelColor = { INFO: 'var(--safe)', WARN: 'var(--warning)', ERROR: 'var(--critical)' };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    <Settings size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuration</span>
                </div>
                <h1 style={{ marginBottom: 0 }}>System Settings</h1>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Stock Alert Thresholds */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Bell size={20} color="var(--warning)" />
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Stock Alert Threshold</h2>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Set the global default threshold. Individual medicines can override this.
                    </p>
                    <div className="input-group">
                        <label>Default Minimum Stock Units</label>
                        <input type="number" value={alertThreshold} min="1"
                            onChange={e => setAlertThreshold(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Threshold</button>
                </div>

                {/* Manage Medicine Categories */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Tag size={20} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Medicine Categories</h2>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {categories.map((cat, i) => (
                            <span key={i} style={{
                                background: 'rgba(2,132,199,0.1)', color: 'var(--primary)',
                                padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600
                            }}>{cat}</span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input type="text" placeholder="New category name" value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            style={{ flex: 1, borderRadius: '8px', border: '1px solid var(--border-subtle)', padding: '0.6rem 0.9rem' }} />
                        <button className="btn btn-primary" onClick={addCategory}>Add</button>
                    </div>
                </div>

                {/* Admin Password */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <KeyRound size={20} color="var(--accent)" />
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Change Admin Password</h2>
                    </div>
                    <div className="input-group">
                        <label>Current Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>
                    <div className="input-group">
                        <label>New Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>
                    <div className="input-group">
                        <label>Confirm New Password</label>
                        <input type="password" placeholder="••••••••" />
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Update Password</button>
                </div>

                {/* Backup Database */}
                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <Database size={20} color="var(--safe)" />
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Database Backup</h2>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Create a full snapshot of all inventory, transaction and user data.
                    </p>
                    <button 
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className="btn btn-primary" 
                        style={{ background: isBackingUp ? 'var(--text-muted)' : 'var(--safe)', width: '100%' }}
                    >
                        {isBackingUp ? (
                            <><Loader2 size={18} className="spin" /> Creating backup...</>
                        ) : '🛡️ Create Backup Now'}
                    </button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                        Last backup: {lastBackup}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
