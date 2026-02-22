import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';
import { useState } from 'react';
import type { DashboardStats, Project } from '../../types';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const GENDER_COLORS = { 'Male': '#3b82f6', 'Female': '#ec4899', 'Unknown': '#e1e33f' };
const ROLE_COLORS: Record<string, string> = {
    'PL': '#6366f1',
    'Pc': '#8b5cf6',
    'Sr': '#a855f7',
    'A': '#d946ef',
    'T': '#ec4899',
    'NC': '#E3B4F7', // New Consultant — green
    'EC': '#AB5DCD', // Example Consultant
    'SC': '#8F32B8', // Senior Consultant
    'PM': '#811CAD', // Project Manager
    'SM': '#7306A2', // Scrum Master / Senior Manager
    'Associate': '#f43f5e',
    'Senior Associate': '#f59e0b',
    'Principal': '#3b82f6',
    'Team Lead': '#06b6d4'
};

export function RoleDistributionChart({ data }: { data: DashboardStats['roleDistribution'] }) {
    // Only show these roles, in this specific order
    const allowedRoles = ['NC', 'EC', 'SC', 'PM', 'SM'];
    const chartData = allowedRoles.map(r => ({ role: r, count: data[r] || 0 }));

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-medium mb-4">Consultants by Role</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                    <XAxis dataKey="role" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${entry.role}`}
                                fill={ROLE_COLORS[entry.role] || COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function GenderChart({ data }: { data: DashboardStats['genderDistribution'] }) {
    const chartData = Object.entries(data).map(([gender, count]) => ({ name: gender, value: count }));

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-medium mb-4">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name as keyof typeof GENDER_COLORS] || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#cd8cea', borderColor: '#48005e', color: '#f3f4f6' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ProjectStaffingBlocks({ data, projects }: { data: DashboardStats['projectStaffing'], projects?: Project[] }) {
    const entries = Object.entries(data).map(([projId, count]) => ({
        id: projId,
        count
    })).sort((a, b) => a.id.localeCompare(b.id));

    const [hovered, setHovered] = useState<string | null>(null);

    const max = Math.max(...entries.map(e => e.count), 1);

    const colorFor = (count: number) => {
        // Map count to HSL lightness (higher count -> darker)
        const lightness = 80 - Math.round((count / max) * 50); // 80% -> 30%
        return `hsl(220 60% ${lightness}%)`;
    };

    const textColorFor = (count: number) => {
        const lightness = 80 - Math.round((count / max) * 50);
        return lightness < 50 ? '#ffffff' : '#111827';
    };

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-medium mb-4">Project Blocks (shade ∝ headcount)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {entries.map((e) => {
                    const isHovered = hovered === e.id;
                    return (
                        <div
                            key={e.id}
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setHovered(e.id)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(e.id)}
                            onBlur={() => setHovered(null)}
                            title={`${e.id}: ${e.count} consultants`}
                            style={{
                                background: colorFor(e.count),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                borderRadius: 8,
                                color: textColorFor(e.count),
                                height: 72,
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                boxShadow: isHovered ? '0 6px 18px rgba(2,6,23,0.6)' : undefined,
                                transform: isHovered ? 'translateY(-4px)' : undefined,
                                transition: 'transform 120ms ease, box-shadow 120ms ease'
                            }}
                        >
                            <div className="px-2 text-sm font-medium text-center w-full">{isHovered ? `${e.count} consultants` : e.id}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export function ProjectStaffingChart({ data }: { data: DashboardStats['projectStaffing'] }) {
    // Build array and sort by consultant count descending so largest projects appear first
    const chartData = Object.entries(data)
        .map(([projId, count]) => ({ projId, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4 col-span-1 md:col-span-2">
            <h3 className="text-gray-400 font-medium mb-4">Staffing per Project</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="projId" type="category" stroke="#6b7280" fontSize={12} width={160} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18}>
                        <LabelList dataKey="count" position="right" fill="#d1fae5" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}



