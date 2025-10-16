require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function connectToDatabase() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL connecté');
    } catch (err) {
        console.error('❌ Erreur de connexion PostgreSQL:', err.message || err);
        throw err;
    }
}

module.exports = { pool, connectToDatabase };