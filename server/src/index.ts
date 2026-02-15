import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (err) {
        console.error('Database connection failed', err);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// API Routes (Placeholders)
app.get('/api/semesters', (req, res) => {
    res.json([{ id: 'mock', name: 'Mock Data (DB Not Connected)' }]);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
