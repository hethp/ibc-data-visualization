import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, X, SearchX, LayoutGrid, List } from 'lucide-react';
import { realApi } from '../services/api';
import type { Consultant, Role } from '../types';
import '../styles/antd-overrides.css';

/* ─── Filter option definitions ─── */
const ROLE_OPTIONS: Role[] = ['NC', 'EC', 'SC', 'PM', 'SM', 'SD'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

const ROLE_COLORS: Record<string, string> = {
    NC: '#E3B4F7', EC: '#AB5DCD', SC: '#8F32B8', PM: '#811CAD', SM: '#7306A2',
};

/* ─── Pill toggle component ─── */
function FilterPill({
    label,
    active,
    onClick,
    color,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
}) {
    return (
        <button
            onClick={onClick}
            className="transition-all duration-200 text-xs font-semibold px-3.5 py-1.5 rounded-full border cursor-pointer select-none"
            style={
                active
                    ? {
                        backgroundColor: color ? `${color}25` : 'rgba(99,102,241,0.2)',
                        borderColor: color || '#6366f1',
                        color: color || '#a5b4fc',
                    }
                    : {
                        backgroundColor: 'transparent',
                        borderColor: '#374151',
                        color: '#9ca3af',
                    }
            }
        >
            {label}
        </button>
    );
}

/* ─── Main page ─── */
export function Consultants() {
    const { data: consultants, isLoading } = useQuery({
        queryKey: ['consultants'],
        queryFn: realApi.getConsultants,
    });

    /* ─ View + filter state ─ */
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [search, setSearch] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [selectedGenders, setSelectedGenders] = useState<Set<string>>(new Set());
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());

    const toggleSet = (set: Set<string>, value: string): Set<string> => {
        const next = new Set(set);
        next.has(value) ? next.delete(value) : next.add(value);
        return next;
    };

    const hasActiveFilters = search || selectedRoles.size || selectedGenders.size || selectedStatuses.size;

    const clearAll = () => {
        setSearch('');
        setSelectedRoles(new Set());
        setSelectedGenders(new Set());
        setSelectedStatuses(new Set());
    };

    /* ─ Derived active status (same logic as before) ─ */
    const isActive = (c: Consultant) => Boolean(c.active) || c.currentRole === 'NC' || c.currentRole === 'SD';

    /* ─ Filtered list ─ */
    const filtered = useMemo(() => {
        if (!consultants) return [];
        const q = search.toLowerCase().trim();

        return consultants.filter(c => {
            // Text search
            if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
            // Role filter
            if (selectedRoles.size > 0 && (!c.currentRole || !selectedRoles.has(c.currentRole))) return false;
            // Gender filter
            if (selectedGenders.size > 0) {
                const g = c.gender || 'Other';
                if (!selectedGenders.has(g)) return false;
            }
            // Status filter
            if (selectedStatuses.size > 0) {
                const status = isActive(c) ? 'Active' : 'Inactive';
                if (!selectedStatuses.has(status)) return false;
            }
            return true;
        });
    }, [consultants, search, selectedRoles, selectedGenders, selectedStatuses]);

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Consultants Directory
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {consultants
                            ? hasActiveFilters
                                ? `Showing ${filtered.length} of ${consultants.length} consultants`
                                : `${consultants.length} consultants`
                            : 'Loading…'}
                    </p>
                </div>
                {/* View toggle */}
                <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-0.5">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'cards'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                            }`}
                        title="Card view"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'table'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-white'
                            }`}
                        title="Table view"
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* ── Search + Filters Control Bar ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                {/* Search input */}
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {/* Role */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Role</span>
                        {ROLE_OPTIONS.map(r => (
                            <FilterPill
                                key={r}
                                label={r}
                                active={selectedRoles.has(r)}
                                onClick={() => setSelectedRoles(toggleSet(selectedRoles, r))}
                                color={ROLE_COLORS[r]}
                            />
                        ))}
                    </div>

                    {/* Gender */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Gender</span>
                        {GENDER_OPTIONS.map(g => (
                            <FilterPill
                                key={g}
                                label={g}
                                active={selectedGenders.has(g)}
                                onClick={() => setSelectedGenders(toggleSet(selectedGenders, g))}
                                color={g === 'Male' ? '#3b82f6' : g === 'Female' ? '#ec4899' : '#f59e0b'}
                            />
                        ))}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Status</span>
                        {STATUS_OPTIONS.map(s => (
                            <FilterPill
                                key={s}
                                label={s}
                                active={selectedStatuses.has(s)}
                                onClick={() => setSelectedStatuses(toggleSet(selectedStatuses, s))}
                                color={s === 'Active' ? '#22c55e' : '#ef4444'}
                            />
                        ))}
                    </div>

                    {/* Clear all */}
                    {hasActiveFilters ? (
                        <button
                            onClick={clearAll}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
                        >
                            <X size={12} /> Clear all
                        </button>
                    ) : null}
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-indigo-400 animate-pulse">
                    Loading consultants…
                </div>
            ) : filtered.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                        <SearchX size={28} className="text-gray-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-400">No consultants found</h2>
                    <p className="text-gray-600 text-sm text-center max-w-sm">
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="mt-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : viewMode === 'cards' ? (
                /* ── Card Grid ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(c => {
                        const active = isActive(c);
                        return (
                            <div
                                key={c.email}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="min-w-0">
                                        <h3 className="text-white font-semibold truncate group-hover:text-indigo-300 transition-colors">
                                            {c.name}
                                        </h3>
                                        <p className="text-gray-500 text-xs truncate mt-0.5">{c.email}</p>
                                    </div>
                                    <span
                                        className={`shrink-0 ml-3 mt-1 w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400 shadow-emerald-400/40 shadow-sm' : 'bg-red-400 shadow-red-400/40 shadow-sm'
                                            }`}
                                        title={active ? 'Active' : 'Inactive'}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {c.currentRole && (
                                        <Tag
                                            style={{
                                                backgroundColor: `${ROLE_COLORS[c.currentRole] || '#6366f1'}20`,
                                                borderColor: ROLE_COLORS[c.currentRole] || '#6366f1',
                                                color: ROLE_COLORS[c.currentRole] || '#a5b4fc',
                                            }}
                                        >
                                            {c.currentRole}
                                        </Tag>
                                    )}
                                    {c.gender && (
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                            {c.gender}
                                        </span>
                                    )}
                                    {c.yearInSchool && (
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                                            {c.yearInSchool}
                                        </span>
                                    )}
                                    {c.major && (
                                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full truncate max-w-[150px]" title={c.major}>
                                            {c.major}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── Original Table View ── */
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <Table
                        columns={tableColumns}
                        dataSource={filtered}
                        rowKey="email"
                        pagination={{ pageSize: 15 }}
                    />
                </div>
            )}
        </div>
    );
}

/* ─── Table column definitions (original layout) ─── */
const tableColumns: ColumnsType<Consultant> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <span className="font-medium text-white">{text}</span>,
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Current Role',
        dataIndex: 'currentRole',
        key: 'currentRole',
        render: (role) => (
            <Tag color={role === 'PL' ? 'purple' : role === 'Sr' ? 'blue' : role === 'NC' ? 'green' : 'default'}>
                {role}
            </Tag>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'active',
        key: 'active',
        render: (active, record) => {
            const role = (record as any).currentRole as string | undefined;
            const isAct = Boolean(active) || role === 'NC' || role === 'SD';
            return (
                <Tag color={isAct ? 'success' : 'error'}>
                    {isAct ? 'Active' : 'Inactive'}
                </Tag>
            );
        },
    },
    {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
    },
];
