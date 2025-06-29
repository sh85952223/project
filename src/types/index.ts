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
  number?: number;
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
  praises: Praise[]; // 👈 이 부분이 Praise 타입을 사용합니다.
  specialNotes: SpecialNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Absence {
  studentId: string;
  studentName: string;
  studentNumber?: number;
  reason: string;
}

// 👇 [수정] Praise 타입을 별(stars)만 사용하도록 변경합니다.
export interface Praise {
  studentId: string;
  studentName: string;
  stars: number;
}

export interface SpecialNote {
  studentId: string;
  studentName: string;
  note: string;
}

export interface DashboardStats {
  totalClasses: number;
  completedSessions: number;
  totalAbsences: number;
  progressRate: number;
}