const oracledb = require('oracledb');
require('dotenv').config();

// Oracle Database Connection Pool Initialization
async function initializeDB() {
    try {
        if (!process.env.DB_CONNECTION_STRING) {
            console.log('--- RUNNING IN DEMO MODE (No DB Connection String) ---');
            return;
        }
        console.log(`Connecting to: ${process.env.DB_CONNECTION_STRING} as ${process.env.DB_USER}`);
        await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING,
            poolMin: 1,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('✅ Oracle Database Connection Pool Started Successfully');
    } catch (err) {
        console.error('❌ CRITICAL: Could not initialize Oracle DB Pool.');
        console.error('Error Details:', err.message);
        console.warn('Backend will attempt to operate in Demo Mode if possible, but real DB queries will fail.');
    }
}

// Helper function to execute a query
async function executeQuery(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: true,
            ...options
        });

        // Normalize Oracle's UPPERCASE keys to lowercase for frontend compatibility
        if (result.rows && Array.isArray(result.rows)) {
            result.rows = result.rows.map(row => {
                const normalized = {};
                for (let key in row) {
                    normalized[key.toLowerCase()] = row[key];
                }
                return normalized;
            });
        }

        return result;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

module.exports = {
    initializeDB,
    executeQuery
};
