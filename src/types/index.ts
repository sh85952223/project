export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  grade: 1 | 2;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  number?: number; // 학생 번호 추가
}

export interface Schedule {
  id: string;
  teacherId: string;
  date: string;
  time: string;
  classId: string;
  subject: string;
  progress?: string;
  absences: Absence[];
  createdAt: string;
  updatedAt: string;
  praises: Praise[];
  specialNotes: SpecialNote[];
}

export interface Absence {
  studentId: string;
  studentName: string;
  studentNumber?: number; // 학생 번호 추가
  reason: string;
}

export interface DashboardStats {
  totalClasses: number;
  completedSessions: number;
  totalAbsences: number;
  progressRate: number;
}

export interface Praise {
  studentId: string;
  studentName: string;
  reason: string;
}

export interface SpecialNote {
  studentId: string;
  studentName: string;
  stars: number;
}