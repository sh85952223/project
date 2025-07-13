import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Button } from '../ui/Button';
import { ScheduleModal } from './ScheduleModal';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScheduleList } from './ScheduleList';
import { useDashboardData } from '../../hooks/useDashboardData';
import { TodaysLessons } from './TodaysLessons';
import { ClassStatus } from './ClassStatus';

export const Dashboard: React.FC = () => {
  const { schedules, classes, isLoading, openScheduleModal, viewingScheduleId, returnToClassId, closeLessonDetail } = useScheduleData();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const { 
    todaySchedules, 
    groupedClasses, 
    getOverallPreviousSession, 
    getSubjectSpecificPreviousSession 
  } = useDashboardData(schedules, classes);

  // 👇 [추가] LessonDetail에서 돌아올 때 해당 반의 ScheduleList로 이동
  useEffect(() => {
    if (!viewingScheduleId && returnToClassId) {
      setSelectedClassId(returnToClassId);
      // returnToClassId는 ScheduleContext에서 관리하므로 여기서는 초기화하지 않음
    }
  }, [viewingScheduleId, returnToClassId]);

  const handleViewClassDetail = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
    // 👇 [추가] LessonDetail 상태도 완전히 초기화
    if (viewingScheduleId) {
      closeLessonDetail();
    }
  };

  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
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
          <p className="text-gray-600">{format(new Date(), 'PPP', { locale: ko })}</p>
        </div>
        <Button onClick={() => openScheduleModal()} className="flex items-center space-x-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          <span>수업 추가</span>
        </Button>
      </div>
      
      <TodaysLessons
        isLoading={isLoading}
        todaySchedules={todaySchedules}
        classes={classes}
        getOverallPreviousSession={getOverallPreviousSession}
        getSubjectSpecificPreviousSession={getSubjectSpecificPreviousSession}
      />

      <ClassStatus
        groupedClasses={groupedClasses}
        onClassClick={handleViewClassDetail}
      />
      
      <ScheduleModal />
      <ProgressInputModal />
    </div>
  );
};