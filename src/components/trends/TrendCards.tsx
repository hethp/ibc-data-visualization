import type { ChangeMetric } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendCardProps {
    title: string;
    latestValue: number;
    change: ChangeMetric;
    icon: React.ElementType;
    accentColor: string; // tailwind color name e.g. "indigo"
}

const ACCENT: Record<string, { card: string; badge: string }> = {
    indigo: {
        card: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
        badge: '',
    },
    emerald: {
        card: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
        badge: '',
    },
    purple: {
        card: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
        badge: '',
    },
    amber: {
        card: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
        badge: '',
    },
};

export function TrendCard({ title, latestValue, change, icon: Icon, accentColor }: TrendCardProps) {
    const isPositive = change.value > 0;
    const isNeutral = change.value === 0;
    const accent = ACCENT[accentColor] || ACCENT.indigo;

    const badgeClasses = isNeutral
        ? 'bg-gray-700/60 text-gray-300'
        : isPositive
            ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
            : 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30';

    const ArrowIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

    return (
        <div
            className={`group relative rounded-xl bg-gradient-to-br ${accent.card} border backdrop-blur-sm p-6 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 overflow-hidden`}
        >
            {/* subtle glow behind badge on hover */}
            <div
                className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-40 ${isPositive ? 'bg-emerald-500' : isNeutral ? 'bg-gray-500' : 'bg-red-500'}`}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Icon size={18} />
                    {title}
                </div>
                {/* Change badge */}
                <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClasses} animate-[fadeIn_0.4s_ease-out]`}
                >
                    <ArrowIcon size={13} />
                    {isNeutral ? '0%' : `${Math.abs(change.percent)}%`}
                </span>
            </div>

            {/* Value */}
            <div className="text-4xl font-bold text-white tracking-tight">{latestValue}</div>

            {/* Subtext */}
            <p className="text-xs text-gray-500">
                {isNeutral
                    ? 'No change from previous semester'
                    : `${Math.abs(change.value)} ${isPositive ? 'more' : 'fewer'} than previous semester`}
            </p>
        </div>
    );
}

/* ── Demographic change mini-cards (gender / role) ── */

interface DemographicChangeCardProps {
    label: string;
    change: ChangeMetric;
    color: string; // hex or tailwind
}

export function DemographicChangeCard({ label, change, color }: DemographicChangeCardProps) {
    const isPositive = change.value > 0;
    const isNeutral = change.value === 0;

    return (
        <div
            className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700/50 hover:border-gray-600 transition-colors"
        >
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-300 font-medium">{label}</span>
            </div>

            <span
                className={`text-sm font-semibold ${isNeutral ? 'text-gray-400' : isPositive ? 'text-emerald-400' : 'text-red-400'}`}
            >
                {isNeutral ? '—' : `${isPositive ? '+' : ''}${change.percent}%`}
            </span>
        </div>
    );
}
