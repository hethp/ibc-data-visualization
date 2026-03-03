import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';
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
const YEAR_COLORS = { 'Freshman': '#a855f7', 'Unknown': '#ec4899', 'Sophomore': '#f59e0b', 'Junior': '#3b82f6', 'Senior': '#e1e33f', 'Masters': '#7306A2', 'Doctorate': '#06b6d4' };


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
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#c7d2fe' }}
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
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f9a8d4' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ProjectStaffingBlocks({ data }: { data: DashboardStats['projectStaffing'], projects?: Project[] }) {
    const entries = Object.entries(data).map(([projName, count]) => ({
        name: projName,
        count,
    })).sort((a, b) => b.count - a.count); // sort by headcount descending

    const max = Math.max(...entries.map(e => e.count), 1);

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-400 font-medium mb-1 text-sm">Team Size by Project</h3>
            <p className="text-gray-600 text-xs mb-4">Number of consultants assigned to each project</p>
            <div className="space-y-3">
                {entries.map((e) => {
                    const pct = Math.round((e.count / max) * 100);
                    return (
                        <div key={e.name} className="group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-300 font-medium truncate max-w-[70%]">{e.name}</span>
                                <span className="text-sm text-white font-bold tabular-nums">{e.count} <span className="text-gray-500 font-normal text-xs">consultants</span></span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, #6366f1, #a855f7)`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


interface StaffingChartProps {
    data: DashboardStats['projectStaffing'];
    onBarClick?: (projectId: string) => void;
    selectedProjects?: string[];
    projects?: Project[];
}

export function ProjectStaffingChart({ data, onBarClick, selectedProjects = [], projects = [] }: StaffingChartProps) {
    // Build a lookup from project ID to project name
    const idToName: Record<string, string> = {};
    projects.forEach(p => { idToName[p.id] = p.name; });

    // Build array: data keys are project IDs, display as names
    const chartData = Object.entries(data)
        .map(([projId, count]) => ({
            projectId: projId,
            project: idToName[projId] || projId, // fallback to raw ID
            consultants: count,
        }))
        .sort((a, b) => b.consultants - a.consultants);

    // Dynamic height based on number of projects (at least 280, 42px per bar)
    const dynamicHeight = Math.max(280, chartData.length * 42 + 60);
    const hasSelection = selectedProjects.length > 0;

    return (
        <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5 col-span-1 md:col-span-2" style={{ height: dynamicHeight + 50 }}>
            <h3 className="text-gray-400 font-medium mb-1 text-sm">Consultants per Project</h3>
            <p className="text-gray-600 text-xs mb-4">
                {onBarClick ? 'Click a bar to filter dashboard by that project' : 'Horizontal bars show how many consultants are staffed on each project'}
            </p>
            <ResponsiveContainer width="100%" height={dynamicHeight - 40}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
                    onClick={(state: any) => {
                        if (onBarClick && state?.activePayload?.[0]) {
                            const clickedId = state.activePayload[0].payload.projectId;
                            onBarClick(clickedId);
                        }
                    }}
                    style={{ cursor: onBarClick ? 'pointer' : undefined }}
                >
                    <XAxis
                        type="number"
                        stroke="#6b7280"
                        fontSize={12}
                        label={{ value: 'Consultants', position: 'insideBottomRight', offset: -5, fill: '#6b7280', fontSize: 11 }}
                    />
                    <YAxis
                        dataKey="project"
                        type="category"
                        stroke="#6b7280"
                        fontSize={11}
                        width={180}
                        tick={{ fill: '#d1d5db' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#c7d2fe' }}
                        formatter={(value) => [`${value} consultants`, 'Team Size']}
                        cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                    />
                    <Bar dataKey="consultants" radius={[0, 6, 6, 0]} barSize={22}>
                        {chartData.map((entry, index) => {
                            const isSelected = selectedProjects.includes(entry.projectId);
                            const baseColor = COLORS[index % COLORS.length];
                            return (
                                <Cell
                                    key={entry.projectId}
                                    fill={baseColor}
                                    opacity={hasSelection && !isSelected ? 0.3 : 1}
                                    stroke={isSelected ? '#ffffff' : 'none'}
                                    strokeWidth={isSelected ? 2 : 0}
                                />
                            );
                        })}
                        <LabelList dataKey="consultants" position="right" fill="#d1fae5" fontSize={12} fontWeight={600} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DemographicChart({ data }: { data: DashboardStats['demographicChart'] }) {
    const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Masters', 'Doctorate', 'Unknown'];
    const chartData = yearOrder
        .filter(y => data[y] !== undefined)
        .map(y => ({ name: y, value: data[y] }));

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-medium mb-4">Class Year Distribution</h3>
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
                            <Cell key={`cell-${index}`} fill={YEAR_COLORS[entry.name as keyof typeof YEAR_COLORS] || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#c4b5fd' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}


