require('dotenv').config({ path: './backend/.env' });
const { executeQuery, initializeDB } = require('./backend/config/db');

async function removeAdmin() {
    try {
        console.log('Env Port:', process.env.PORT);
        console.log('Env DB:', process.env.DB_CONNECTION_STRING);
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
