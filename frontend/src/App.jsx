import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MedicineList from './pages/MedicineList';
import StoreInventory from './pages/StoreInventory';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicineManagement from './pages/admin/MedicineManagement';
import InventoryControl from './pages/admin/InventoryControl';
import SupplierManagement from './pages/admin/SupplierManagement';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import SystemSettings from './pages/admin/SystemSettings';

// Protected Route Wrapper (staff/viewer only — admins get redirected to admin panel)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  return children;
};

// Admin-only Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Staff / Viewer Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<MedicineList />} />
          <Route path="store-inventory" element={<StoreInventory />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<div>Analytics View (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
        </Route>

        {/* Admin-Only Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="medicines" element={<MedicineManagement />} />
          <Route path="inventory" element={<InventoryControl />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
