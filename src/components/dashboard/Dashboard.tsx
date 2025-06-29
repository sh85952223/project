import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, Calendar, BarChart3, BookOpen, Clock, Edit3, UserX, X, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  // 1. Context에서 모달 제어 함수를 가져옵니다.
  const { 
    schedules, 
    classes,
    isLoading,
    deleteSchedule,
    openScheduleModal // 모달을 여는 함수
  } = useScheduleData();
  
  // 2. ScheduleModal 상태는 Context가 관리하므로 제거합니다.
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const today = new Date();
  const todaySchedules = schedules.filter(
    schedule => schedule.date === format(today, 'yyyy-MM-dd')
  );
  
  const handleProgressInput = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setIsProgressModalOpen(true);
  };

  const handleViewClassDetail = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
  };
  
  const getPreviousClassSession = (classId: string, currentDate: string) => {
    return schedules
      .filter(s => s.classId === classId && s.progress && s.date < currentDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  };

  // 개별 반 상세 페이지
  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    
    if (!selectedClass) {
      return (
        <div className="text-center py-12">
          <Button onClick={handleBackToDashboard}>대시보드로 돌아가기</Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={handleBackToDashboard} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3">
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로 돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
            <p className="text-gray-600">{selectedClass.grade}학년</p>
          </div>
          {/* 3. 상세 페이지의 '수업 추가' 버튼도 Context 함수를 사용합니다. */}
          <Button onClick={() => openScheduleModal(selectedClassId)} className="flex items-center space-x-2" disabled={isLoading}>
            <Plus className="h-4 w-4" />
            <span>수업 추가</span>
          </Button>
        </div>
        <ScheduleList classId={selectedClassId} />
      </div>
    );
  }

  // 메인 대시보드
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">{format(today, 'PPP', { locale: ko })}</p>
        </div>
        {/* 4. 메인 '수업 추가' 버튼도 Context 함수를 사용합니다. */}
        <Button onClick={() => openScheduleModal()} className="flex items-center space-x-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          <span>수업 추가</span>
        </Button>
      </div>
      
      {/* 오늘의 수업 목록 (생략) */}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">반별 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classInfo => (
            <ClassCard
              key={classInfo.id}
              classInfo={classInfo}
              onClick={() => handleViewClassDetail(classInfo.id)}
            />
          ))}
        </div>
      </div>
      
      {/* 5. 모달 컴포넌트는 props 없이 호출합니다. 상태는 Context가 알아서 관리합니다. */}
      <ScheduleModal />
      {selectedScheduleId && (
        <ProgressInputModal
          isOpen={isProgressModalOpen}
          onClose={() => setSelectedScheduleId(null)}
          scheduleId={selectedScheduleId}
        />
      )}
    </div>
  );
};
