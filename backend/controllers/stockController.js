const { executeQuery } = require('../config/db');

// Get all medicine stock for a specific center (Master + Operational Data Join)
exports.getCenterStock = async (req, res) => {
    const centerId = req.user.center_id;
    if (!centerId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'No center assigned' });
    }

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([
                { medicine_id: 1, medicine_name: 'Paracetamol 500mg', total_quantity: 1200, category: 'General', threshold_quantity: 500, active_batches: 2 },
                { medicine_id: 2, medicine_name: 'Amoxicillin 250mg', total_quantity: 150, category: 'Antibiotic', threshold_quantity: 200, active_batches: 1 },
                { medicine_id: 3, medicine_name: 'Cetirizine', total_quantity: 50, category: 'Antihistamine', threshold_quantity: 100, active_batches: 1 }
            ]);
        }

        const sql = `
            SELECT 
                m.id as medicine_id, 
                m.name as medicine_name, 
                m.category,
                m.threshold_quantity,
                NVL(SUM(b.quantity_remaining), 0) as total_quantity,
                COUNT(b.id) as active_batches
            FROM medicines m
            JOIN batches b ON m.id = b.medicine_id AND b.center_id = :1
            WHERE m.is_active = 1
            GROUP BY m.id, m.name, m.category, m.threshold_quantity
            ORDER BY m.name ASC
        `;
        const result = await executeQuery(sql, [centerId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Inventory Error:', error);
        res.status(500).json({ message: 'Error fetching center stock: ' + error.message });
    }
};

// Get Global Inventory for ADMIN
exports.getGlobalInventory = async (req, res) => {
    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([
                { id: 1, name: 'Paracetamol 500mg', center: 'PHC_Dist_A', batch: 'BKT-101', qty: 1200, threshold: 500, expiry: '2026-12-31', status: 'Good' },
                { id: 2, name: 'Amoxicillin 250mg', center: 'PHC_Rural_B', batch: 'AMX-42', qty: 80, threshold: 200, expiry: '2026-06-01', status: 'Low' }
            ]);
        }

        const sql = `
            SELECT 
                b.id,
                m.name,
                c.name as center,
                b.batch_number as batch,
                b.quantity_remaining as qty,
                m.threshold_quantity as threshold,
                TO_CHAR(b.expiry_date, 'YYYY-MM-DD') as expiry,
                CASE 
                    WHEN b.quantity_remaining <= (m.threshold_quantity * 0.2) THEN 'Critical'
                    WHEN b.quantity_remaining <= m.threshold_quantity THEN 'Low'
                    ELSE 'Good'
                END as status
            FROM batches b
            JOIN medicines m ON b.medicine_id = m.id
            JOIN centers c ON b.center_id = c.id
            ORDER BY m.name ASC
        `;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (error) {
        console.error('Global Inventory Error:', error);
        res.status(500).json({ message: 'Error fetching global inventory: ' + error.message });
    }
};

// Get System Statistics for ADMIN Dashboard
exports.getSystemStats = async (req, res) => {
    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({
                total_medicines: 450,
                low_stock: 24,
                expiring_soon: 12,
                total_suppliers: 38,
                staff_accounts: 156
            });
        }

        // Parallel queries for performance
        const results = await Promise.all([
            executeQuery(`SELECT COUNT(*) as count FROM medicines WHERE is_active = 1`),
            executeQuery(`
                SELECT COUNT(*) as count FROM (
                    SELECT m.id
                    FROM medicines m
                    JOIN batches b ON m.id = b.medicine_id
                    GROUP BY m.id, m.threshold_quantity
                    HAVING SUM(b.quantity_remaining) <= m.threshold_quantity
                )
            `),
            executeQuery(`SELECT COUNT(*) as count FROM batches WHERE expiry_date <= ADD_MONTHS(SYSDATE, 3) AND quantity_remaining > 0`),
            executeQuery(`SELECT COUNT(*) as count FROM suppliers WHERE is_active = 1`),
            executeQuery(`SELECT COUNT(*) as count FROM users WHERE role = 'STAFF' AND is_active = 1`)
        ]);

        res.json({
            total_medicines: results[0].rows[0].count,
            low_stock: results[1].rows[0].count,
            expiring_soon: results[2].rows[0].count,
            total_suppliers: results[3].rows[0].count,
            staff_accounts: results[4].rows[0].count
        });
    } catch (error) {
        console.error('System Stats Error:', error);
        res.status(500).json({ message: 'Error fetching system stats: ' + error.message });
    }
};

