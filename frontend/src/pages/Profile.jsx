import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Shield, Smartphone, Key, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        mobile_number: user?.mobile_number || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        // Mock update
        toast.success('Security settings updated successfully');
        setIsEditing(false);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Account Settings</h1>
                <p className="text-muted">Manage your personal profile and security preferences.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                <div className="card" style={{ height: 'fit-content', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1.5rem' }}>
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{user?.full_name || user?.username}</h2>
                    <span className="badge badge-safe" style={{ marginBottom: '1.5rem' }}>{user?.role} Account</span>

                    <div style={{ textAlign: 'left', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Center Assignment</label>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <Shield size={16} className="text-primary" />
                                {user?.center_id ? 'Active PHC Center' : 'System Wide'}
                            </div>
                        </div>
                        <div>
                            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>User Identifier</label>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <User size={16} className="text-primary" />
                                {user?.username}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <form onSubmit={handleUpdate}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Smartphone size={20} className="text-primary" />
                            Contact Information
                        </h3>
                        <div className="input-group">
                            <label>Mobile Number</label>
                            <input
                                type="text"
                                value={profileData.mobile_number}
                                onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>

                        <h3 style={{ fontSize: '1.1rem', margin: '2.5rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Key size={20} className="text-primary" />
                            Security & Password
                        </h3>
                        <div className="input-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder="Leave blank to keep current"
                                value={profileData.new_password}
                                onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter new password"
                                value={profileData.confirm_password}
                                onChange={(e) => setProfileData({ ...profileData, confirm_password: e.target.value })}
                            />
                        </div>

                        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.75rem' }}>
                                <Save size={18} />
                                Save Profile Changes
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                        <CheckCircle size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>Role and Center assignments are managed by System Administrators only. Contact support if changes are needed.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
