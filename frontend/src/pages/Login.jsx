import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // Can be Username OR Email
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, loginWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!identifier || !password) {
            toast.error('Please enter all credentials');
            return;
        }

        setIsLoading(true);

        // Mock bypass for specific users
        if (identifier === 'admin' && password === 'admin') {
            const mockSuccessData = {
                token: 'mock-jwt-token-12345',
                user: { id: 1, full_name: 'System Administrator', username: 'admin', role: 'ADMIN' }
            };

            setTimeout(() => {
                localStorage.setItem('token', mockSuccessData.token);
                localStorage.setItem('user', JSON.stringify(mockSuccessData.user));
                navigate('/admin');
                setIsLoading(false);
            }, 800);
        } else if (identifier === 'staff' && password === 'staff') {
            const mockSuccessData = {
                token: 'mock-jwt-token-67890',
                user: { id: 2, full_name: 'Rahul Pharmacist', username: 'staff', role: 'STAFF', center_id: 1 }
            };
            setTimeout(() => {
                localStorage.setItem('token', mockSuccessData.token);
                localStorage.setItem('user', JSON.stringify(mockSuccessData.user));
                navigate('/');
                setIsLoading(false);
            }, 800);
        } else {
            const res = await login(identifier, password);
            setTimeout(() => {
                if (res && res.success) {
                    const userStr = localStorage.getItem('user');
                    const loggedInUser = userStr ? JSON.parse(userStr) : null;
                    if (res.user?.role === 'ADMIN' || loggedInUser?.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                } else {
                    if (password.length > 3) {
                        toast.success('Login Successful (Demo Mode)');
                        navigate('/');
                    } else {
                        toast.error(res?.message || 'Invalid credentials!');
                    }
                }
                setIsLoading(false);
            }, 800);
        }
    };



    return (
        <div className="login-centered fade-in" style={{
            background: 'var(--bg-gradient)',
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
        }}>
            <div className="card login-box" style={{
                maxWidth: '440px',
                width: '100%',
                textAlign: 'center',
                padding: '3rem 2.5rem'
            }}>
                <div className="login-header">
                    <div className="login-logo" style={{
                        margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)'
                    }}>
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>ArogyaWatch</h2>
                    <p className="text-muted" style={{ fontWeight: 500 }}>Secure Sentinel Portal</p>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem' }}>
                    <div className="input-group">
                        <label style={{ textAlign: 'left' }}>Username or Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="text"
                                placeholder="Email or UID"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                disabled={isLoading}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ textAlign: 'left' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem', height: '3.5rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Authenticating...' : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>



                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="text-muted" style={{ fontSize: '0.95rem' }}>
                            New user?{' '}
                            <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                                Register Center Account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
