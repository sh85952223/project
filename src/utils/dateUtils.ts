import { parseISO, isBefore, isToday } from 'date-fns';

/**
 * 수업이 완료되었는지 판단하는 함수
 * 진도 내용이 있고, 오늘이거나 과거 날짜인 경우에만 완료로 판단
 */
export const isScheduleCompleted = (schedule: { date: string; progress?: string }): boolean => {
  if (!schedule.progress?.trim()) {
    return false;
  }

  try {
    const scheduleDate = parseISO(schedule.date);
    const today = new Date();
    
    // 오늘이거나 과거 날짜인 경우에만 완료로 판단
    return isToday(scheduleDate) || isBefore(scheduleDate, today);
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return false;
  }
};

/**
 * 완료된 수업의 개수를 계산하는 함수
 */
export const getCompletedSessionsCount = (schedules: Array<{ date: string; progress?: string }>): number => {
  return schedules.filter(schedule => isScheduleCompleted(schedule)).length;
};