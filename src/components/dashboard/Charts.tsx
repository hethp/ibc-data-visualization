import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import type { DashboardStats } from '../../types';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const GENDER_COLORS = { 'Male': '#3b82f6', 'Female': '#ec4899', 'Other': '#10b981' };

export function RoleDistributionChart({ data }: { data: DashboardStats['roleDistribution'] }) {
    const chartData = Object.entries(data).map(([role, count]) => ({ role, count }));

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
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ProjectStaffingChart({ data }: { data: DashboardStats['projectStaffing'] }) {
    const chartData = Object.entries(data).map(([projId, count]) => ({ projId, count }));

    return (
        <div className="h-80 w-full bg-gray-900 border border-gray-800 rounded-xl p-4 col-span-1 md:col-span-2">
            <h3 className="text-gray-400 font-medium mb-4">Staffing per Project</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="projId" type="category" stroke="#6b7280" fontSize={12} width={100} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
