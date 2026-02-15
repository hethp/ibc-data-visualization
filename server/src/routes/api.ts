import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Get all semesters (derived from projects)
router.get('/semesters', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT project_semester as id, project_semester as name 
            FROM projects 
            ORDER BY project_semester DESC
        `);
        // Map to expected format (assuming "Semester Year" format or similar)
        const semesters = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            startDate: '2024-01-01', // Placeholder as date isn't in DB
            endDate: '2024-05-01',   // Placeholder
            isActive: false
        }));
        res.json(semesters);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch semesters' });
    }
});

// Get projects (optional semester filter)
router.get('/projects', async (req, res) => {
    try {
        const { semesterId } = req.query;
        let query = 'SELECT project_id as id, project_name as name, project_semester as semester, client_name as client FROM projects';
        const params: any[] = [];

        if (semesterId) {
            query += ' WHERE project_semester = $1';
            params.push(semesterId);
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get consultants (join users and consultants)
router.get('/consultants', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.email, 
                u.name, 
                u.gender, 
                u.curr_role as "currentRole",
                CASE WHEN EXISTS (SELECT 1 FROM consultant_projects cp WHERE cp.user_id = u.user_id) THEN true ELSE false END as active
            FROM users u
            LEFT JOIN consultants c ON u.user_id = c.user_id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch consultants' });
    }
});

// Get Aggregated Stats
router.get('/stats', async (req, res) => {
    try {
        const { semesterId } = req.query;
        // Aggregation queries
        // 1. Total Consultants (in semester)
        // 2. Project counts
        // 3. Gender distribution
        // 4. Role distribution

        // This is simplified. In reality we need to filter `consultant_projects` by semester. 
        // But `consultant_projects` table doesn't seem to have semester_id directly? 
        // It relies on `projects.project_semester`.

        const whereSemester = semesterId ? `WHERE p.project_semester = $1` : '';
        const params = semesterId ? [semesterId] : [];

        // Project Staffing
        const staffingRes = await pool.query(`
            SELECT p.project_id, COUNT(cp.user_id) as count
            FROM projects p
            JOIN consultant_projects cp ON p.project_id = cp.project_id
            ${whereSemester}
            GROUP BY p.project_id
        `, params);

        const projectStaffing: Record<string, number> = {};
        staffingRes.rows.forEach(row => {
            projectStaffing[row.project_id] = parseInt(row.count);
        });

        // Role Distribution (users in this semester)
        const roleRes = await pool.query(`
            SELECT cp.role, COUNT(DISTINCT cp.user_id) as count
            FROM consultant_projects cp
            JOIN projects p ON cp.project_id = p.project_id
            ${whereSemester}
            GROUP BY cp.role
        `, params);

        const roleDistribution: Record<string, number> = {};
        roleRes.rows.forEach(row => {
            roleDistribution[row.role] = parseInt(row.count);
        });

        // Gender Distribution
        const genderRes = await pool.query(`
            SELECT u.gender, COUNT(DISTINCT u.user_id) as count
            FROM users u
            JOIN consultant_projects cp ON u.user_id = cp.user_id
            JOIN projects p ON cp.project_id = p.project_id
            ${whereSemester}
            GROUP BY u.gender
        `, params);

        const genderDistribution: Record<string, number> = {};
        genderRes.rows.forEach(row => {
            genderDistribution[row.gender || 'Unknown'] = parseInt(row.count);
        });

        // Totals
        const totalConsultants = Object.values(genderDistribution).reduce((a, b) => a + b, 0);

        const totalProjectsRes = await pool.query(`SELECT COUNT(*) FROM projects ${semesterId ? 'WHERE project_semester = $1' : ''}`, params);

        res.json({
            totalConsultants,
            activeConsultants: totalConsultants, // Assuming filtered list is active
            totalProjects: parseInt(totalProjectsRes.rows[0].count),
            genderDistribution,
            roleDistribution,
            projectStaffing
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
