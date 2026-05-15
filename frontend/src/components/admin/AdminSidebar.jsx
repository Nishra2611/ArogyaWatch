import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Activity, ShieldAlert, Users, Database, FileText, Settings, Truck, LogOut } from 'lucide-react';

const AdminSidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <ShieldAlert className="text-primary" size={28} />
                <span>System Administrator</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Activity size={20} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/medicines"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Database size={20} />
                    Medicine Management
                </NavLink>

                <NavLink
                    to="/admin/inventory"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Activity size={20} />
                    Inventory Control
                </NavLink>

                <NavLink
                    to="/admin/suppliers"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Truck size={20} />
                    Supplier Management
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Users size={20} />
                    User Management
                </NavLink>

                <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <FileText size={20} />
                    Reports
                </NavLink>

                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                    <Settings size={20} />
                    System Settings
                </NavLink>
            </nav>

            <div className="user-profile">
                <div className="user-avatar" style={{ background: 'var(--primary)', color: 'white' }}>
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>
                        {user?.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        System Administrator
                    </div>
                </div>
                <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
