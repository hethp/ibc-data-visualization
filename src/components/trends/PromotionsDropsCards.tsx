import type { Promotion, Drop, Deferral } from '../../types';
import { ArrowUpRight, UserMinus, PauseCircle, AlertTriangle } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
    Legend, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

const tooltipStyle = {
    contentStyle: { backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: 8, color: '#f3f4f6' },
    labelStyle: { color: '#f3f4f6' },
    itemStyle: { color: '#e5e7eb' },
};

const TRANSITION_COLORS: Record<string, string> = {
    'NC → EC': '#34d399',
    'EC → SC': '#60a5fa',
    'SC → PM': '#a78bfa',
    'PM → SM': '#f472b6',
    'SM → SD': '#fbbf24',
};

const ROLE_COLORS: Record<string, string> = {
    'NC': '#94a3b8',
    'EC': '#60a5fa',
    'SC': '#a78bfa',
    'PM': '#f472b6',
    'SM': '#fb923c',
};

/* ── Mock Data Warning Banner ── */
export function MockDataBanner() {
    return (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl px-5 py-3 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0" />
            <span>
                ⚠️ Displaying <strong>MOCK / FAKE</strong> data for testing purposes only.
                None of the names, numbers, or trends shown below are real.
            </span>
        </div>
    );
}

/* ══════════════════════════════════════
   PROMOTIONS CHART — Bar by transition type
   Shows how many people went through each transition (NC→EC, EC→SC, etc.)
   between the selected semesters.
   ══════════════════════════════════════ */
