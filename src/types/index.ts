export type Role = 'PL' | 'Pc' | 'Sr' | 'A' | 'T' | 'NC' | 'EC' | 'SC' | 'PM' | 'SM' | 'SD' | 'Associate' | 'Senior Associate' | 'Principal' | 'Team Lead';

export interface Consultant {
    email: string;
    name: string;
    gender?: 'Male' | 'Female' | 'Other';
    active: boolean;
    currentRole?: Role;
    yearInSchool?: string; // maps to consultants.year
    major?: string;        // maps to consultants.major
    college?: string;      // maps to consultants.college
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
    demographicChart: Record<string, number>; // yearInSchool -> count
    majorDistribution?: Record<string, number>;  // major -> count
    collegeDistribution?: Record<string, number>;  // college -> count
    drops?: Drop[];  // Data source: consultants table with status='inactive' + separation_reason (future)
    dropsBreakdown?: { fired: number; resigned: number };  // Counts by reason
}

export interface ProjectStats {
    id: string;
    name: string;
    consultantCount: number;
    roles: Record<Role, number>;
}

// ─── Semester Comparison Types ───

export interface SemesterStats {
    semesterId: string;
    totalProjects: number;
    totalConsultants: number;
    genderDistribution: Record<string, number>;
    roleDistribution: Record<string, number>;
    demographicDistribution: Record<string, number>; // yearInSchool → count
}

export interface ChangeMetric {
    value: number;
    percent: number;
}

export interface ComparisonChanges {
    totalConsultants: ChangeMetric;
    totalProjects: ChangeMetric;
    gender: Record<string, ChangeMetric>;
    roles: Record<string, ChangeMetric>;
}

export interface SemesterComparison {
    semesters: SemesterStats[];
    changes: ComparisonChanges | null;
}

// ─── Mock Data Types (⚠️ for testing only) ───

export interface Promotion {
    name: string;
    previousRole: string;
    newRole: string;
    fromSemester: string;
    effectiveSemester: string;
}

export interface Drop {
    name: string;
    lastRole: string;
    lastSemester: string;
    reason: 'fired' | 'resigned'; // Data source: consultants.status or separation_reason (future DB column)
    resignationReason?: string; // e.g., "Better opportunity", "Graduation", "Personal reasons", "Relocation"
}

export interface Deferral {
    name: string;
    role: string;
    deferredFrom: string;
    expectedReturn: string;
}

export interface MockTrendsData {
    _mockData: true;
    comparison: SemesterComparison;
    promotions: Promotion[];
    drops: Drop[];
    deferrals: Deferral[];
}

