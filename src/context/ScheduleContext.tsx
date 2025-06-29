import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { Schedule, ClassInfo } from '../types';

// Context에 담길 데이터와 함수의 타입을 정의합니다.
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
}

// Context를 생성합니다.
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// 다른 컴포넌트에서 쉽게 Context를 사용할 수 있도록 커스텀 훅을 만듭니다.
export const useScheduleData = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleData must be used within a ScheduleProvider');
  }
  return context;
};

// Provider 컴포넌트를 정의합니다.
export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // useSchedules 훅의 모든 기능을 가져옵니다.
  const scheduleData = useSchedules();
  
  // useMemo를 사용하여 scheduleData가 변경될 때만 value 객체가 새로 생성되도록 최적화합니다.
  const value = useMemo(() => ({
    ...scheduleData
  }), [scheduleData]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
