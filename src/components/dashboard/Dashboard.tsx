import React, { useState, useEffect } from 'react';
import { useSchedules } from '../../hooks/useSchedules';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleList } from './ScheduleList';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, Calendar, BarChart3, BookOpen, Clock, Edit3, UserX, Trash2, Eraser, X, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  // 1. 수정: 더 이상 사용하지 않는 변수들을 제거했습니다. (lastUpdateTime, recoverData 등)
  const { 
    schedules, 
    classes, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule, 
    clearProgress, 
    isLoading
  } = useSchedules();
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [preselectedClassId, setPreselectedClassId] = useState<string | null>(null);

  // 2. 수정: 실시간 데이터가 아니었던 localSchedules와 관련 로직을 모두 제거했습니다.
  // 이제 useSchedules에서 받아오는 'schedules'가 항상 최신 데이터입니다.

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

  const handleProgressSubmit = async (progress: string, absences: any[]) => {
    if (selectedScheduleId) {
      await updateSchedule(selectedScheduleId, { progress, absences });
      setIsProgressModalOpen(false);
      setSelectedScheduleId(null);
    }
  };

  // 3. 수정: 모든 데이터 처리 함수에서 try-catch를 제거하고,
  // useSchedules 훅의 함수를 직접 호출하도록 단순화했습니다.
  const handleAddSchedule = (schedule: any) => {
    addSchedule(schedule);
    setIsScheduleModalOpen(false);
    setPreselectedClassId(null);
  };
  
  const handleAddScheduleForClass = (classId: string) => {
    setPreselectedClassId(classId);
    setIsScheduleModalOpen(true);
  };

  const handleViewClassDetail = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleBackToDashboard = () => {
    setSelectedClassId(null);
    setPreselectedClassId(null);
  };
  
  const getPreviousClassSession = (classId: string, currentDate: string) => {
    const classSchedules = schedules
      .filter(s => s.classId === classId && s.progress && s.date !== currentDate)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
    
    return classSchedules[0] || null;
  };

  // 개별 반 페이지 렌더링
  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const classSchedules = schedules.filter(s => s.classId === selectedClassId);
    
    if (!selectedClass) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">반을 찾을 수 없습니다</h2>
            <Button onClick={handleBackToDashboard}>
              대시보드로 돌아가기
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>대시보드로 돌아가기</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
            <p className="text-gray-600">{selectedClass.grade}학년 수업 현황 • 총 {classSchedules.length}개 수업</p>
          </div>
          <Button
            onClick={() => handleAddScheduleForClass(selectedClassId)}
            className="flex items-center space-x-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>수업 추가</span>
          </Button>
        </div>

        <ScheduleList 
          schedules={classSchedules}
          classInfo={selectedClass}
        />

        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setPreselectedClassId(null);
          }}
          onSubmit={handleAddSchedule}
          classes={classes}
          preselectedClassId={preselectedClassId}
        />

        {selectedScheduleId && (
          <ProgressInputModal
            isOpen={isProgressModalOpen}
            onClose={() => {
              setIsProgressModalOpen(false);
              setSelectedScheduleId(null);
            }}
            onSubmit={handleProgressSubmit}
            schedule={schedules.find(s => s.id === selectedScheduleId)!}
            classInfo={selectedClass}
          />
        )}
      </div>
    );
  }

  // 메인 대시보드 렌더링
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">
            {format(today, 'PPP', { locale: ko })} • 오늘 수업 {todaySchedules.length}개
          </p>
        </div>
        {/* 4. 수정: 불필요해진 데이터 복구, 새로고침 버튼 등을 모두 제거 */}
        <Button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center space-x-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span>수업 추가</span>
        </Button>
      </div>

      {/* Today's Schedule */}
      {todaySchedules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">오늘의 수업</h2>
              <span className="text-xs text-gray-500">
                (총 {schedules.length}개 수업 중 {todaySchedules.length}개)
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedules.map(schedule => {
                const classInfo = classes.find(c => c.id === schedule.classId);
                const previousSession = getPreviousClassSession(schedule.classId, schedule.date);
                
                return (
                  <div
                    key={schedule.id}
                    className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
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
                            <BookOpen className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-800">오늘 진도</p>
                              <p className="text-sm text-gray-700 mt-1">{schedule.progress}</p>
                              {schedule.absences.length > 0 && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <UserX className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">
                                    결석: {schedule.absences.map(a => a.studentName).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-500">진도 입력 대기 중</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {schedule.progress ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleProgressInput(schedule.id)} disabled={isLoading}>
                              <Edit3 className="h-3 w-3" /> <span>수정</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => clearProgress(schedule.id)} className="text-orange-600 hover:text-orange-800 hover:bg-orange-50" disabled={isLoading}>
                              <Eraser className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => handleProgressInput(schedule.id)} disabled={isLoading}>
                            <BookOpen className="h-3 w-3" /> <span>진도 입력</span>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteSchedule(schedule.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50" disabled={isLoading}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {previousSession && (
                      <div className="border-t border-blue-200 bg-blue-25 px-4 py-3">
                        <p className="text-sm text-blue-800 mb-1">
                          <span className="font-medium">지난 시간 진도</span>
                          <span className="text-xs text-blue-600 ml-2">({format(parseISO(previousSession.date), 'M/d')})</span>
                          : {previousSession.progress}
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

      {/* Class Overview */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">반별 현황</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classInfo => (
            <ClassCard
              key={classInfo.id}
              classInfo={classInfo}
              stats={getClassStats(classInfo.id)}
              onClick={() => handleViewClassDetail(classInfo.id)}
              onAddSchedule={handleAddScheduleForClass}
            />
          ))}
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setPreselectedClassId(null);
        }}
        onSubmit={handleAddSchedule}
        classes={classes}
        preselectedClassId={preselectedClassId}
      />

      {selectedScheduleId && (
        <ProgressInputModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedScheduleId(null);
          }}
          onSubmit={handleProgressSubmit}
          schedule={schedules.find(s => s.id === selectedScheduleId)!}
          classInfo={classes.find(c => c.id === schedules.find(s => s.id === selectedScheduleId)?.classId)}
        />
      )}
    </div>
  );
};
