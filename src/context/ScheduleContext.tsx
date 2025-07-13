import React, { createContext, useContext, ReactNode, useMemo, useState, useCallback } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { Schedule, ClassInfo } from '../types';

interface ScheduleContextType {
  schedules: Schedule[];
  classes: ClassInfo[];
  isLoading: boolean;
  addSchedule: (schedule: Omit<Schedule, 'id' | 'teacherId' | 'createdAt' | 'updatedAt' | 'praises' | 'specialNotes'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<boolean>;
  clearProgress: (id: string) => Promise<void>;
  addClass: (classInfo: Omit<ClassInfo, 'id' | 'students'>) => Promise<void>;
  updateClass: (classInfo: ClassInfo) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;

  isScheduleModalOpen: boolean;
  preselectedClassId: string | null;
  openScheduleModal: (classId?: string | null) => void;
  closeScheduleModal: () => void;

  isProgressModalOpen: boolean;
  editingScheduleId: string | null;
  openProgressModal: (scheduleId: string) => void;
  closeProgressModal: () => void;

  viewingScheduleId: string | null;
  // 👇 [추가] LessonDetail에서 돌아갈 반 ID를 관리
  returnToClassId: string | null;
  openLessonDetail: (scheduleId: string) => void;
  closeLessonDetail: () => void;
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

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [preselectedClassId, setPreselectedClassId] = useState<string | null>(null);
  
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  
  const [viewingScheduleId, setViewingScheduleId] = useState<string | null>(null);
  // 👇 [추가] LessonDetail에서 돌아갈 반 ID 상태 추가
  const [returnToClassId, setReturnToClassId] = useState<string | null>(null);

  const openScheduleModal = useCallback((classId: string | null = null) => {
    setPreselectedClassId(classId);
    setIsScheduleModalOpen(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setIsScheduleModalOpen(false);
    setPreselectedClassId(null);
  }, []);

  const openProgressModal = useCallback((scheduleId: string) => {
    setEditingScheduleId(scheduleId);
    setIsProgressModalOpen(true);
  }, []);
  
  const closeProgressModal = useCallback(() => {
      setIsProgressModalOpen(false);
      setEditingScheduleId(null);
  }, []);

  // 👇 [수정] LessonDetail을 열 때 해당 수업의 반 ID를 저장
  const openLessonDetail = useCallback((scheduleId: string) => {
    const schedule = scheduleData.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      setReturnToClassId(schedule.classId);
    }
    setViewingScheduleId(scheduleId);
  }, [scheduleData.schedules]);

  const closeLessonDetail = useCallback(() => {
    setViewingScheduleId(null);
    // returnToClassId는 유지하여 Dashboard에서 해당 반의 ScheduleList로 이동할 수 있도록 함
  }, []);
  
  const value = useMemo(() => ({
    ...scheduleData,
    isScheduleModalOpen,
    preselectedClassId,
    openScheduleModal,
    closeScheduleModal,
    isProgressModalOpen,
    editingScheduleId,
    openProgressModal,
    closeProgressModal,
    viewingScheduleId,
    returnToClassId, // 👈 [추가] returnToClassId 값 제공
    openLessonDetail,
    closeLessonDetail,
  }), [scheduleData, isScheduleModalOpen, preselectedClassId, isProgressModalOpen, editingScheduleId, viewingScheduleId, returnToClassId]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};