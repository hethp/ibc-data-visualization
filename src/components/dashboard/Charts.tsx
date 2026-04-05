import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';
import type { DashboardStats, Project, Role } from '../../types';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const GENDER_COLORS = { 'Male': '#3b82f6', 'Female': '#ec4899', 'Unknown': '#e1e33f' };
const ROLE_COLORS: Record<string, string> = {
    'PL': '#6366f1',
    'Pc': '#8b5cf6',
    'Sr': '#a855f7',
    'A': '#d946ef',
    'T': '#ec4899',
    'NC': '#E3B4F7',
    'EC': '#AB5DCD',
    'SC': '#8F32B8',
    'PM': '#811CAD',
    'SM': '#7306A2',
    'Associate': '#f43f5e',
    'Senior Associate': '#f59e0b',
    'Principal': '#3b82f6',
    'Team Lead': '#06b6d4',
};
const YEAR_COLORS: Record<string, string> = {
    'Freshman': '#a855f7',
    'Sophomore': '#f59e0b',
    'Junior': '#3b82f6',
    'Senior': '#e1e33f',
    'Master\'s': '#7306A2',
};

export function RoleDistributionChart({ data }: { data: DashboardStats['roleDistribution'] }) {
    // Only show a subset of roles in a consistent order
    const allowedRoles: Role[] = ['NC', 'EC', 'SC', 'PM', 'SM', 'SD'];
    const chartData = allowedRoles.map((r) => ({ role: r, count: data[r] ?? 0 }));
    const total = chartData.reduce((sum, entry) => sum + entry.count, 0);

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 font-medium mb-4">Consultants by Role</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                    <XAxis dataKey="role" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            borderRadius: 8,
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#c7d2fe' }}
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: number, name: string) => {
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return [`${name}: ${value} (${percent}%)`, 'Consultants'];
                        }}
                    />
                    <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        onMouseEnter={(_data: any, index: number) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${entry.role}`}
                                fill={ROLE_COLORS[entry.role] || COLORS[index % COLORS.length]}
                                style={{
                                    transition: 'transform 0.15s ease',
                                    transform: activeIndex === index ? 'scale(1.08)' : undefined,
                                    transformOrigin: 'center bottom',
                                }}
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
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

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
                            <Cell
                                key={`cell-${index}`}
                                fill={GENDER_COLORS[entry.name as keyof typeof GENDER_COLORS] || COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            borderRadius: 8,
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f9a8d4' }}
                        formatter={(value: number, name: string) => {
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return [`${name}: ${value} (${percent}%)`, 'Consultants'];
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ProjectStaffingBlocks({ data }: { data: DashboardStats['projectStaffing']; projects?: Project[] }) {
    const entries = Object.entries(data)
        .map(([projName, count]) => ({
            name: projName,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    const max = Math.max(...entries.map((e) => e.count), 1);

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
                                <span className="text-sm text-gray-300 font-medium truncate max-w-[70%]">
                                    {e.name}
                                </span>
                                <span className="text-sm text-white font-bold tabular-nums">
                                    {e.count}{' '}
                                    <span className="text-gray-500 font-normal text-xs">consultants</span>
                                </span>
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
    const idToName: Record<string, string> = {};
    projects.forEach((p) => {
        idToName[p.id] = p.name;
    });

    const chartData = Object.entries(data)
        .map(([projId, count]) => ({
            projectId: projId,
            project: idToName[projId] || projId,
            consultants: count,
        }))
        .sort((a, b) => b.consultants - a.consultants);

    const dynamicHeight = Math.max(280, chartData.length * 42 + 60);
    const hasSelection = selectedProjects.length > 0;

    return (
        <div
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-5 col-span-1 md:col-span-2"
            style={{ height: dynamicHeight + 50 }}
        >
            <h3 className="text-gray-400 font-medium mb-1 text-sm">Consultants per Project</h3>
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
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            borderRadius: 8,
                        }}
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
    const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Master\'s'];
    const chartData = yearOrder
        .filter((y) => data[y] !== undefined)
        .map((y) => ({ name: y, value: data[y] }));
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4">
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tick={{ fill: '#d1d5db' }} />
                    <YAxis stroke="#6b7280" fontSize={11} tick={{ fill: '#d1d5db' }} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            borderRadius: 8,
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#c4b5fd' }}
                        cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                        formatter={(value: number, _name: string, props: any) => {
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return [`${value} students (${percent}%)`, props.payload.name];
                        }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {chartData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={YEAR_COLORS[entry.name] || '#6366f1'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function MajorDistributionChart({ data }: { data: DashboardStats['majorDistribution'] }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const chartData = Object.entries(data || {})
        .map(([major, count]) => ({ name: major, value: count }))
        .sort((a, b) => b.value - a.value);

    const MAJOR_COLORS: Record<string, string> = {
        'Computer Science': '#6366f1',
        'Engineering': '#8b5cf6',
        'Business': '#a855f7',
        'Data Science & Analytics': '#ec4899',
        'Economics': '#d946ef',
        'Science': '#f43f5e',
        'Liberal Arts & Sciences': '#f97316',
        'Communications': '#eab308',
        'Other': '#6b7280',
        'Unknown': '#6b7280',
    };

    if (isExpanded) {
        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
                        <h3 className="text-gray-400 font-medium">Major Distribution</h3>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-gray-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="p-4" style={{ height: '600px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
                            >
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={240} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                    itemStyle={{ color: '#fca5a5' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={MAJOR_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-700 transition-colors"
            onClick={() => setIsExpanded(true)}
        >
            <h3 className="text-gray-400 font-medium mb-4">Major Distribution (Click to expand)</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#fca5a5' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={MAJOR_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function CollegeDistributionChart({ data }: { data: DashboardStats['collegeDistribution'] }) {
    const chartData = Object.entries(data || {}).map(([college, count]) => ({ 
        name: college, 
        value: count 
    }));

    const COLLEGE_COLORS: Record<string, string> = {
        'Grainger College of Engineering': '#6366f1',
        'Gies College of Business': '#8b5cf6',
        'College of Liberal Arts & Sciences': '#a855f7',
        'College of Fine & Applied Arts': '#d946ef',
        'ACES': '#ec4899',
        'College of Media': '#f43f5e',
        'College of Education': '#f97316',
        'College of Law': '#eab308',
        'College of Veterinary Medicine': '#84cc16',
        'School of Social Work': '#06b6d4',
        'Graduate College': '#10b981',
        'Unknown': '#6b7280',
    };

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-hidden">
            <h3 className="text-gray-400 font-medium mb-4">College Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                        data={chartData}
                        cx="45%"
                        cy="40%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLLEGE_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#fca5a5' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DropsBox({ drops }: { drops?: DashboardStats['drops'] }) {
    const firedDrops = drops?.filter(d => d.reason === 'fired') || [];
    
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h3 className="text-gray-300 font-medium text-sm mb-1">Drops (Fired)</h3>
                    <p className="text-gray-600 text-xs">Consultants removed from program</p>
                </div>

                {/* Count */}
                <div className="bg-gray-800 rounded-lg p-3 border border-red-500/30">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Fired</div>
                    <div className="text-3xl font-bold text-red-400 mt-1">{firedDrops.length}</div>
                </div>

                {/* Drops list */}
                {firedDrops.length > 0 ? (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {firedDrops.map((drop, idx) => (
                            <div key={idx} className="flex items-start justify-between p-2 bg-gray-800 rounded-lg border-l-2 border-red-500">
                                <div className="flex-1">
                                    <div className="text-gray-200 text-sm font-medium">{drop.name}</div>
                                    <div className="text-gray-500 text-xs">
                                        {drop.lastRole} • {drop.lastSemester}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No fired consultants in this period</p>
                )}
            </div>
        </div>
    );
}

export function ResignedBox({ drops }: { drops?: DashboardStats['drops'] }) {
    const resignedDrops = drops?.filter(d => d.reason === 'resigned') || [];
    
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h3 className="text-gray-300 font-medium text-sm mb-1">Resigned</h3>
                    <p className="text-gray-600 text-xs">Consultants who resigned voluntarily</p>
                </div>

                {/* Count */}
                <div className="bg-gray-800 rounded-lg p-3 border border-yellow-500/30">
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Resigned</div>
                    <div className="text-3xl font-bold text-yellow-400 mt-1">{resignedDrops.length}</div>
                </div>

                {/* Resigned list */}
                {resignedDrops.length > 0 ? (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {resignedDrops.map((drop, idx) => (
                            <div key={idx} className="flex items-start justify-between p-2 bg-gray-800 rounded-lg border-l-2 border-yellow-500">
                                <div className="flex-1">
                                    <div className="text-gray-200 text-sm font-medium">{drop.name}</div>
                                    <div className="text-gray-500 text-xs">
                                        {drop.lastRole} • {drop.lastSemester}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No resignations in this period</p>
                )}
            </div>
        </div>
    );
}
