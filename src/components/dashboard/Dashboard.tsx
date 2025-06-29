import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, ArrowLeft } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScheduleList } from './ScheduleList';
import { Schedule, ClassInfo } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { TodaysLessonCard } from './TodaysLessonCard'; // 👈 [추가] 새로 만든 카드 컴포넌트 import

export const Dashboard: React.FC = () => {
  const { 
    schedules, 
    classes,
    isLoading,
    openScheduleModal
  } = useScheduleData();
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  const groupedClasses = useMemo(() => {
    return classes.reduce((acc, currentClass) => {
      const grade = currentClass.grade;
      if (!acc[grade]) acc[grade] = [];
      acc[grade].push(currentClass);
      return acc;
    }, {} as Record<number, ClassInfo[]>);
  }, [classes]);

  const today = new Date();

  const todaySchedules = schedules.filter(schedule => {
    try {
        return isToday(parseISO(schedule.date));
    } catch (error) {
        return false;
    }
  }).sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));

  const getOverallPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime } = currentSchedule;
    const candidates = schedules.filter(s => s.classId === classId && s.progress && s.id !== currentSchedule.id && (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0)));
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
  };

  const getSubjectSpecificPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime, subject } = currentSchedule;
    const candidates = schedules.filter(s => s.classId === classId && s.subject === subject && s.progress && s.id !== currentSchedule.id && (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0)));
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
  };

  const handleViewClassDetail = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
  };

  if (selectedClassId) {
    const selectedClass = classes.find(c=>c.id === selectedClassId);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
            <div>
                <button onClick={handleBackToDashboard} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3">
                <ArrowLeft className="h-4 w-4" />
                <span>대시보드로 돌아가기</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{selectedClass?.name}</h1>
                <p className="text-gray-600">{selectedClass?.grade}학년</p>
            </div>
            <Button onClick={() => openScheduleModal(selectedClassId)} className="flex items-center space-x-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                <span>수업 추가</span>
            </Button>
            </div>
            <ScheduleList classId={selectedClassId} />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">{format(today, 'PPP', { locale: ko })}</p>
        </div>
        <Button onClick={() => openScheduleModal()} className="flex items-center space-x-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          <span>수업 추가</span>
        </Button>
      </div>
      
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
                // 👇 [수정] 복잡한 UI 대신 TodaysLessonCard 컴포넌트를 사용합니다.
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

      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">반별 현황</h2>
        {Object.keys(groupedClasses).length > 0 ? Object.keys(groupedClasses).sort().map(grade => (
            <div key={grade}>
              <h3 className="text-xl font-semibold mb-3">{grade}학년</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedClasses[Number(grade)].map(classInfo => (
                  <ClassCard key={classInfo.id} classInfo={classInfo} onClick={() => handleViewClassDetail(classInfo.id)} />
                ))}
              </div>
            </div>
          )) : (
          <Card><CardContent className="text-center py-12"><p>아직 등록된 반이 없습니다.</p></CardContent></Card>
        )}
      </div>
      
      <ScheduleModal />
      <ProgressInputModal />
    </div>
  );
};