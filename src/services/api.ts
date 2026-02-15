import axios from 'axios';
import type { Semester, Project, DashboardStats, Consultant } from '../types';

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

    getStats: async (semesterId: string): Promise<DashboardStats> => {
        const response = await api.get<DashboardStats>('/stats', { params: { semesterId } });
        return response.data;
    },
};

export default api;
