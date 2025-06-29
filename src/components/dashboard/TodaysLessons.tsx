import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { TodaysLessonCard } from './TodaysLessonCard'; // 👈 TodaysLessonCard를 import
import { Schedule, ClassInfo } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TodaysLessonsProps {
  isLoading: boolean;
  todaySchedules: Schedule[];
  classes: ClassInfo[];
  getOverallPreviousSession: (schedule: Schedule) => Schedule | null;
  getSubjectSpecificPreviousSession: (schedule: Schedule) => Schedule | null;
}

// 👇 [수정] 컴포넌트 이름을 TodaysLessons로 명확히 합니다.
export const TodaysLessons: React.FC<TodaysLessonsProps> = ({
  isLoading,
  todaySchedules,
  classes,
  getOverallPreviousSession,
  getSubjectSpecificPreviousSession,
}) => {
  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 수업</h2>
      {isLoading ? (
        <p>수업을 불러오는 중...</p>
      ) : todaySchedules.length > 0 ? (
        <div className="space-y-4">
          {todaySchedules.map(schedule => {
            const classInfo = classes.find(c => c.id === schedule.classId);
            const gradeColors: { [key: number]: string } = { 1: grade1Color, 2: grade2Color, 3: grade3Color };
            
            return (
              <TodaysLessonCard
                key={schedule.id}
                schedule={schedule}
                classInfo={classInfo}
                backgroundColor={gradeColors[classInfo?.grade || 0] || 'white'}
                overallPreviousSession={getOverallPreviousSession(schedule)}
                subjectPreviousSession={getSubjectSpecificPreviousSession(schedule)}
              />
            );
          })}
        </div>
      ) : (
        <Card><CardContent className="text-center py-12"><p>오늘 등록된 수업이 없습니다.</p></CardContent></Card>
      )}
    </div>
  );
};