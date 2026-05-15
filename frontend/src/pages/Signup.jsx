import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldPlus, User, Mail, Phone, Lock, Briefcase, Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminCount } from '../services/api';

const Signup = () => {
    const { register, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        username: '',
        password: '',
        confirm_password: '',
        role: 'STAFF', // Defaults to Center Staff
        center_name: '', // Maps to center_id in backend if using real DB
        designation: '', // Pharmacist, Store Manager
        employee_id: '',
        joining_date: '',
        organization_name: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        // Block duplicate admin accounts
        if (formData.role === 'ADMIN') {
            try {
                const { count } = await getAdminCount();
                if (count >= 2) {
                    toast.error('The maximum number of administrator accounts (2) has been reached.');
                    return;
                }
            } catch {
                toast.error('Could not verify admin status. Please try again.');
                return;
            }
        }
        setIsLoading(true);
        const res = await register(formData);
        setTimeout(() => {
            if (res && res.success) {
                toast.success('Registration successful! Welcome to the portal.');
                navigate('/');
            } else {
                toast.error(res?.message || 'Registration failed unexpectedly');
            }
            setIsLoading(false);
        }, 1000);
    };



    return (
        <div className="fade-in" style={{
            padding: '4rem 1rem',
            display: 'flex',
            justifyContent: 'center',
            background: 'var(--bg-gradient)',
            minHeight: '100vh'
        }}>
            <div className="card" style={{
                maxWidth: '720px',
                width: '100%',
                padding: '3.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Accent line at top */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="login-logo" style={{
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
                    }}>
                        <ShieldPlus size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>ArogyaWatch</h2>
                    <p className="text-muted" style={{ fontWeight: 500 }}>Initialize Your Sentinel Account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)' }}>
                            <User size={18} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Identity Settings</h3>
                    </div>

                    <div className="input-group">
                        <label>Full Name *</label>
                        <input type="text" name="full_name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> Email Address *</label>
                            <input type="email" name="email" placeholder="name@organization.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> Mobile *</label>
                            <input type="text" name="mobile_number" placeholder="+91-XXXXX" value={formData.mobile_number} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={14} /> Password *</label>
                            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} /> Confirm *</label>
                            <input type="password" name="confirm_password" placeholder="••••••••" value={formData.confirm_password} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '2.5rem 0 1.5rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
                            <Briefcase size={18} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Professional Context</h3>
                    </div>

                    <div className="input-group">
                        <label>Operational Role *</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={{ background: 'white' }}>
                            <option value="STAFF">Healthcare Center Staff (PHC)</option>
                            <option value="ADMIN">System Administrator</option>
                        </select>
                    </div>

                    {/* Conditional Logic (Premium Glass Inset) */}
                    <div className="fade-in" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '2.5rem',
                        transition: 'all 0.3s'
                    }}>
                        {formData.role !== 'ADMIN' ? (
                            <>
                                <div className="input-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={14} /> Assigned Center {formData.role === 'STAFF' ? '*' : '(Optional)'}</label>
                                    <select name="center_name" value={formData.center_name} onChange={handleChange} required={formData.role === 'STAFF'} style={{ background: 'white' }}>
                                        <option value="">-- Select Health Center --</option>
                                        <option value="PHC_Dist_A">District General Hospital A</option>
                                        <option value="PHC_Rural_B">Rural Wellness Center B</option>
                                    </select>
                                </div>

                                {formData.role === 'STAFF' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div className="input-group">
                                                <label>Designation</label>
                                                <select name="designation" value={formData.designation} onChange={handleChange} style={{ background: 'white' }}>
                                                    <option value="">-- Select --</option>
                                                    <option value="Pharmacist">Pharmacist</option>
                                                    <option value="Store Manager">Store Manager</option>
                                                    <option value="Medical Officer">Medical Officer</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Employee ID</label>
                                                <input type="text" name="employee_id" placeholder="AID-0001" value={formData.employee_id} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="input-group mb-0">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={14} /> Joining Date</label>
                                            <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Administrative users have full system overview rights.</p>
                                <div className="input-group" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                                    <label>Organization Name</label>
                                    <input type="text" name="organization_name" value={formData.organization_name} onChange={handleChange} placeholder="e.g. State Food & Drug Dept" />
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '4rem', fontSize: '1.15rem' }} disabled={isLoading}>
                        {isLoading ? 'Finalizing Profile...' : 'Create Sentinel Account'}
                    </button>



                    <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Already a sentinel?{' '}
                            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>
                                Authenticate Portal
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
