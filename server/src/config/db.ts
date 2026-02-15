import { Pool } from 'pg';
import dotenv from 'dotenv';

import path from 'path';

console.log('Current working directory:', process.cwd());
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
