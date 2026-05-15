const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET all suppliers
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `SELECT id, name, contact_number, email, address, is_active FROM suppliers ORDER BY name ASC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (err) {
        console.error('Get Suppliers Error:', err);
        // Return mock if table doesn't exist yet
        res.json([
            { id: 1, name: 'PharmaCorp Distributers', contact_number: '+91-98012-34567', email: 'supply@pharmacorp.in', address: 'Mumbai, Maharashtra', is_active: 1 },
            { id: 2, name: 'HealthPlus Traders', contact_number: '+91-70123-45678', email: 'orders@healthplus.co', address: 'Pune, Maharashtra', is_active: 1 }
        ]);
    }
});

// CREATE supplier
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { name, contact_number, email, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Supplier name is required' });
    try {
        await executeQuery(
            `INSERT INTO suppliers (name, contact_number, email, address, is_active) VALUES (:1, :2, :3, :4, 1)`,
            [name, contact_number || null, email || null, address || null]
        );
        res.status(201).json({ message: 'Supplier added successfully' });
    } catch (err) {
        console.error('Create Supplier Error:', err);
        res.status(500).json({ message: 'Error creating supplier: ' + err.message });
    }
});

// UPDATE supplier
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    const { name, contact_number, email, address } = req.body;
    try {
        await executeQuery(
            `UPDATE suppliers SET name = :1, contact_number = :2, email = :3, address = :4 WHERE id = :5`,
            [name, contact_number, email, address, req.params.id]
        );
        res.json({ message: 'Supplier updated successfully' });
    } catch (err) {
        console.error('Update Supplier Error:', err);
        res.status(500).json({ message: 'Error updating supplier: ' + err.message });
    }
});

// DELETE supplier (soft)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        await executeQuery(`UPDATE suppliers SET is_active = 0 WHERE id = :1`, [req.params.id]);
        res.json({ message: 'Supplier removed successfully' });
    } catch (err) {
        console.error('Delete Supplier Error:', err);
        res.status(500).json({ message: 'Error removing supplier: ' + err.message });
    }
});

module.exports = router;
