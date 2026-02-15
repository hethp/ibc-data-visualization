import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/filters/FilterBar';
import { RoleDistributionChart, GenderChart, ProjectStaffingChart } from '../components/dashboard/Charts';
import { useDashboardStats } from '../hooks/useDashboardData';
import { Users, Briefcase, UserCheck } from 'lucide-react';

export function Dashboard() {
    const [searchParams] = useSearchParams();
    const semesterId = searchParams.get('semester') || '';

    const { data: stats, isLoading } = useDashboardStats(semesterId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <FilterBar />
            </div>

            {!semesterId ? (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                    Please select a semester to view data
                </div>
            ) : isLoading ? (
                <div className="h-64 flex items-center justify-center text-indigo-400 animate-pulse">
                    Loading metrics...
                </div>
            ) : stats ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KpiCard title="Total Consultants" value={stats.totalConsultants} icon={Users} color="indigo" />
                        <KpiCard title="Active Consultants" value={stats.activeConsultants} icon={UserCheck} color="emerald" />
                        <KpiCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} color="purple" />
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <RoleDistributionChart data={stats.roleDistribution} />
                        <GenderChart data={stats.genderDistribution} />
                        <ProjectStaffingChart data={stats.projectStaffing} />
                    </div>
                </>
            ) : null}
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
    const colorClasses: Record<string, string> = {
        indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
        emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30',
    };

    return (
        <div className={`h-32 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm p-6 flex flex-col justify-between transition-all hover:scale-[1.02]`}>
            <div className={`flex items-center gap-3 font-medium`}>
                <Icon size={20} />
                {title}
            </div>
            <div className="text-4xl font-bold text-white">{value}</div>
        </div>
    );
}
