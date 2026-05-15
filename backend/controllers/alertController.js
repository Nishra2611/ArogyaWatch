const { executeQuery } = require('../config/db');

// Get active alerts for a center
exports.getCenterAlerts = async (req, res) => {
    const centerId = req.user.center_id;

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json([
                { id: 1, alert_type: 'LOW_STOCK', alert_message: 'Stock fell below minimum threshold', severity: 'HIGH', status: 'ACTIVE', medicine_name: 'Amoxicillin', created_at: new Date() },
                { id: 2, alert_type: 'SHORT_EXPIRY', alert_message: 'Items expiring in 15 days', severity: 'CRITICAL', status: 'ACTIVE', medicine_name: 'Insulin', created_at: new Date() }
            ]);
        }

        const sql = `
            SELECT a.id, a.alert_type, a.alert_message, a.severity, a.status, a.created_at, m.name as medicine_name
            FROM alerts a
            JOIN medicines m ON a.medicine_id = m.id
            WHERE a.center_id = :1 AND a.status = 'ACTIVE'
            ORDER BY a.created_at DESC
        `;
        const result = await executeQuery(sql, [centerId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching alerts' });
    }
};

// Resolve an alert
exports.resolveAlert = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        if (!process.env.DB_CONNECTION_STRING) {
            return res.json({ message: '[DEMO] Alert resolved in mock state' });
        }
        const sql = `
            UPDATE alerts 
            SET status = 'RESOLVED', resolved_at = CURRENT_TIMESTAMP, resolved_by = :1
            WHERE id = :2
        `;
        await executeQuery(sql, [userId, id]);
        res.json({ message: 'Alert marked as resolved' });
    } catch (error) {
        res.status(500).json({ message: 'Error resolving alert' });
    }
};
