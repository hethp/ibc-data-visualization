import type { Semester, Project, Consultant, DashboardStats } from '../types';

// Mock Data
const semesters: Semester[] = [
    { id: 'S25', name: 'Spring 2025', startDate: '2025-01-20', endDate: '2025-05-10', isActive: true },
    { id: 'F24', name: 'Fall 2024', startDate: '2024-08-25', endDate: '2024-12-15', isActive: false },
    { id: 'S24', name: 'Spring 2024', startDate: '2024-01-15', endDate: '2024-05-05', isActive: false },
];

const projects: Project[] = [
    { id: 'proj_1', name: 'Tech Giant Strategy', semester: 'S25', type: 'Strategy' },
    { id: 'proj_2', name: 'Non-Profit Ops', semester: 'S25', type: 'Operations' },
    { id: 'proj_3', name: 'Fintech Market Entry', semester: 'S25', type: 'Strategy' },
    { id: 'proj_4', name: 'Healthcare Optimization', semester: 'F24', type: 'Operations' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const consultants: Consultant[] = [
    { email: 'alice@ibc.com', name: 'Alice Smith', gender: 'Female', active: true, currentRole: 'PL' },
    { email: 'bob@ibc.com', name: 'Bob Jones', gender: 'Male', active: true, currentRole: 'Sr' },
    { email: 'charlie@ibc.com', name: 'Charlie Day', gender: 'Male', active: true, currentRole: 'A' },
    { email: 'diana@ibc.com', name: 'Diana Prince', gender: 'Female', active: true, currentRole: 'Pc' },
    // more mock data would be generated dynamically if needed
];

export const mockApi = {
    getSemesters: async (): Promise<Semester[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(semesters), 500));
    },

    getProjects: async (semesterId?: string): Promise<Project[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (semesterId) {
                    resolve(projects.filter(p => p.semester === semesterId));
                } else {
                    resolve(projects);
                }
            }, 500);
        });
    },

    getStats: async (semesterId: string): Promise<DashboardStats> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Fake aggregation
                resolve({
                    totalConsultants: 45,
                    activeConsultants: 40,
                    totalProjects: semesterId === 'S25' ? 3 : 1,
                    genderDistribution: { 'Male': 25, 'Female': 20 },
                    roleDistribution: {
                        'PL': 5, 'Pc': 10, 'Sr': 15, 'A': 15, 'T': 0, 'Associate': 0, 'Senior Associate': 0, 'Principal': 0, 'Team Lead': 0
                    },
                    projectStaffing: { 'proj_1': 6, 'proj_2': 5, 'proj_3': 7 }
                });
            }, 800);
        });
    },

    getConsultants: async (): Promise<Consultant[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(consultants), 500));
    }
};
