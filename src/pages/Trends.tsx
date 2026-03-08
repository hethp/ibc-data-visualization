import { useState } from 'react';
import { Select, Switch } from 'antd';
import { Users, Briefcase, TrendingUp } from 'lucide-react';
import {
    useSemesters,
    useSemesterComparison,
    useMockComparison,
    useMockPromotions,
    useMockDrops,
    useMockDeferrals,
} from '../hooks/useDashboardData';
import { TrendCard, DemographicChangeCard } from '../components/trends/TrendCards';
import {
    ConsultantsTrendChart,
    ProjectsTrendChart,
    GenderTrendChart,
    RoleTrendChart,
} from '../components/trends/TrendCharts';
import {
    MockDataBanner,
    PromotionsChart,
    DropsChart,
    DeferralsChart,
    PromotionsTable,
    DropsTable,
    DeferralsTable,
} from '../components/trends/PromotionsDropsCards';

const MOCK_SEMESTERS = [
    { id: 'S24', name: 'Spring 2024 (Mock)' },
    { id: 'F24', name: 'Fall 2024 (Mock)' },
    { id: 'S25', name: 'Spring 2025 (Mock)' },
];

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
    const [mockMode, setMockMode] = useState(false);

    // Real data hook
    const { data: comparison, isLoading: loadingComparison } = useSemesterComparison(
        mockMode ? [] : selectedIds  // disable real query when in mock mode
    );

    // Mock data hooks — pass selected semester IDs so data is filtered
    const { data: mockComparison, isLoading: loadingMock } = useMockComparison(selectedIds, mockMode);
    const { data: mockPromotions } = useMockPromotions(selectedIds, mockMode);
    const { data: mockDrops } = useMockDrops(selectedIds, mockMode);
    const { data: mockDeferrals } = useMockDeferrals(selectedIds, mockMode);

    // Use mock or real data depending on toggle
    const activeComparison = mockMode ? mockComparison : comparison;
    const isLoading = mockMode ? loadingMock : loadingComparison;

    // The dropdown options depend on mock mode
    const dropdownOptions = mockMode ? MOCK_SEMESTERS : (semesters ?? []).map(s => ({ id: s.id, name: s.name }));

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

                <div className="flex items-center gap-6">
                    {/* Mock data toggle */}
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={mockMode}
                            onChange={(checked) => {
                                setMockMode(checked);
                                setSelectedIds([]); // clear selections when switching modes
                            }}
                            className={mockMode ? '!bg-amber-500' : ''}
                        />
                        <span className={`text-xs font-medium uppercase tracking-wider ${mockMode ? 'text-amber-400' : 'text-gray-500'}`}>
                            Mock Data
                        </span>
                    </div>

                    {/* Semester selector — always visible, options change based on mode */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Select Semesters (min 2)
                        </label>
                        <Select
                            mode="multiple"
                            className="w-72"
                            placeholder={mockMode ? 'Pick mock semesters to compare…' : 'Pick semesters to compare…'}
                            loading={!mockMode && loadingSemesters}
                            value={selectedIds}
                            onChange={(values: string[]) => setSelectedIds(values)}
                            popupClassName="bg-gray-800 text-white"
                            maxTagCount={4}
                        >
                            {dropdownOptions.map(sem => (
                                <Select.Option key={sem.id} value={sem.id}>
                                    {sem.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Mock data banner */}
            {mockMode && <MockDataBanner />}

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
            {selectedIds.length >= 2 && isLoading && (
                <div className="h-64 flex items-center justify-center text-indigo-400 animate-pulse">
                    Crunching the numbers…
                </div>
            )}

            {/* Data */}
            {activeComparison && activeComparison.changes && (
                <>
                    {/* ── KPI Change Cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TrendCard
                            title="Total Consultants"
                            latestValue={activeComparison.semesters[activeComparison.semesters.length - 1]?.totalConsultants ?? 0}
                            change={activeComparison.changes.totalConsultants}
                            icon={Users}
                            accentColor="indigo"
                        />
                        <TrendCard
                            title="Total Projects"
                            latestValue={activeComparison.semesters[activeComparison.semesters.length - 1]?.totalProjects ?? 0}
                            change={activeComparison.changes.totalProjects}
                            icon={Briefcase}
                            accentColor="purple"
                        />
                        {/* Average team size = consultants / projects */}
                        {(() => {
                            const latest = activeComparison.semesters[activeComparison.semesters.length - 1];
                            const prev = activeComparison.semesters[activeComparison.semesters.length - 2];
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
                                {Object.entries(activeComparison.changes.gender).map(([g, change]) => (
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
                                {Object.entries(activeComparison.changes.roles).map(([r, change]) => (
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
                        <ConsultantsTrendChart data={activeComparison.semesters} />
                        <ProjectsTrendChart data={activeComparison.semesters} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GenderTrendChart data={activeComparison.semesters} />
                        <RoleTrendChart data={activeComparison.semesters} />
                    </div>

                    {/* ── Promotions, Drops & Deferrals (mock mode only) ── */}
                    {mockMode && (
                        <>
                            {/* Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {mockPromotions?.promotions && (
                                    <PromotionsChart promotions={mockPromotions.promotions} />
                                )}
                                {mockDrops?.drops && (
                                    <DropsChart drops={mockDrops.drops} />
                                )}
                                {mockDeferrals?.deferrals && (
                                    <DeferralsChart deferrals={mockDeferrals.deferrals} />
                                )}
                            </div>
                            {/* Tables */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {mockPromotions?.promotions && (
                                    <PromotionsTable promotions={mockPromotions.promotions} />
                                )}
                                {mockDrops?.drops && (
                                    <DropsTable drops={mockDrops.drops} />
                                )}
                                {mockDeferrals?.deferrals && (
                                    <DeferralsTable deferrals={mockDeferrals.deferrals} />
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
