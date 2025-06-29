import { useMemo } from 'react';
import { Schedule, ClassInfo } from '../types';
import { isToday, parseISO } from 'date-fns';

// useDashboardData 훅의 반환 타입을 명시적으로 정의
interface DashboardData {
  todaySchedules: Schedule[];
  groupedClasses: Record<number, ClassInfo[]>;
  getOverallPreviousSession: (currentSchedule: Schedule) => Schedule | null;
  getSubjectSpecificPreviousSession: (currentSchedule: Schedule) => Schedule | null;
}

export const useDashboardData = (schedules: Schedule[], classes: ClassInfo[]): DashboardData => {

  const todaySchedules = useMemo(() => {
    return schedules
      .filter(schedule => {
        try {
          return isToday(parseISO(schedule.date));
        } catch (error) {
          return false;
        }
      })
      .sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
  }, [schedules]);

  const groupedClasses = useMemo(() => {
    return classes.reduce((acc, currentClass) => {
      const grade = currentClass.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(currentClass);
      return acc;
    }, {} as Record<number, ClassInfo[]>);
  }, [classes]);

  const getOverallPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime } = currentSchedule;
    const candidates = schedules.filter(s => 
      s.classId === classId && s.progress && s.id !== currentSchedule.id &&
      (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0))
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
  };

  const getSubjectSpecificPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime, subject } = currentSchedule;
    const candidates = schedules.filter(s =>
      s.classId === classId &&
      s.subject === subject &&
      s.progress &&
      s.id !== currentSchedule.id &&
      (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0))
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
  };

  return { 
    todaySchedules, 
    groupedClasses, 
    getOverallPreviousSession, 
    getSubjectSpecificPreviousSession 
  };
};