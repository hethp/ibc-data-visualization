import { pool } from '../src/config/db';

async function testConnection() {
    console.log('Testing database connection...');
    try {
        const client = await pool.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        client.release();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
