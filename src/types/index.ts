export type Role = 'PL' | 'Pc' | 'Sr' | 'A' | 'T' | 'Associate' | 'Senior Associate' | 'Principal' | 'Team Lead';

export interface Consultant {
    email: string;
    name: string;
    gender?: 'Male' | 'Female' | 'Other';
    active: boolean;
    currentRole?: Role;
    joinedSemester?: string;
    graduatedSemester?: string;
}

export interface Project {
    id: string;
    name: string;
    client?: string;
    semester: string;
    industry?: string;
    type?: 'Strategy' | 'Operations' | 'Tech' | 'Other';
}

export interface Semester {
    id: string; // e.g., "F24", "S25"
    name: string; // e.g., "Fall 2024"
    startDate: string;
    endDate: string;
    isActive: boolean;
}

export interface ConsultantSemesterStatus {
    consultantEmail: string;
    semesterId: string;
    projectId?: string;
    role: Role;
    isActive: boolean;
}

// Aggregated Stats for Dashboard
export interface DashboardStats {
    totalConsultants: number;
    activeConsultants: number;
    totalProjects: number;
    genderDistribution: Record<string, number>;
    roleDistribution: Record<Role, number>;
    projectStaffing: Record<string, number>; // projectId -> count
}

export interface ProjectStats {
    id: string;
    name: string;
    consultantCount: number;
    roles: Record<Role, number>;
}
