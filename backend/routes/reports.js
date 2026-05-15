const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

function toCsv(headers, rows) {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row =>
        headers.map(h => {
            const val = row[h.toUpperCase()] ?? row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
}

// Medicine Stock Report
router.get('/stock', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `
            SELECT c.name as store_name, m.name as medicine_name, m.category,
                   NVL(SUM(b.quantity_remaining),0) as total_stock,
                   m.threshold_quantity as min_threshold,
                   CASE WHEN NVL(SUM(b.quantity_remaining),0) = 0 THEN 'Out of Stock'
                        WHEN NVL(SUM(b.quantity_remaining),0) <= m.threshold_quantity THEN 'Low Stock'
                        ELSE 'OK' END as status
            FROM medicines m
            JOIN batches b ON m.id = b.medicine_id
            JOIN centers c ON b.center_id = c.id
            WHERE m.is_active = 1
            GROUP BY c.name, m.id, m.name, m.category, m.threshold_quantity
            ORDER BY c.name ASC, total_stock ASC
        `;
        const result = await executeQuery(sql);
        const headers = ['store_name', 'medicine_name', 'category', 'total_stock', 'min_threshold', 'status'];
        const csv = toCsv(headers, result.rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="store_stock_report.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Stock Report Error:', err);
        res.status(500).json({ message: 'Error generating store stock report: ' + err.message });
    }
});

// Inventory Movement Report
router.get('/movement', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { from, to } = req.query;
        let sql = `
            SELECT t.transaction_type, t.quantity,
                   TO_CHAR(t.transaction_date, 'YYYY-MM-DD HH24:MI') as transaction_date,
                   m.name as medicine_name, b.batch_number, t.remarks,
                   u.full_name as performed_by
            FROM stock_transactions t
            JOIN medicines m ON t.medicine_id = m.id
            JOIN batches b ON t.batch_id = b.id
            JOIN users u ON t.created_by = u.id
        `;
        const params = [];
        if (from && to) {
            sql += ` WHERE t.transaction_date BETWEEN TO_DATE(:1,'YYYY-MM-DD') AND TO_DATE(:2,'YYYY-MM-DD') + 1`;
            params.push(from, to);
        }
        sql += ` ORDER BY t.transaction_date DESC`;
        const result = await executeQuery(sql, params);
        const headers = ['transaction_date', 'transaction_type', 'medicine_name', 'batch_number', 'quantity', 'performed_by', 'remarks'];
        const csv = toCsv(headers, result.rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="movement_report.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Movement Report Error:', err);
        res.status(500).json({ message: 'Error generating movement report: ' + err.message });
    }
});

// Supplier Report (mock)
router.get('/suppliers', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const sql = `SELECT id as supplier_id, name, contact_number, email, address, CASE WHEN is_active=1 THEN 'Active' ELSE 'Inactive' END as status FROM suppliers ORDER BY name ASC`;
        const result = await executeQuery(sql);
        const headers = ['supplier_id', 'name', 'contact_number', 'email', 'address', 'status'];
        const csv = toCsv(headers, result.rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="supplier_report.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Supplier Report Error:', err);
        res.status(500).json({ message: 'Error generating supplier report: ' + err.message });
    }
});

module.exports = router;
