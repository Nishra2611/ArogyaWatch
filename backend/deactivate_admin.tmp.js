const { executeQuery, initializeDB } = require('./config/db');

async function deactivateAdmin() {
    try {
        await initializeDB();
        const sql = "UPDATE users SET is_active = 0 WHERE email = 'admin@arogyawatch.gov'";
        console.log(`Executing: ${sql}`);
        const result = await executeQuery(sql);
        console.log('Successfully deactivated admin@arogyawatch.gov');
        process.exit(0);
    } catch (err) {
        console.error('Error deactivating admin:', err.message);
        process.exit(1);
    }
}

deactivateAdmin();