// Stock IN (STAFF Only)
exports.addStockIn = async (req, res) => {
    console.log('Stock IN Request:', { body: req.body, user: req.user });
    const { medicine_id, batch_number, quantity, expiry_date, remarks } = req.body;

    // Convert to numbers and validate
    const centerId = Number(req.user.center_id);
    const userId = Number(req.user.id);
    const medId = Number(medicine_id);
    const qty = Number(quantity);

    if (isNaN(centerId) || isNaN(medId) || isNaN(qty)) {
        let missing = [];
        if (isNaN(centerId)) missing.push('center_id');
        if (isNaN(medId)) missing.push('medicine_id');
        if (isNaN(qty)) missing.push('quantity');
        return res.status(400).json({
            message: `Invalid numeric values detected: ${missing.join(', ')}. Please log out and back in to refresh your session.`
        });
    }

    if (!medicine_id || !batch_number || !quantity || !expiry_date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Stock IN processed' });
        }

        // 1. Check or Create Batch (Using named binds for safety)
        const findBatchSql = `SELECT id as "id" FROM batches WHERE center_id = :center AND medicine_id = :med AND batch_number = :batch`;
        const existingBatch = await executeQuery(findBatchSql, { center: centerId, med: medId, batch: batch_number });

        let batchId;
        if (existingBatch && existingBatch.rows && existingBatch.rows.length > 0) {
            batchId = existingBatch.rows[0].id || existingBatch.rows[0].ID; // Check both cases
            const updateBatchSql = `UPDATE batches SET quantity_remaining = quantity_remaining + :qty WHERE id = :bid`;
            await executeQuery(updateBatchSql, { qty: qty, bid: batchId });
        } else {
            const insertBatchSql = `
                INSERT INTO batches (medicine_id, center_id, batch_number, expiry_date, quantity_remaining)
                VALUES (:med, :center, :batch, TO_DATE(:exp, 'YYYY-MM-DD'), :qty)
                RETURNING id INTO :out_id
            `;
            const result = await executeQuery(insertBatchSql, {
                med: medId,
                center: centerId,
                batch: batch_number,
                exp: expiry_date,
                qty: qty,
                out_id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
            });

            // Retrieval depends on whether outBinds is array or object (named binds usually return object)
            batchId = result.outBinds.out_id;
            if (Array.isArray(batchId)) batchId = batchId[0];
        }

        if (!batchId) {
            throw new Error('Critical: Could not resolve or create Batch ID. Check if center data is seeded.');
        }

        // 2. Log Transaction
        const transSql = `
            INSERT INTO stock_transactions (medicine_id, batch_id, center_id, transaction_type, quantity, created_by, remarks)
            VALUES (:med, :bid, :center, 'IN', :qty, :usr_id, :rem)
        `;
        await executeQuery(transSql, {
            med: medId,
            bid: batchId,
            center: centerId,
            qty: qty,
            usr_id: userId,
            rem: remarks || null
        });

        res.json({ message: 'Stock added successfully' });
    } catch (error) {
        console.error('Stock IN Error:', error);
        res.status(500).json({ message: 'Error processing Stock IN: ' + error.message });
    }
};

