const { executeQuery, initializeDB } = require('./config/db');

async function removeAdmin() {
    try {
        await initializeDB();
        const sql = "DELETE FROM users WHERE email = 'admin@arogyawatch.gov'";
        console.log(`Executing: ${sql}`);
        const result = await executeQuery(sql);
        console.log('Successfully removed admin@arogyawatch.gov');
        process.exit(0);
    } catch (err) {
        console.error('Error removing admin:', err.message);
        process.exit(1);
    }
}

removeAdmin();
