import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';

export function useSemesters() {
    return useQuery({
        queryKey: ['semesters'],
        queryFn: mockApi.getSemesters,
    });
}

export function useProjects(semesterId?: string) {
    return useQuery({
        queryKey: ['projects', semesterId],
        queryFn: () => mockApi.getProjects(semesterId),
        enabled: !!semesterId, // only run if semesterId is provided
    });
}

export function useDashboardStats(semesterId: string) {
    return useQuery({
        queryKey: ['stats', semesterId],
        queryFn: () => mockApi.getStats(semesterId),
        enabled: !!semesterId,
    });
}
