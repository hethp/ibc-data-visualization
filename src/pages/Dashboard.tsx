import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/filters/FilterBar';
import { RoleDistributionChart, GenderChart, ProjectStaffingChart, DemographicChart } from '../components/dashboard/Charts';
import { useDashboardStats, useProjects } from '../hooks/useDashboardData';
import { Users, Briefcase, UserCheck } from 'lucide-react';

export function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const semesterId = searchParams.get('semester') || '';

    // Deduplicate project IDs from URL — use Set to prevent "23,23,23" bugs
    const rawProjects = searchParams.get('projects') || searchParams.get('project') || '';
    const selectedProjects = [...new Set(rawProjects.split(',').filter(Boolean))];

    const { data: stats, isLoading } = useDashboardStats(
        semesterId,
        selectedProjects.length > 0 ? selectedProjects : undefined
    );
    const { data: projects } = useProjects(semesterId);

    // Click handler for chart bars — toggles the clicked project ID in the URL filter
    const handleProjectClick = (projectId: string) => {
        const id = String(projectId);
        // Read latest params directly to avoid stale closure issues
        const freshParams = new URLSearchParams(window.location.search);
        const currentRaw = freshParams.get('projects') || freshParams.get('project') || '';
        const current = new Set(currentRaw.split(',').filter(Boolean));

        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }

        const newParams = new URLSearchParams(freshParams);
        newParams.delete('project'); // clear legacy param
        if (current.size > 0) {
            newParams.set('projects', Array.from(current).join(','));
        } else {
            newParams.delete('projects');
        }
        setSearchParams(newParams);
    };

    // Label showing which projects are filtered (use names when available)
    const filterLabel = selectedProjects.length > 0
        ? `Showing: ${selectedProjects
            .map(id => projects?.find(p => p.id === id)?.name || id)
            .join(', ')}`
        : null;

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
                    {/* Filter indicator */}
                    {filterLabel && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-indigo-400 font-medium">{filterLabel}</span>
                            <button
                                className="text-gray-500 hover:text-white text-xs underline transition-colors"
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.delete('projects');
                                    setSearchParams(newParams);
                                }}
                            >
                                Clear filter
                            </button>
                        </div>
                    )}

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
                        <DemographicChart data={stats.demographicChart} />
                    </div>
                    {/* Staffing per project (full-width, clickable bars) */}
                    <div className="pt-6">
                        <ProjectStaffingChart
                            data={stats.projectStaffing}
                            onBarClick={handleProjectClick}
                            selectedProjects={selectedProjects}
                            projects={projects}
                        />
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
