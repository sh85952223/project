import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { Schedule, ClassInfo } from '../types';

// 1. 모달 상태와 제어 함수 타입을 추가합니다.
interface ScheduleContextType {
  schedules: Schedule[];
  classes: ClassInfo[];
  isLoading: boolean;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  clearProgress: (id: string) => Promise<void>;
  addClass: (classInfo: Omit<ClassInfo, 'id'>) => Promise<void>;
  updateClass: (classInfo: ClassInfo) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;

  // Modal State and Functions
  isScheduleModalOpen: boolean;
  preselectedClassId: string | null;
  openScheduleModal: (classId?: string | null) => void;
  closeScheduleModal: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleData = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleData must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const scheduleData = useSchedules();

  // 2. 모달의 상태를 여기서 중앙 관리합니다.
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [preselectedClassId, setPreselectedClassId] = useState<string | null>(null);

  // 모달을 여는 함수 (특정 반 ID를 받을 수 있음)
  const openScheduleModal = (classId: string | null = null) => {
    setPreselectedClassId(classId);
    setIsScheduleModalOpen(true);
  };

  // 모달을 닫는 함수
  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setPreselectedClassId(null);
  };
  
  // 3. 생성한 상태와 함수들을 context를 통해 공유합니다.
  const value = useMemo(() => ({
    ...scheduleData,
    isScheduleModalOpen,
    preselectedClassId,
    openScheduleModal,
    closeScheduleModal,
  }), [scheduleData, isScheduleModalOpen, preselectedClassId]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
