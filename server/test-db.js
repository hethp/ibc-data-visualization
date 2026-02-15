const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

console.log('Loading .env from:', path.resolve(__dirname, '.env'));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
    console.log('Testing connection to:', process.env.DB_HOST);
    try {
        const client = await pool.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        if (err.code) {
            console.error('Error Code:', err.code);
        }
        process.exit(1);
    }
}

testConnection();
