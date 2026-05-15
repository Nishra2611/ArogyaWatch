const { executeQuery } = require('../config/db');

// @route   POST /api/medicines
exports.createMedicine = async (req, res) => {
    const { name, category, threshold_quantity, manufacturer, price } = req.body;
    const adminId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Medicine name is required' });

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Medicine created successfully (Mock)' });
        }
        const sql = `
            INSERT INTO medicines (name, category, threshold_quantity, created_by, is_active)
            VALUES (:1, :2, :3, :4, 1)
        `;
        await executeQuery(sql, [name, category || 'General', threshold_quantity || 0, adminId]);
        res.status(201).json({ message: 'Medicine master record created successfully' });
    } catch (error) {
        if (error.message && error.message.includes('unique constraint')) {
            return res.status(400).json({ message: 'Medicine with this name already exists' });
        }
        console.error('Create Medicine Error:', error);
        res.status(500).json({ message: 'Error creating medicine record' });
    }
};

// @route   PUT /api/medicines/:id
exports.updateMedicine = async (req, res) => {
    const { id } = req.params;
    const { name, category, threshold_quantity, is_active } = req.body;

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Medicine updated successfully (Mock)' });
        }
        const sql = `
            UPDATE medicines 
            SET name = :1, category = :2, threshold_quantity = :3, is_active = :4
            WHERE id = :5
        `;
        await executeQuery(sql, [name, category, threshold_quantity, is_active !== undefined ? is_active : 1, id]);
        res.json({ message: 'Medicine record updated successfully' });
    } catch (error) {
        console.error('Update Medicine Error:', error);
        res.status(500).json({ message: 'Error updating medicine record' });
    }
};

// @route   DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res) => {
    const { id } = req.params;
    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Medicine deleted (Mock)' });
        }
        // Soft delete
        await executeQuery(`UPDATE medicines SET is_active = 0 WHERE id = :1`, [id]);
        res.json({ message: 'Medicine deactivated successfully' });
    } catch (error) {
        console.error('Delete Medicine Error:', error);
        res.status(500).json({ message: 'Error deleting medicine record' });
    }
};

// @route   GET /api/medicines
exports.getAllMedicines = async (req, res) => {
    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([
                { medicine_id: 1, name: 'Paracetamol 500mg', category: 'General', threshold_quantity: 500, is_active: 1 },
                { medicine_id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', threshold_quantity: 200, is_active: 1 },
                { medicine_id: 3, name: 'Cetirizine', category: 'Antihistamine', threshold_quantity: 100, is_active: 1 }
            ]);
        }
        const sql = `SELECT id as medicine_id, name, category, threshold_quantity, is_active FROM medicines WHERE is_active = 1 ORDER BY name ASC`;
        const result = await executeQuery(sql);
        res.json(result.rows);
    } catch (error) {
        console.error('Get Medicines Error:', error);
        res.status(500).json({ message: 'Error fetching medicines' });
    }
};
