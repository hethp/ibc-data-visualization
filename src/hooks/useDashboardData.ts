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
    });
}

export function useDashboardStats(semesterId: string) {
    return useQuery({
        queryKey: ['stats', semesterId],
        queryFn: () => realApi.getStats(semesterId),
        enabled: !!semesterId,
    });
}
