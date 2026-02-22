import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the platform directory
app.use(express.static(path.join(__dirname, '../../platform')));

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

import apiRoutes from './routes/api';

// Mount API routes
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
