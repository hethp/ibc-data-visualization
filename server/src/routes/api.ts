import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Login endpoint - verify email exists in consultants table
router.post('/auth/login', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email exists in users table AND has a corresponding record in consultants table
        const result = await pool.query(`
            SELECT 
                u.email, 
                u.name, 
                u.user_id
            FROM users u
            INNER JOIN consultants c ON u.user_id = c.user_id
            WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email. Access denied.' });
        }

        // Return success with user info (in a real app, you'd generate a token here)
        res.json({
            success: true,
            user: {
                email: result.rows[0].email,
                name: result.rows[0].name
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to authenticate' });
    }
});

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
                c.year as "yearInSchool",
                c.major,
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
        const { semesterId, projects: projectsParam, project: projectParam } = req.query;
        // allow old `project` parameter for backwards compatibility
        let projectIdsString: string | undefined = undefined;
        if (projectsParam && typeof projectsParam === 'string') {
            projectIdsString = projectsParam;
        } else if (projectParam && typeof projectParam === 'string') {
            projectIdsString = projectParam;
        }
        // Aggregation queries
        // 1. Total Consultants (in semester or project(s))
        // 2. Project counts
        // 3. Gender distribution
        // 4. Role distribution

        // Build a dynamic WHERE clause for semester/project filtering
        const clauses: string[] = [];
        const params: any[] = [];
        if (semesterId) {
            params.push(semesterId);
            clauses.push(`p.project_semester = $${params.length}`);
        }
        if (projectIdsString && typeof projectIdsString === 'string') {
            const ids = projectIdsString.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (ids.length > 0) {
                params.push(ids);
                clauses.push(`p.project_id = ANY($${params.length})`);
            }
        }
        const whereSQL = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

        // Project Staffing
        const staffingRes = await pool.query(`
            SELECT p.project_id, COUNT(cp.user_id) as count
            FROM projects p
            JOIN consultant_projects cp ON p.project_id = cp.project_id
            ${whereSQL}
            GROUP BY p.project_id
        `, params);

        const projectStaffing: Record<string, number> = {};
        staffingRes.rows.forEach(row => {
            projectStaffing[row.project_id] = parseInt(row.count);
        });

        // Demographic Chart (year in school distribution)
        const demographicRes = await pool.query(`
            SELECT COALESCE(c.year, 'Unknown') as year, COUNT(DISTINCT c.user_id) as count
            FROM consultants c
            JOIN consultant_projects cp ON c.user_id = cp.user_id
            JOIN projects p ON cp.project_id = p.project_id
            ${whereSQL}
            GROUP BY c.year
        `, params);

        const demographicChart: Record<string, number> = {};
        demographicRes.rows.forEach(row => {
            demographicChart[row.year] = parseInt(row.count);
        });

        // Role Distribution (users in this semester)
        const roleRes = await pool.query(`
            SELECT cp.role, COUNT(DISTINCT cp.user_id) as count
            FROM consultant_projects cp
            JOIN projects p ON cp.project_id = p.project_id
            ${whereSQL}
            GROUP BY cp.role
        `, params);

        // Ensure all known roles are present in the response (default to 0)
        const ALL_ROLES = ['PL', 'Pc', 'Sr', 'A', 'T', 'NC', 'EC', 'SC', 'PM', 'SM', 'Associate', 'Senior Associate', 'Principal', 'Team Lead'];
        const roleDistribution: Record<string, number> = {};
        ALL_ROLES.forEach(r => { roleDistribution[r] = 0; });
        roleRes.rows.forEach(row => {
            roleDistribution[row.role] = parseInt(row.count);
        });

        // Only include unassigned users (NCs etc.) when NO specific projects are selected.
        // When viewing a specific project, only show roles of users actually on that project.
        if (!projectIdsString) {
            const extraRoles = ['NC', 'EC', 'SC', 'PM', 'SM'];
            let unassignedQuery: string;
            let unassignedParams: any[];
            if (semesterId) {
                unassignedQuery = `
                    SELECT u.curr_role as role, COUNT(*) as count
                    FROM users u
                    LEFT JOIN consultant_projects cp ON u.user_id = cp.user_id
                    LEFT JOIN projects p ON cp.project_id = p.project_id AND p.project_semester = $2
                    WHERE u.curr_role = ANY($1) AND p.project_id IS NULL
                    GROUP BY u.curr_role
                `;
                unassignedParams = [extraRoles, semesterId];
            } else {
                unassignedQuery = `
                    SELECT u.curr_role as role, COUNT(*) as count
                    FROM users u
                    LEFT JOIN consultant_projects cp ON u.user_id = cp.user_id
                    LEFT JOIN projects p ON cp.project_id = p.project_id
                    WHERE u.curr_role = ANY($1) AND p.project_id IS NULL
                    GROUP BY u.curr_role
                `;
                unassignedParams = [extraRoles];
            }

            const unassignedRes = await pool.query(unassignedQuery, unassignedParams);
            unassignedRes.rows.forEach(row => {
                roleDistribution[row.role] = (roleDistribution[row.role] || 0) + parseInt(row.count);
            });
        }

        // Gender Distribution — respects project filter
        // When specific projects are selected, only count users on those projects.
        // When just a semester is selected (no project filter), also include unassigned users like NCs.
        const hasProjectFilter = projectIdsString && projectIdsString.length > 0;

        let genderQuery: string;
        let genderParams: any[];

        if (hasProjectFilter) {
            // Only users on the selected projects
            genderQuery = `
                SELECT COALESCE(u.gender, c.gender, 'Unknown') as gender, COUNT(DISTINCT u.user_id) as count
                FROM users u
                JOIN consultant_projects cp ON u.user_id = cp.user_id
                JOIN projects p ON cp.project_id = p.project_id
                LEFT JOIN consultants c ON u.user_id = c.user_id
                ${whereSQL}
                GROUP BY COALESCE(u.gender, c.gender, 'Unknown')
            `;
            genderParams = params;
        } else if (semesterId) {
            // All semester users: assigned + unassigned (NCs etc.)
            genderQuery = `
                SELECT COALESCE(u.gender, c.gender, 'Unknown') as gender, COUNT(DISTINCT u.user_id) as count
                FROM (
                    SELECT u2.user_id, u2.gender
                    FROM users u2
                    JOIN consultant_projects cp ON u2.user_id = cp.user_id
                    JOIN projects p ON cp.project_id = p.project_id
                    WHERE p.project_semester = $1
                    UNION
                    SELECT u3.user_id, u3.gender
                    FROM users u3
                    WHERE u3.curr_role IN ('NC','EC','SC','PM','SM')
                    AND u3.user_id NOT IN (
                        SELECT cp2.user_id FROM consultant_projects cp2
                        JOIN projects p2 ON cp2.project_id = p2.project_id
                        WHERE p2.project_semester = $1
                    )
                ) u
                LEFT JOIN consultants c ON u.user_id = c.user_id
                GROUP BY COALESCE(u.gender, c.gender, 'Unknown')
            `;
            genderParams = [semesterId];
        } else {
            genderQuery = `
                SELECT COALESCE(u.gender, c.gender, 'Unknown') as gender, COUNT(DISTINCT u.user_id) as count
                FROM users u
                LEFT JOIN consultants c ON u.user_id = c.user_id
                GROUP BY COALESCE(u.gender, c.gender, 'Unknown')
            `;
            genderParams = [];
        }
        const genderRes = await pool.query(genderQuery, genderParams);

        const genderDistribution: Record<string, number> = {};
        genderRes.rows.forEach(row => {
            genderDistribution[row.gender] = parseInt(row.count);
        });

        // Totals
        const totalConsultants = Object.values(genderDistribution).reduce((a, b) => a + b, 0);

        // count projects matching the same filters
        let totalProjectsQuery = 'SELECT COUNT(*) FROM projects p';
        if (clauses.length) {
            totalProjectsQuery += ` WHERE ${clauses.join(' AND ')}`;
        }
        const totalProjectsRes = await pool.query(totalProjectsQuery, params);

        res.json({
            totalConsultants,
            activeConsultants: totalConsultants, // Assuming filtered list is active
            totalProjects: parseInt(totalProjectsRes.rows[0].count),
            genderDistribution,
            roleDistribution,
            projectStaffing,
            demographicChart
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ─── Compare stats across multiple semesters ───
router.get('/stats/compare', async (req, res) => {
    try {
        const { semesters: semesterParam } = req.query;
        if (!semesterParam || typeof semesterParam !== 'string') {
            return res.status(400).json({ error: 'Provide a comma-separated list of semester IDs via ?semesters=S25,F24,...' });
        }

        const semesterIds = semesterParam.split(',').map(s => s.trim()).filter(Boolean);
        if (semesterIds.length < 2) {
            return res.status(400).json({ error: 'At least 2 semester IDs are required for comparison.' });
        }

        // Helper: fetch core stats for one semester (mirrors /stats logic)
        async function statsForSemester(semId: string) {
            const params = [semId];

            // Total projects
            const totalProjectsRes = await pool.query(
                `SELECT COUNT(*) FROM projects WHERE project_semester = $1`, params
            );

            // Total consultants (distinct users on projects in this semester)
            const totalConsultantsRes = await pool.query(`
                SELECT COUNT(DISTINCT cp.user_id) as count
                FROM consultant_projects cp
                JOIN projects p ON cp.project_id = p.project_id
                WHERE p.project_semester = $1
            `, params);

            // Gender distribution
            const genderRes = await pool.query(`
                SELECT u.gender, COUNT(DISTINCT u.user_id) as count
                FROM users u
                JOIN consultant_projects cp ON u.user_id = cp.user_id
                JOIN projects p ON cp.project_id = p.project_id
                WHERE p.project_semester = $1
                GROUP BY u.gender
            `, params);
            const genderDistribution: Record<string, number> = {};
            genderRes.rows.forEach(row => {
                genderDistribution[row.gender || 'Unknown'] = parseInt(row.count);
            });

            // Role distribution
            const roleRes = await pool.query(`
                SELECT cp.role, COUNT(DISTINCT cp.user_id) as count
                FROM consultant_projects cp
                JOIN projects p ON cp.project_id = p.project_id
                WHERE p.project_semester = $1
                GROUP BY cp.role
            `, params);
            const roleDistribution: Record<string, number> = {};
            roleRes.rows.forEach(row => {
                roleDistribution[row.role] = parseInt(row.count);
            });

            return {
                semesterId: semId,
                totalProjects: parseInt(totalProjectsRes.rows[0].count),
                totalConsultants: parseInt(totalConsultantsRes.rows[0].count),
                genderDistribution,
                roleDistribution,
            };
        }

        // Fetch all in parallel
        const semesterStats = await Promise.all(semesterIds.map(statsForSemester));

        // Sort chronologically: convention is S=Spring(01), F=Fall(02) within year
        const semOrder = (id: string) => {
            const season = id.charAt(0); // S or F
            const yr = parseInt(id.slice(1), 10);
            return yr * 10 + (season === 'S' ? 0 : 5);
        };
        semesterStats.sort((a, b) => semOrder(a.semesterId) - semOrder(b.semesterId));

        // Compute changes between last two entries
        const changeDelta = (curr: number, prev: number) => ({
            value: curr - prev,
            percent: prev === 0 ? (curr === 0 ? 0 : 100) : parseFloat((((curr - prev) / prev) * 100).toFixed(1)),
        });

        let changes: any = null;
        if (semesterStats.length >= 2) {
            const prev = semesterStats[semesterStats.length - 2]!;
            const curr = semesterStats[semesterStats.length - 1]!;

            const genderChanges: Record<string, any> = {};
            const allGenders = new Set([...Object.keys(curr.genderDistribution), ...Object.keys(prev.genderDistribution)]);
            allGenders.forEach(g => {
                genderChanges[g] = changeDelta(curr.genderDistribution[g] || 0, prev.genderDistribution[g] || 0);
            });

            const roleChanges: Record<string, any> = {};
            const allRoles = new Set([...Object.keys(curr.roleDistribution), ...Object.keys(prev.roleDistribution)]);
            allRoles.forEach(r => {
                roleChanges[r] = changeDelta(curr.roleDistribution[r] || 0, prev.roleDistribution[r] || 0);
            });

            changes = {
                totalConsultants: changeDelta(curr.totalConsultants, prev.totalConsultants),
                totalProjects: changeDelta(curr.totalProjects, prev.totalProjects),
                gender: genderChanges,
                roles: roleChanges,
            };
        }

        res.json({ semesters: semesterStats, changes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch comparison stats' });
    }
});

export default router;
