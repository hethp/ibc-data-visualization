import type { Semester, Project, Consultant, DashboardStats } from '../types';

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
    { email: 'newconsultant@ibc.com', name: 'New Consultant', gender: 'Other', active: true, currentRole: 'NC' },
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

    getStats: async (semesterId: string, projectIds?: string[]): Promise<DashboardStats> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Fake aggregation
                const baseStaffing = { 'proj_1': 6, 'proj_2': 5, 'proj_3': 7 };
                let projectStaffing: Record<string, number> = baseStaffing;
                let totalConsultants = 45;
                let totalProjects = semesterId === 'S25' ? 3 : 1;

                if (projectIds && projectIds.length) {
                    projectStaffing = projectIds.reduce((acc, id) => {
                        acc[id] = baseStaffing[id as keyof typeof baseStaffing] || 0;
                        return acc;
                    }, {} as Record<string, number>);
                    totalConsultants = Object.values(projectStaffing).reduce((a, b) => a + b, 0);
                    totalProjects = projectIds.length;
                }

                resolve({
                    totalConsultants,
                    activeConsultants: totalConsultants,
                    totalProjects,
                    genderDistribution: projectIds && projectIds.length ? { 'Male': 3, 'Female': 2 } : { 'Male': 25, 'Female': 20 },
                    roleDistribution: projectIds && projectIds.length
                        ? { 'PL': 1, 'Pc': 1, 'Sr': 1, 'A': 1, 'T': 0, 'NC': 0, 'EC': 0, 'SC': 0, 'PM': 0, 'SM': 0, 'SD': 0, 'Associate': 0, 'Senior Associate': 0, 'Principal': 0, 'Team Lead': 0 }
                        : {
                              'PL': 5,
                              'Pc': 10,
                              'Sr': 15,
                              'A': 15,
                              'T': 0,
                              'NC': 2,
                              'EC': 1,
                              'SC': 0,
                              'PM': 0,
                              'SM': 0,
                              'SD': 0,
                              'Associate': 0,
                              'Senior Associate': 0,
                              'Principal': 0,
                              'Team Lead': 0,
                          },
                    projectStaffing,
                    demographicChart: { 'Freshman': 8, 'Sophomore': 12, 'Junior': 10, 'Senior': 7, 'Master\'s': 4 },
                    majorDistribution: {
                        'Computer Science': 18,
                        'Engineering': 12,
                        'Business': 10,
                        'Economics': 3,
                        'Other': 2,
                    },
                    collegeDistribution: {
                        'Grainger Engineering': 12,
                        'Gies Business': 10,
                        'Liberal Arts & Sciences': 10,
                        'Engineering': 8,
                        'Agriculture & Consumer': 2,
                        'Applied Health Sciences': 1,
                        'Education': 1,
                        'Fine & Applied Arts': 0,
                        'Graduate College': 1,
                        'Law': 0,
                        'Unknown': 0,
                    },
                    // Mock drops data — Data source (future): consultants table with separation_reason column
                    drops: [
                        { name: 'John Smith', lastRole: 'PL', lastSemester: 'S25', reason: 'resigned', resignationReason: 'Better opportunity' },
                        { name: 'Jane Doe', lastRole: 'Sr', lastSemester: 'S25', reason: 'fired', resignationReason: undefined },
                        { name: 'Bob Brown', lastRole: 'A', lastSemester: 'F24', reason: 'resigned', resignationReason: 'Personal reasons' },
                        { name: 'Sarah Wilson', lastRole: 'Pc', lastSemester: 'F24', reason: 'resigned', resignationReason: 'Relocation' },
                    ],
                    dropsBreakdown: { fired: 1, resigned: 3 }
                });
            }, 800);
        });
    },

    getConsultants: async (): Promise<Consultant[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(consultants), 500));
    }
};
