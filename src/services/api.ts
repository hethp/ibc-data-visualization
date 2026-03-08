import axios from 'axios';
import type { Semester, Project, DashboardStats, Consultant, SemesterComparison, Promotion, Drop, Deferral } from '../types';

// Create Axios instance with base URL (env variable)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for auth (if needed)
api.interceptors.request.use((config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});

// API Methods matching the Mock API structure
export const realApi = {
    getSemesters: async (): Promise<Semester[]> => {
        const response = await api.get<Semester[]>('/semesters');
        return response.data;
    },

    getProjects: async (semesterId?: string): Promise<Project[]> => {
        const response = await api.get<Project[]>('/projects', { params: { semesterId } });
        return response.data;
    },

    getConsultants: async (): Promise<Consultant[]> => {
        const response = await api.get<Consultant[]>('/consultants');
        return response.data;
    },

    getStats: async (semesterId: string, projectIds?: string[]): Promise<DashboardStats> => {
        const params: Record<string, string> = { semesterId };
        if (projectIds && projectIds.length > 0) {
            params.projects = projectIds.join(',');
        }
        const response = await api.get<DashboardStats>('/stats', { params });
        return response.data;
    },

    getComparisonStats: async (semesterIds: string[]): Promise<SemesterComparison> => {
        const response = await api.get<SemesterComparison>('/stats/compare', {
            params: { semesters: semesterIds.join(',') },
        });
        return response.data;
    },

    // ── Mock Data Methods (⚠️ for testing only) ──

    getMockComparison: async (semesterIds: string[]): Promise<SemesterComparison & { _mockData: boolean }> => {
        const response = await api.get('/mock/stats/compare', {
            params: { semesters: semesterIds.join(',') },
        });
        return response.data;
    },

    getMockPromotions: async (semesterIds: string[]): Promise<{ _mockData: boolean; promotions: Promotion[] }> => {
        const response = await api.get('/mock/promotions', {
            params: { semesters: semesterIds.join(',') },
        });
        return response.data;
    },

    getMockDrops: async (semesterIds: string[]): Promise<{ _mockData: boolean; drops: Drop[] }> => {
        const response = await api.get('/mock/drops', {
            params: { semesters: semesterIds.join(',') },
        });
        return response.data;
    },

    getMockDeferrals: async (semesterIds: string[]): Promise<{ _mockData: boolean; deferrals: Deferral[] }> => {
        const response = await api.get('/mock/deferrals', {
            params: { semesters: semesterIds.join(',') },
        });
        return response.data;
    },
};

export default api;
