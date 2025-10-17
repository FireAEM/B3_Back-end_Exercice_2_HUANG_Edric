require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');

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

// Connexion PostgreSQL
async function connectPostgres() {
    try {
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL connecté');
    } catch (err) {
        console.error('❌ Erreur de connexion PostgreSQL:', err.message || err);
        throw err;
    }
}

// Connexion MongoDB
async function connectMongo() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB: déjà connecté');
            return;
        }
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ MongoDB connecté:', mongoUri);
    } catch (err) {
        console.error('❌ Erreur de connexion MongoDB:', err.message || err);
        throw err;
    }
}

// Fonction générique
async function connectToDatabase() {
    const client = (process.env.DB_CLIENT).toLowerCase();
    if (client === 'mongo') {
        return connectMongo();
    }
    return connectPostgres();
}

module.exports = { pool, mongoose, connectToDatabase };