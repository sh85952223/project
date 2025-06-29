import { useMemo } from 'react';
import { Schedule } from '../types';
import { parseISO, isSameMonth, isSameWeek, isToday, getMonth } from 'date-fns';

export type Period = 'today' | 'week' | 'month' | 'semester1' | 'semester2' | 'total';

export const useStudentStats = (schedules: Schedule[]) => {

  const getStats = useMemo(() => {
    return (studentId: string, statType: 'absences' | 'stars' | 'notes', period: Period, selectedSubjects: string[]) => {
      const today = new Date();
      
      const dateFilter = (dateStr: string): boolean => {
          try {
              const date = parseISO(dateStr);
              switch(period) {
                  case 'today': return isToday(date);
                  case 'week': return isSameWeek(date, today, { weekStartsOn: 1 });
                  case 'month': return isSameMonth(date, today);
                  case 'semester1': return getMonth(date) >= 2 && getMonth(date) <= 7;
                  case 'semester2': return getMonth(date) >= 8 || getMonth(date) <= 1;
                  case 'total': return true;
                  default: return false;
              }
          } catch (e) {
              return false;
          }
      };

      return schedules.reduce((acc, schedule) => {
          // 👇 [수정] 선택된 과목이 있을 때만 일치하는지 확인하도록 로직을 변경합니다.
          const subjectMatch = selectedSubjects.includes(schedule.subject);
          
          if (!schedule.date || !dateFilter(schedule.date) || !subjectMatch) return acc;

          switch(statType) {
              case 'absences':
                  return acc + (schedule.absences?.some(a => a.studentId === studentId) ? 1 : 0);
              case 'stars':
                  return acc + (schedule.praises?.find(p => p.studentId === studentId)?.stars || 0);
              case 'notes':
                  return acc + (schedule.specialNotes?.some(n => n.studentId === studentId && n.note?.trim()) ? 1 : 0);
              default: return acc;
          }
      }, 0);
    };
  }, [schedules]);

  return { getStats };
};