// Stock OUT (STAFF Only)
exports.addStockOut = async (req, res) => {
    console.log('Stock OUT Request:', { body: req.body, user: req.user });
    const { batch_id, quantity, remarks } = req.body;

    // Convert to numbers and validate
    const centerId = Number(req.user.center_id);
    const userId = Number(req.user.id);
    const bId = Number(batch_id);
    const qty = Number(quantity);

    if (isNaN(centerId) || isNaN(bId) || isNaN(qty)) {
        let missing = [];
        if (isNaN(centerId)) missing.push('center_id');
        if (isNaN(bId)) missing.push('batch_id');
        if (isNaN(qty)) missing.push('quantity');
        return res.status(400).json({
            message: `Invalid numeric values detected: ${missing.join(', ')}. Please log out and back in to refresh your session.`
        });
    }

    if (!batch_id || !quantity) return res.status(400).json({ message: 'Batch ID and quantity required' });

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Stock OUT processed' });
        }

        // 1. Validate Stock Availability (Using named binds)
        const checkSql = `SELECT medicine_id as "medicine_id", quantity_remaining as "quantity_remaining" FROM batches WHERE id = :bid AND center_id = :center`;
        const batchData = await executeQuery(checkSql, { bid: bId, center: centerId });

        if (!batchData || !batchData.rows || batchData.rows.length === 0) {
            return res.status(404).json({ message: 'Batch not found in your center' });
        }

        const currentQty = batchData.rows[0].quantity_remaining || batchData.rows[0].QUANTITY_REMAINING;
        if (currentQty < qty) {
            return res.status(400).json({ message: 'Insufficient stock in selected batch' });
        }

        const medicineId = batchData.rows[0].medicine_id || batchData.rows[0].MEDICINE_ID;

        // 2. Deduct and Log
        const deductSql = `UPDATE batches SET quantity_remaining = quantity_remaining - :qty WHERE id = :bid`;
        await executeQuery(deductSql, { qty: qty, bid: bId });

        const transSql = `
            INSERT INTO stock_transactions (medicine_id, batch_id, center_id, transaction_type, quantity, created_by, remarks)
            VALUES (:med, :bid, :center, 'OUT', :qty, :usr_id, :rem)
        `;
        await executeQuery(transSql, {
            med: medicineId,
            bid: bId,
            center: centerId,
            qty: qty,
            usr_id: userId,
            rem: remarks || null
        });

        res.json({ message: 'Stock issued successfully' });
    } catch (error) {
        console.error('Stock OUT Error:', error);
        res.status(500).json({ message: 'Error processing Stock OUT: ' + error.message });
    }
};

// Help helper for available batches
exports.getMedicineBatches = async (req, res) => {
    const { medicine_id } = req.params;
    const centerId = Number(req.user.center_id);
    const medId = Number(medicine_id);

    if (isNaN(centerId) || isNaN(medId)) {
        return res.status(400).json({
            message: 'Invalid session or medicine ID. Please log out and back in.'
        });
    }

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([{ id: 101, batch_number: 'B-Demo', expiry_date: '2026-12-31', quantity_remaining: 500 }]);
        }

        const sql = `
            SELECT id, batch_number, TO_CHAR(expiry_date, 'YYYY-MM-DD') as expiry_date, quantity_remaining
            FROM batches
            WHERE medicine_id = :1 AND center_id = :2 AND quantity_remaining > 0
            ORDER BY expiry_date ASC
        `;
        const result = await executeQuery(sql, [medId, centerId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Fetch Batches Error:', error);
        res.status(500).json({ message: 'Error fetching batches' });
    }
};

// History for the center
exports.getHistory = async (req, res) => {
    const centerId = req.user.center_id;

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([
                { id: 1, transaction_type: 'IN', quantity: 500, transaction_date: new Date(), medicine_name: 'Paracetamol', batch_number: 'B-Demo', remarks: 'Demo entry' }
            ]);
        }

        const sql = `
            SELECT t.id, t.transaction_type, t.quantity, t.transaction_date, t.remarks, 
                   m.name as medicine_name, b.batch_number
            FROM stock_transactions t
            JOIN medicines m ON t.medicine_id = m.id
            JOIN batches b ON t.batch_id = b.id
            WHERE t.center_id = :1
            ORDER BY t.transaction_date DESC
        `;
        const result = await executeQuery(sql, [centerId]);

        res.json(result.rows);
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ message: 'Error fetching history: ' + error.message });
    }
};
