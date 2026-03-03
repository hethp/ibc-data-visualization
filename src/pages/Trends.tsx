import { useState } from 'react';
import { Select } from 'antd';
import { Users, Briefcase, TrendingUp } from 'lucide-react';
import { useSemesters, useSemesterComparison } from '../hooks/useDashboardData';
import { TrendCard, DemographicChangeCard } from '../components/trends/TrendCards';
import {
    ConsultantsTrendChart,
    ProjectsTrendChart,
    GenderTrendChart,
    RoleTrendChart,
} from '../components/trends/TrendCharts';

const GENDER_COLORS: Record<string, string> = {
    Male: '#3b82f6',
    Female: '#ec4899',
    Other: '#f59e0b',
    Unknown: '#6b7280',
};

const ROLE_COLORS: Record<string, string> = {
    NC: '#E3B4F7',
    EC: '#AB5DCD',
    SC: '#8F32B8',
    PM: '#811CAD',
    SM: '#7306A2',
};

export function Trends() {
    const { data: semesters, isLoading: loadingSemesters } = useSemesters();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: comparison, isLoading: loadingComparison } = useSemesterComparison(selectedIds);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Semester Trends
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Compare key metrics across semesters
                    </p>
                </div>

                {/* Multi-semester selector */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Select Semesters (min 2)
                    </label>
                    <Select
                        mode="multiple"
                        className="w-72"
                        placeholder="Pick semesters to compare…"
                        loading={loadingSemesters}
                        value={selectedIds}
                        onChange={(values: string[]) => setSelectedIds(values)}
                        popupClassName="bg-gray-800 text-white"
                        maxTagCount={4}
                    >
                        {semesters?.map(sem => (
                            <Select.Option key={sem.id} value={sem.id}>
                                {sem.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* State: not enough semesters */}
            {selectedIds.length < 2 && (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                    <div className="text-center space-y-2">
                        <TrendingUp size={32} className="mx-auto opacity-40" />
                        <p>Select at least 2 semesters to see trends</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {selectedIds.length >= 2 && loadingComparison && (
                <div className="h-64 flex items-center justify-center text-indigo-400 animate-pulse">
                    Crunching the numbers…
                </div>
            )}

            {/* Data */}
            {comparison && comparison.changes && (
                <>
                    {/* ── KPI Change Cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TrendCard
                            title="Total Consultants"
                            latestValue={comparison.semesters[comparison.semesters.length - 1]?.totalConsultants ?? 0}
                            change={comparison.changes.totalConsultants}
                            icon={Users}
                            accentColor="indigo"
                        />
                        <TrendCard
                            title="Total Projects"
                            latestValue={comparison.semesters[comparison.semesters.length - 1]?.totalProjects ?? 0}
                            change={comparison.changes.totalProjects}
                            icon={Briefcase}
                            accentColor="purple"
                        />
                        {/* Average team size = consultants / projects */}
                        {(() => {
                            const latest = comparison.semesters[comparison.semesters.length - 1];
                            const prev = comparison.semesters[comparison.semesters.length - 2];
                            const currAvg = latest && latest.totalProjects > 0
                                ? Math.round(latest.totalConsultants / latest.totalProjects)
                                : 0;
                            const prevAvg = prev && prev.totalProjects > 0
                                ? Math.round(prev.totalConsultants / prev.totalProjects)
                                : 0;
                            const pct = prevAvg === 0 ? 0 : parseFloat((((currAvg - prevAvg) / prevAvg) * 100).toFixed(1));
                            return (
                                <TrendCard
                                    title="Avg Team Size"
                                    latestValue={currAvg}
                                    change={{ value: currAvg - prevAvg, percent: pct }}
                                    icon={Users}
                                    accentColor="emerald"
                                />
                            );
                        })()}
                    </div>

                    {/* ── Demographic Changes ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gender changes */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h3 className="text-gray-400 font-medium mb-3 text-sm">Gender Changes (latest vs previous)</h3>
                            <div className="space-y-2">
                                {Object.entries(comparison.changes.gender).map(([g, change]) => (
                                    <DemographicChangeCard
                                        key={g}
                                        label={g}
                                        change={change}
                                        color={GENDER_COLORS[g] || '#6b7280'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Role changes */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h3 className="text-gray-400 font-medium mb-3 text-sm">Role Changes (latest vs previous)</h3>
                            <div className="space-y-2">
                                {Object.entries(comparison.changes.roles).map(([r, change]) => (
                                    <DemographicChangeCard
                                        key={r}
                                        label={r}
                                        change={change}
                                        color={ROLE_COLORS[r] || '#6b7280'}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Trend Charts ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ConsultantsTrendChart data={comparison.semesters} />
                        <ProjectsTrendChart data={comparison.semesters} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GenderTrendChart data={comparison.semesters} />
                        <RoleTrendChart data={comparison.semesters} />
                    </div>
                </>
            )}
        </div>
    );
}
