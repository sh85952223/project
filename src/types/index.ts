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
  // 👇 [수정] 누락되었던 필드를 명확하게 추가합니다.
  praises: Praise[];
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