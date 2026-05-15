import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Package, Activity, LogOut, ShieldAlert, User } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <ShieldAlert className="text-primary" size={28} />
                <span>ArogyaWatch</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                    end
                >
                    <Home size={20} />
                    Dashboard
                </NavLink>

                {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                    <>
                        <NavLink
                            to="/inventory"
                            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        >
                            <Package size={20} />
                            Center Inventory
                        </NavLink>
                        <NavLink
                            to="/store-inventory"
                            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        >
                            <Package size={20} />
                            Store-Level Inventory
                        </NavLink>
                        <NavLink
                            to="/history"
                            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                        >
                            <Activity size={20} />
                            Transaction History
                        </NavLink>
                    </>
                )}

                <NavLink
                    to="/profile"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <User size={20} />
                    My Profile
                </NavLink>


            </nav>

            <div className="user-profile">
                <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        {user?.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {user?.role}
                    </div>
                </div>
                <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