export function PromotionsChart({ promotions }: { promotions: Promotion[] }) {
    // Count by transition label: "S24 → F24: NC → EC" etc., grouped by transition period
    const periodMap: Record<string, Record<string, number>> = {};
    const allTransitions = new Set<string>();

    promotions.forEach(p => {
        const period = `${p.fromSemester} → ${p.effectiveSemester}`;
        const transition = `${p.previousRole} → ${p.newRole}`;
        allTransitions.add(transition);
        if (!periodMap[period]) periodMap[period] = {};
        periodMap[period][transition] = (periodMap[period][transition] || 0) + 1;
    });

    const periods = Object.keys(periodMap).sort();
    // Fixed order for transitions
    const TRANSITION_ORDER = ['NC → EC', 'EC → SC', 'SC → PM', 'PM → SM', 'SM → SD'];
    const transitions = TRANSITION_ORDER.filter(t => allTransitions.has(t));

    const chartData = periods.map(period => {
        const row: Record<string, string | number> = { period };
        transitions.forEach(t => { row[t] = periodMap[period]?.[t] || 0; });
        return row;
    });

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight size={18} className="text-emerald-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Promotions by Transition <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {chartData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No promotions between selected semesters</p>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                        {transitions.map(t => (
                            <Bar
                                key={t}
                                dataKey={t}
                                fill={TRANSITION_COLORS[t] || '#6b7280'}
                                radius={[4, 4, 0, 0]}
                                barSize={28}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   DEFERRALS CHART — Bar by role
   ══════════════════════════════════════ */
export function DeferralsChart({ deferrals }: { deferrals: Deferral[] }) {
    const roleCounts: Record<string, number> = {};
    deferrals.forEach(d => {
        roleCounts[d.role] = (roleCounts[d.role] || 0) + 1;
    });

    const chartData = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <PauseCircle size={18} className="text-amber-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Deferrals by Role <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {chartData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No deferrals in selected semesters</p>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="role" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey="count" name="Deferrals" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={36}>
                            {chartData.map(entry => (
                                <Cell key={entry.role} fill={ROLE_COLORS[entry.role] || '#fbbf24'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   DROPS CHART — Donut by last role
   ══════════════════════════════════════ */
export function DropsChart({ drops }: { drops: Drop[] }) {
    const roleCounts: Record<string, number> = {};
    drops.forEach(d => {
        roleCounts[d.lastRole] = (roleCounts[d.lastRole] || 0) + 1;
    });

    const chartData = Object.entries(roleCounts)
        .map(([role, count]) => ({ name: role, value: count }))
        .sort((a, b) => b.value - a.value);

    const total = chartData.reduce((s, e) => s + e.value, 0);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <UserMinus size={18} className="text-red-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Drops by Last Role <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {chartData.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No drops in selected semesters</p>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {chartData.map((entry) => (
                                <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || '#6b7280'} />
                            ))}
                        </Pie>
                        <Tooltip
                            {...tooltipStyle}
                            formatter={(value: number | undefined, name: string | undefined) => {
                                const v = value ?? 0;
                                const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                                return [`${v} (${pct}%)`, name ?? ''] as [string, string];
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   PROMOTIONS TABLE
   ══════════════════════════════════════ */
export function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight size={18} className="text-emerald-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Promotions <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {promotions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No promotions between selected semesters</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                <th className="text-left pb-3 pr-4">Name</th>
                                <th className="text-left pb-3 pr-4">From</th>
                                <th className="text-left pb-3 pr-4">To</th>
                                <th className="text-left pb-3">Transition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotions.map((p, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                                >
                                    <td className="py-2.5 pr-4 text-gray-300">{p.name}</td>
                                    <td className="py-2.5 pr-4">
                                        <span className="inline-block bg-red-500/15 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {p.previousRole}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <span className="inline-block bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {p.newRole}
                                        </span>
                                    </td>
                                    <td className="py-2.5 text-gray-500 text-xs">
                                        {p.fromSemester} → {p.effectiveSemester}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   DROPS TABLE — no reason column
   ══════════════════════════════════════ */
export function DropsTable({ drops }: { drops: Drop[] }) {
    const firedDrops = drops?.filter(d => d.reason === 'fired') || [];
    
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <UserMinus size={18} className="text-red-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Drops <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {firedDrops.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No drops in selected semesters</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                <th className="text-left pb-3 pr-4">Name</th>
                                <th className="text-left pb-3 pr-4">Last Role</th>
                                <th className="text-left pb-3">Last Semester</th>
                            </tr>
                        </thead>
                        <tbody>
                            {firedDrops.map((d, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                                >
                                    <td className="py-2.5 pr-4 text-gray-300">{d.name}</td>
                                    <td className="py-2.5 pr-4">
                                        <span className="inline-block bg-gray-700/60 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {d.lastRole}
                                        </span>
                                    </td>
                                    <td className="py-2.5 text-gray-500">{d.lastSemester}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   DEFERRALS TABLE — inactive but not dropped
   ══════════════════════════════════════ */
export function DeferralsTable({ deferrals }: { deferrals: Deferral[] }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <PauseCircle size={18} className="text-amber-400" />
                <h3 className="text-gray-300 font-medium text-sm">
                    Deferrals <span className="text-gray-600 text-xs">(MOCK DATA)</span>
                </h3>
            </div>
            {deferrals.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No deferrals in selected semesters</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                <th className="text-left pb-3 pr-4">Name</th>
                                <th className="text-left pb-3 pr-4">Role</th>
                                <th className="text-left pb-3 pr-4">Deferred From</th>
                                <th className="text-left pb-3">Expected Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deferrals.map((d, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
                                >
                                    <td className="py-2.5 pr-4 text-gray-300">{d.name}</td>
                                    <td className="py-2.5 pr-4">
                                        <span className="inline-block bg-amber-500/15 text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {d.role}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-500">{d.deferredFrom}</td>
                                    <td className="py-2.5 text-gray-500">{d.expectedReturn}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════
   RESIGNED TABLE — Shows consultants who resigned
   Same format as Drops/Deferrals tables
   ══════════════════════════════════════ */
export function ResignedTable({ drops }: { drops: Drop[] }) {
    const resignedDrops = drops?.filter(d => d.reason === 'resigned') || [];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-gray-300 font-medium text-sm mb-4 flex items-center gap-2">
                <UserMinus size={18} className="text-yellow-400" />
                Resigned (MOCK DATA)
            </h3>
            {resignedDrops.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-2.5 pr-4 text-gray-400">Name</th>
                                <th className="py-2.5 pr-4 text-gray-400">Role</th>
                                <th className="py-2.5 pr-4 text-gray-400">Reason</th>
                                <th className="py-2.5 text-gray-400">Resigned From</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {resignedDrops.map((d, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="py-2.5 pr-4 text-gray-200">{d.name}</td>
                                    <td className="py-2.5 pr-4">
                                        <span className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                                            {d.lastRole}
                                        </span>
                                    </td>
                                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{d.resignationReason || '—'}</td>
                                    <td className="py-2.5 text-gray-500">{d.lastSemester}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-4">No resignations in this period</p>
            )}
        </div>
    );
}
