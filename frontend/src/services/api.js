import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5001';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ---------- Auth ----------
export const loginUser    = async (creds) => (await api.post('/api/auth/login', creds)).data;
export const registerUser = async (data)  => (await api.post('/api/auth/register', data)).data;
export const googleAuth   = async (data)  => (await api.post('/api/auth/google', data)).data;

// ---------- Stock ----------
export const getCenterStock        = async ()     => (await api.get('/api/stock/center')).data;
export const getAllMedicines        = async ()     => (await api.get('/api/medicines')).data;
export const getMedicineBatches    = async (id)   => (await api.get(`/api/stock/batches/${id}`)).data;
export const addStockIn            = async (data) => (await api.post('/api/stock/in', data)).data;
export const addStockOut           = async (data) => (await api.post('/api/stock/out', data)).data;
export const getTransactionHistory = async ()     => (await api.get('/api/stock/history')).data;

// ---------- Alerts ----------
export const getCenterAlerts = async ()   => (await api.get('/api/alerts/center')).data;
export const resolveAlert    = async (id) => (await api.post(`/api/alerts/resolve/${id}`)).data;

// ---------- Admin: Medicines ----------
export const createMedicine = async (data)    => (await api.post('/api/medicines', data)).data;
export const updateMedicine = async (id, data) => (await api.put(`/api/medicines/${id}`, data)).data;
export const deleteMedicine = async (id)      => (await api.delete(`/api/medicines/${id}`)).data;

// ---------- Admin: Suppliers ----------
export const getSuppliers   = async ()         => (await api.get('/api/suppliers')).data;
export const createSupplier = async (data)     => (await api.post('/api/suppliers', data)).data;
export const updateSupplier = async (id, data) => (await api.put(`/api/suppliers/${id}`, data)).data;
export const deleteSupplier = async (id)       => (await api.delete(`/api/suppliers/${id}`)).data;

// ---------- Admin: Users & Analytics ----------
export const getAllUsers        = async ()   => (await api.get('/api/admin/users')).data;
export const deactivateUser     = async (id) => (await api.put(`/api/admin/users/${id}/deactivate`)).data;
export const activateUser       = async (id) => (await api.put(`/api/admin/users/${id}/activate`)).data;
export const getAdminCount      = async ()   => (await api.get('/api/admin/admin-count')).data;
export const getSystemStats     = async ()   => (await api.get('/api/stock/stats')).data;
export const getGlobalStock     = async ()   => (await api.get('/api/stock/global')).data;
export const getSystemActivity  = async ()   => (await api.get('/api/admin/system-activity')).data;
export const getExpiringSoon = async ()   => (await api.get('/api/admin/expiring-soon')).data;
export const createBackup       = async ()   => (await api.post('/api/admin/backup')).data;

// ---------- Reports (CSV download) ----------
export const downloadReport = (type, from, to) => {
    const token = localStorage.getItem('token');
    const params = from && to ? `?from=${from}&to=${to}` : '';
    const url = `${API_BASE_URL}/api/reports/${type}${params}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${type}_report.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        })
        .catch(() => alert('Failed to download report'));
};

export default api;
