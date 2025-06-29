import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext'; // 1. 새로 만든 훅을 가져옵니다.
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleList } from './ScheduleList';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, Calendar, BarChart3, BookOpen, Clock, Edit3, UserX, X, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  // 2. props로 데이터를 받아오는 대신, useScheduleData 훅으로 직접 데이터를 가져옵니다.
  const { 
    schedules, 
    classes,
    isLoading,
    deleteSchedule,
    clearProgress
  } = useScheduleData();
  
  // 모달 상태 관리는 Dashboard에서 계속 담당합니다. (이 부분은 다음 리팩토링에서 개선합니다.)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const today = new Date();
  const todaySchedules = schedules.filter(
    schedule => schedule.date === format(today, 'yyyy-MM-dd')
  );

  const getClassStats = (classId: string) => {
    const classSchedules = schedules.filter(s => s.classId === classId);
    const completedSessions = classSchedules.filter(s => s.progress).length;
    const totalAbsences = classSchedules.reduce((acc, s) => acc + (s.absences?.length || 0), 0);
    
    return {
      totalSessions: classSchedules.length,
      completedSessions,
      totalAbsences,
      progressRate: classSchedules.length > 0 ? (completedSessions / classSchedules.length) * 100 : 0,
    };
  };
  
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

  // 개별 반 페이지 렌더링
  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    
    if (!selectedClass) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">반을 찾을 수 없습니다</h2>
          <Button onClick={handleBackToDashboard}>대시보드로 돌아가기</Button>
        </div>
      );
    }
    
    // 3. ScheduleList에 더 이상 props를 내려주지 않습니다.
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={handleBackToDashboard} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3">
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로 돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
            <p className="text-gray-600">{selectedClass.grade}학년 수업 현황 • 총 {schedules.filter(s => s.classId === selectedClassId).length}개 수업</p>
          </div>
          <Button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center space-x-2" disabled={isLoading}>
            <Plus className="h-4 w-4" />
            <span>수업 추가</span>
          </Button>
        </div>
        <ScheduleList classId={selectedClassId} />
      </div>
    );
  }

  // 메인 대시보드 렌더링
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">
            {format(today, 'PPP', { locale: ko })} • 오늘 수업 {todaySchedules.length}개
          </p>
        </div>
        <Button onClick={() => setIsScheduleModalOpen(true)} className="flex items-center space-x-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          <span>수업 추가</span>
        </Button>
      </div>

      {todaySchedules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">오늘의 수업</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedules.map(schedule => {
                const classInfo = classes.find(c => c.id === schedule.classId);
                const previousSession = getPreviousClassSession(schedule.classId, schedule.date);
                
                return (
                  <div key={schedule.id} className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">{schedule.time}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="font-medium text-gray-900">{classInfo?.name}</span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-700">{schedule.subject}</span>
                        </div>
                         {schedule.progress ? (
                          <div className="flex items-start space-x-2">
                            <BookOpen className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-700">{schedule.progress}</p>
                              {schedule.absences.length > 0 && (
                                <div className="mt-2 text-xs text-red-600">
                                  <UserX className="inline h-3 w-3 mr-1" />
                                  결석: {schedule.absences.map(a => a.studentName).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">진도 입력 대기 중</p>
                        )}
                      </div>
                       <div className="flex items-center space-x-2">
                        {schedule.progress ? (
                          <Button size="sm" variant="ghost" onClick={() => handleProgressInput(schedule.id)} disabled={isLoading} className="flex items-center space-x-1">
                            <Edit3 className="h-3 w-3" /> <span>수정</span>
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleProgressInput(schedule.id)} disabled={isLoading} className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" /> <span>진도 입력</span>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteSchedule(schedule.id)} className="text-red-600 hover:text-red-800" disabled={isLoading}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                     {previousSession && (
                      <div className="border-t border-blue-200 bg-blue-25 px-4 py-2">
                        <p className="text-xs text-blue-700">
                          <span className="font-medium">지난 시간 ({format(parseISO(previousSession.date), 'M/d')})</span>: {previousSession.progress}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">반별 현황</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 4. ClassCard에 더 이상 stats prop을 내려주지 않습니다. */}
          {classes.map(classInfo => (
            <ClassCard
              key={classInfo.id}
              classInfo={classInfo}
              onClick={() => handleViewClassDetail(classInfo.id)}
            />
          ))}
        </div>
      </div>

      {/* 5. 모달 컴포넌트에도 더 이상 props를 내려주지 않습니다. */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        preselectedClassId={selectedClassId}
      />
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
