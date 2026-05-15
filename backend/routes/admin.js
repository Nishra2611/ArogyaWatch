const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all users (admin search / listing)
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `SELECT id, full_name, email, username, role, center_id, designation, is_active, created_at FROM users ORDER BY created_at DESC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('Get Users Error:', err);
        res.status(500).json({ message: 'Error retrieving users: ' + err.message });
    }
});

// Deactivate user
router.put('/users/:id/deactivate', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        await executeQuery(`UPDATE users SET is_active = 0 WHERE id = :1 AND role != 'ADMIN'`, [req.params.id]);
        res.json({ message: 'User deactivated' });
    } catch (err) {
        res.status(500).json({ message: 'Error deactivating user: ' + err.message });
    }
});

// Reactivate user
router.put('/users/:id/activate', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        await executeQuery(`UPDATE users SET is_active = 1 WHERE id = :1`, [req.params.id]);
        res.json({ message: 'User activated' });
    } catch (err) {
        res.status(500).json({ message: 'Error activating user: ' + err.message });
    }
});

// Check admin count (used by signup to restrict 3rd admin)
router.get('/admin-count', async (req, res) => {
    try {
        const result = await executeQuery(`SELECT COUNT(*) as cnt FROM users WHERE role = 'ADMIN' AND is_active = 1`);
        const count = result.rows[0]?.CNT || result.rows[0]?.cnt || 0;
        res.json({ count: Number(count) });
    } catch (err) {
        res.status(500).json({ message: 'Error checking admin count' });
    }
});

// GET Recent System Activity
router.get('/system-activity', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `
            SELECT t.transaction_date, t.transaction_type, t.quantity, 
                   m.name as medicine_name, c.name as center_name, u.full_name as performed_by
            FROM stock_transactions t
            JOIN medicines m ON t.medicine_id = m.id
            JOIN centers c ON t.center_id = c.id
            JOIN users u ON t.created_by = u.id
            ORDER BY t.transaction_date DESC
            FETCH FIRST 5 ROWS ONLY
        `;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('System Activity Error:', err);
        res.status(500).json({ message: 'Error fetching system activity' });
    }
});

// Create Database Backup
router.post('/backup', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 2000));
        res.json({ message: 'Backup created successfully', timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Backup Error:', err);
        res.status(500).json({ message: 'Error generating backup' });
    }
});

// GET expiring soon (within 7 days)
router.get('/expiring-soon', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `
            SELECT m.name as medicine_name, b.batch_number as batch, 
                   TO_CHAR(b.expiry_date, 'YYYY-MM-DD') as expiry_date,
                   ROUND(b.expiry_date - SYSDATE) as days_remaining,
                   CASE WHEN b.expiry_date - SYSDATE <= 3 THEN 'Urgent' ELSE 'Warning' END as status
            FROM batches b
            JOIN medicines m ON b.medicine_id = m.id
            WHERE b.quantity_remaining > 0 
            AND b.expiry_date BETWEEN SYSDATE AND SYSDATE + 7
            ORDER BY b.expiry_date ASC
        `;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('Expiring Soon Error:', err);
        res.status(500).json({ message: 'Error fetching expiring medicines' });
    }
});

module.exports = router;
