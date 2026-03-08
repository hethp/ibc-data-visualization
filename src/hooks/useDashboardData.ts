import { useQuery } from '@tanstack/react-query';
import { realApi } from '../services/api';

export function useSemesters() {
    return useQuery({
        queryKey: ['semesters'],
        queryFn: realApi.getSemesters,
    });
}

export function useProjects(semesterId?: string) {
    return useQuery({
        queryKey: ['projects', semesterId],
        queryFn: () => realApi.getProjects(semesterId),
        enabled: !!semesterId, // only run if semesterId is provided
        select: (projects) => projects.map((project) => ({
            ...project,
            id: String(project.id),
        })),
    });
}

export function useDashboardStats(semesterId: string, projectIds?: string[]) {
    return useQuery({
        queryKey: ['stats', semesterId, projectIds ? projectIds.join(',') : undefined],
        queryFn: () => realApi.getStats(semesterId, projectIds),
        enabled: !!semesterId,
    });
}

export function useSemesterComparison(semesterIds: string[]) {
    return useQuery({
        queryKey: ['stats-compare', ...semesterIds],
        queryFn: () => realApi.getComparisonStats(semesterIds),
        enabled: semesterIds.length >= 2,
    });
}

// ── Mock Data Hooks (⚠️ for testing only) ──

export function useMockComparison(semesterIds: string[], enabled: boolean) {
    return useQuery({
        queryKey: ['mock-stats-compare', ...semesterIds],
        queryFn: () => realApi.getMockComparison(semesterIds),
        enabled: enabled && semesterIds.length >= 2,
    });
}

export function useMockPromotions(semesterIds: string[], enabled: boolean) {
    return useQuery({
        queryKey: ['mock-promotions', ...semesterIds],
        queryFn: () => realApi.getMockPromotions(semesterIds),
        enabled: enabled && semesterIds.length >= 2,
    });
}

export function useMockDrops(semesterIds: string[], enabled: boolean) {
    return useQuery({
        queryKey: ['mock-drops', ...semesterIds],
        queryFn: () => realApi.getMockDrops(semesterIds),
        enabled: enabled && semesterIds.length >= 2,
    });
}

export function useMockDeferrals(semesterIds: string[], enabled: boolean) {
    return useQuery({
        queryKey: ['mock-deferrals', ...semesterIds],
        queryFn: () => realApi.getMockDeferrals(semesterIds),
        enabled: enabled && semesterIds.length >= 2,
    });
}
