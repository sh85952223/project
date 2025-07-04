import React, { createContext, useContext, ReactNode, useMemo, useState, useCallback } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { Schedule, ClassInfo } from '../types';

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

  // '수업 추가' 모달 상태
  isScheduleModalOpen: boolean;
  preselectedClassId: string | null;
  openScheduleModal: (classId?: string | null) => void;
  closeScheduleModal: () => void;

  // '진도 입력' 모달 상태
  isProgressModalOpen: boolean;
  editingScheduleId: string | null;
  openProgressModal: (scheduleId: string) => void;
  closeProgressModal: () => void;

  // '수업 상세 기록' 페이지 상태
  viewingScheduleId: string | null;
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

  const openLessonDetail = useCallback((scheduleId: string) => {
    setViewingScheduleId(scheduleId);
  }, []);

  const closeLessonDetail = useCallback(() => {
    setViewingScheduleId(null);
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
    openLessonDetail,
    closeLessonDetail,
  }), [scheduleData, isScheduleModalOpen, preselectedClassId, isProgressModalOpen, editingScheduleId, viewingScheduleId]);

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};