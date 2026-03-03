import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import type { SemesterStats } from '../../types';

/* ── shared tooltip style ── */
const tooltipStyle = {
    contentStyle: { backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8, color: '#f3f4f6' },
};

/* ──────────────────────────────────────
   1. Line/Area chart — Total Consultants
   ────────────────────────────────────── */
export function ConsultantsTrendChart({ data }: { data: SemesterStats[] }) {
    const chartData = data.map(s => ({ semester: s.semesterId, Consultants: s.totalConsultants }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 font-medium mb-4 text-sm">Total Consultants Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="gradConsultants" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="semester" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Area
                        type="monotone"
                        dataKey="Consultants"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#gradConsultants)"
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#818cf8' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ──────────────────────────────────────
   2. Line/Area chart — Total Projects
   ────────────────────────────────────── */
export function ProjectsTrendChart({ data }: { data: SemesterStats[] }) {
    const chartData = data.map(s => ({ semester: s.semesterId, Projects: s.totalProjects }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 font-medium mb-4 text-sm">Total Projects Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="gradProjects" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="semester" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Area
                        type="monotone"
                        dataKey="Projects"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        fill="url(#gradProjects)"
                        dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#c084fc' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ──────────────────────────────────────
   3. Grouped bar chart — Gender Distribution
   ────────────────────────────────────── */
export function GenderTrendChart({ data }: { data: SemesterStats[] }) {
    // Collect all gender keys across semesters
    const genders = Array.from(new Set(data.flatMap(s => Object.keys(s.genderDistribution))));

    const chartData = data.map(s => {
        const row: Record<string, string | number> = { semester: s.semesterId };
        genders.forEach(g => { row[g] = s.genderDistribution[g] || 0; });
        return row;
    });

    const GENDER_COLORS: Record<string, string> = {
        Male: '#3b82f6',
        Female: '#ec4899',
        Other: '#f59e0b',
        Unknown: '#6b7280',
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 font-medium mb-4 text-sm">Gender Distribution by Semester</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="semester" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    {genders.map(g => (
                        <Bar
                            key={g}
                            dataKey={g}
                            fill={GENDER_COLORS[g] || '#6b7280'}
                            radius={[4, 4, 0, 0]}
                            barSize={28}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ──────────────────────────────────────
   4. Grouped bar chart — Role Distribution
   ────────────────────────────────────── */
const ROLE_COLORS: Record<string, string> = {
    NC: '#E3B4F7',
    EC: '#AB5DCD',
    SC: '#8F32B8',
    PM: '#811CAD',
    SM: '#7306A2',
};

export function RoleTrendChart({ data }: { data: SemesterStats[] }) {
    const allowedRoles = ['NC', 'EC', 'SC', 'PM', 'SM'];

    const chartData = data.map(s => {
        const row: Record<string, string | number> = { semester: s.semesterId };
        allowedRoles.forEach(r => { row[r] = s.roleDistribution[r] || 0; });
        return row;
    });

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 font-medium mb-4 text-sm">Role Distribution by Semester</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="semester" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Legend />
                    {allowedRoles.map(r => (
                        <Bar
                            key={r}
                            dataKey={r}
                            fill={ROLE_COLORS[r] || '#6b7280'}
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
