import React, { useState, useEffect } from 'react';
import { useSchedules } from '../../hooks/useSchedules';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ScheduleList } from './ScheduleList';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, Calendar, BarChart3, BookOpen, Clock, Edit3, UserX, Trash2, Eraser, X, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { 
    schedules, 
    classes, 
    addSchedule, 
    updateSchedule, 
    deleteSchedule, 
    clearProgress, 
    isLoading,
    getLatestSchedules,
    lastUpdateTime,
    recoverData
  } = useSchedules();
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [preselectedClassId, setPreselectedClassId] = useState<string | null>(null);
  
  // 실시간 업데이트를 위한 로컬 상태
  const [localSchedules, setLocalSchedules] = useState(schedules);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dataIntegrityCheck, setDataIntegrityCheck] = useState(true);

  // 데이터 무결성 검사
  const checkDataIntegrity = () => {
    const latestSchedules = getLatestSchedules();
    const hasValidData = latestSchedules.every(schedule => 
      schedule.id && 
      schedule.date && 
      schedule.time && 
      schedule.classId && 
      schedule.subject
    );
    
    setDataIntegrityCheck(hasValidData);
    
    if (!hasValidData) {
      console.warn('Data integrity check failed');
    }
    
    return hasValidData;
  };

  // 스케줄 변경 감지 및 실시간 업데이트
  useEffect(() => {
    console.log('Dashboard: Schedules updated, length:', schedules.length);
    setLocalSchedules(schedules);
    checkDataIntegrity();
  }, [schedules, lastUpdateTime]);

  // 커스텀 이벤트 리스너로 실시간 업데이트 감지
  useEffect(() => {
    const handleScheduleUpdate = (event: CustomEvent) => {
      console.log('Dashboard: Custom schedule update event received');
      const latestSchedules = getLatestSchedules();
      setLocalSchedules(latestSchedules);
      setRefreshTrigger(prev => prev + 1);
      checkDataIntegrity();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('schedules_')) {
        console.log('Dashboard: Storage change detected');
        const latestSchedules = getLatestSchedules();
        setLocalSchedules(latestSchedules);
        checkDataIntegrity();
      }
    };

    window.addEventListener('scheduleUpdate', handleScheduleUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('scheduleUpdate', handleScheduleUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getLatestSchedules]);

  // 주기적으로 최신 데이터 확인 (폴링) - 더 자주 확인
  useEffect(() => {
    const interval = setInterval(() => {
      const latestSchedules = getLatestSchedules();
      if (JSON.stringify(latestSchedules) !== JSON.stringify(localSchedules)) {
        console.log('Dashboard: Polling detected changes, updating...');
        setLocalSchedules(latestSchedules);
        checkDataIntegrity();
      }
    }, 500); // 0.5초마다 확인

    return () => clearInterval(interval);
  }, [getLatestSchedules, localSchedules]);

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log('Dashboard: Page focused, refreshing data');
      const latestSchedules = getLatestSchedules();
      setLocalSchedules(latestSchedules);
      checkDataIntegrity();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [getLatestSchedules]);

  const today = new Date();
  const todaySchedules = localSchedules.filter(
    schedule => schedule.date === format(today, 'yyyy-MM-dd')
  );

  console.log('Dashboard render - Today schedules:', todaySchedules.length);
  console.log('Dashboard render - All schedules:', localSchedules.length);

  const getClassStats = (classId: string) => {
    const classSchedules = localSchedules.filter(s => s.classId === classId);
    const completedSessions = classSchedules.filter(s => s.progress).length;
    const totalAbsences = classSchedules.reduce((acc, s) => acc + s.absences.length, 0);
    
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
      try {
        console.log('Dashboard: Submitting progress for schedule:', selectedScheduleId);
        await updateSchedule(selectedScheduleId, { progress, absences });
        
        // 즉시 로컬 상태 업데이트
        const updatedSchedules = localSchedules.map(schedule =>
          schedule.id === selectedScheduleId
            ? { 
                ...schedule, 
                progress: progress.trim(), 
                absences,
                updatedAt: new Date().toISOString()
              }
            : schedule
        );
        setLocalSchedules(updatedSchedules);
        
        setIsProgressModalOpen(false);
        setSelectedScheduleId(null);
        console.log('Dashboard: Progress submitted successfully');
        
        // 데이터 무결성 재검사
        setTimeout(() => checkDataIntegrity(), 100);
      } catch (error) {
        console.error('Failed to save progress:', error);
        alert('진도 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('이 수업을 완전히 삭제하시겠습니까?')) {
      try {
        console.log('Dashboard: Deleting schedule:', scheduleId);
        
        // 즉시 로컬 상태에서 제거
        const updatedSchedules = localSchedules.filter(schedule => schedule.id !== scheduleId);
        setLocalSchedules(updatedSchedules);
        
        await deleteSchedule(scheduleId);
        console.log('Dashboard: Schedule deleted successfully');
        
        // 데이터 무결성 재검사
        setTimeout(() => checkDataIntegrity(), 100);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
        // 실패 시 원래 상태로 복원
        setLocalSchedules(getLatestSchedules());
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleClearProgress = async (scheduleId: string) => {
    if (confirm('진도 내용을 삭제하시겠습니까?')) {
      try {
        console.log('Dashboard: Clearing progress for:', scheduleId);
        
        // 즉시 로컬 상태 업데이트
        const updatedSchedules = localSchedules.map(schedule =>
          schedule.id === scheduleId
            ? { 
                ...schedule, 
                progress: '', 
                absences: [], 
                updatedAt: new Date().toISOString() 
              }
            : schedule
        );
        setLocalSchedules(updatedSchedules);
        
        await clearProgress(scheduleId);
        console.log('Dashboard: Progress cleared successfully');
        
        // 데이터 무결성 재검사
        setTimeout(() => checkDataIntegrity(), 100);
      } catch (error) {
        console.error('Failed to clear progress:', error);
        // 실패 시 원래 상태로 복원
        setLocalSchedules(getLatestSchedules());
        alert('삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleAddSchedule = async (schedule: any) => {
    try {
      console.log('Dashboard: Adding new schedule');
      await addSchedule(schedule);
      setIsScheduleModalOpen(false);
      setPreselectedClassId(null);
      
      // 추가 후 최신 데이터로 업데이트
      setTimeout(() => {
        const latestSchedules = getLatestSchedules();
        setLocalSchedules(latestSchedules);
        checkDataIntegrity();
      }, 100);
    } catch (error) {
      console.error('Failed to add schedule:', error);
      alert('수업 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDataRecovery = () => {
    if (confirm('백업 데이터에서 복구하시겠습니까?')) {
      const recovered = recoverData();
      if (recovered) {
        alert('데이터가 성공적으로 복구되었습니다.');
        const latestSchedules = getLatestSchedules();
        setLocalSchedules(latestSchedules);
        checkDataIntegrity();
      } else {
        alert('복구할 백업 데이터가 없습니다.');
      }
    }
  };

  const handleForceRefresh = () => {
    console.log('Dashboard: Force refresh triggered');
    const latestSchedules = getLatestSchedules();
    setLocalSchedules(latestSchedules);
    setRefreshTrigger(prev => prev + 1);
    checkDataIntegrity();
  };

  // 반별 수업 추가 핸들러
  const handleAddScheduleForClass = (classId: string) => {
    console.log('Dashboard: Adding schedule for class:', classId);
    setPreselectedClassId(classId);
    setIsScheduleModalOpen(true);
  };

  // 반 상세 페이지로 이동
  const handleViewClassDetail = (classId: string) => {
    console.log('Dashboard: Viewing class detail:', classId);
    setSelectedClassId(classId);
  };

  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    console.log('Dashboard: Returning to dashboard');
    setSelectedClassId(null);
    setPreselectedClassId(null);
    
    // 돌아갈 때 최신 데이터 새로고침
    const latestSchedules = getLatestSchedules();
    setLocalSchedules(latestSchedules);
    checkDataIntegrity();
  };

  const getPreviousClassSession = (classId: string, currentDate: string) => {
    const classSchedules = localSchedules
      .filter(s => s.classId === classId && s.progress && s.date !== currentDate)
      .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
    
    return classSchedules[0] || null;
  };

  // 개별 반 페이지 렌더링
  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const classSchedules = localSchedules.filter(s => s.classId === selectedClassId);
    
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

        {/* 개별 반 페이지용 스케줄 모달 */}
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

        {/* 개별 반 페이지용 진도 입력 모달 */}
        {selectedScheduleId && (
          <ProgressInputModal
            isOpen={isProgressModalOpen}
            onClose={() => {
              setIsProgressModalOpen(false);
              setSelectedScheduleId(null);
            }}
            onSubmit={handleProgressSubmit}
            schedule={localSchedules.find(s => s.id === selectedScheduleId)!}
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
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
            {!dataIntegrityCheck && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-yellow-600">데이터 확인 필요</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {format(today, 'PPP', { locale: ko })} • 오늘 수업 {todaySchedules.length}개
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                마지막 업데이트: {format(new Date(lastUpdateTime), 'HH:mm:ss')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceRefresh}
                className="p-1"
                title="새로고침"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!dataIntegrityCheck && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDataRecovery}
              className="flex items-center space-x-2 text-yellow-600 border-yellow-300"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>데이터 복구</span>
            </Button>
          )}
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center space-x-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>수업 추가</span>
          </Button>
        </div>
      </div>

      {/* Today's Schedule */}
      {todaySchedules.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">오늘의 수업</h2>
              <span className="text-xs text-gray-500">
                (총 {localSchedules.length}개 수업 중 {todaySchedules.length}개)
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
                    key={`${schedule.id}-${refreshTrigger}`}
                    className="bg-blue-50 rounded-lg border border-blue-100 overflow-hidden"
                  >
                    {/* Main Schedule Info */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              {schedule.time}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="font-medium text-gray-900">
                            {classInfo?.name}
                          </span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-700">
                            {schedule.subject}
                          </span>
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
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              완료
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleProgressInput(schedule.id)}
                              className="flex items-center space-x-1"
                              title="진도 수정"
                              disabled={isLoading}
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>수정</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClearProgress(schedule.id)}
                              className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                              title="진도 내용만 삭제"
                              disabled={isLoading}
                            >
                              <Eraser className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              대기
                            </span>
                            <Button
                              size="sm"
                              onClick={() => handleProgressInput(schedule.id)}
                              className="flex items-center space-x-1"
                              disabled={isLoading}
                            >
                              <BookOpen className="h-3 w-3" />
                              <span>진도 입력</span>
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="수업 완전 삭제"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Previous Session Info */}
                    {previousSession && (
                      <div className="border-t border-blue-200 bg-blue-25 px-4 py-3">
                        <div className="flex items-start space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-blue-700">지난 시간 진도</p>
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                {format(new Date(previousSession.date), 'M/d', { locale: ko })}
                              </span>
                            </div>
                            <p className="text-sm text-blue-800 mb-2">{previousSession.progress}</p>
                            
                            {previousSession.absences.length > 0 && (
                              <div className="flex items-start space-x-2">
                                <UserX className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-medium text-red-700 mb-1">지난 시간 결석생</p>
                                  <div className="space-y-1">
                                    {previousSession.absences.map(absence => (
                                      <div key={absence.studentId} className="text-xs text-red-600">
                                        {absence.studentName} {absence.reason && `(${absence.reason})`}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
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
          <span className="text-sm text-gray-500">• 각 반 카드에서 바로 수업을 추가할 수 있습니다</span>
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

      {/* 메인 대시보드용 스케줄 모달 */}
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

      {/* 메인 대시보드용 진도 입력 모달 */}
      {selectedScheduleId && (
        <ProgressInputModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedScheduleId(null);
          }}
          onSubmit={handleProgressSubmit}
          schedule={localSchedules.find(s => s.id === selectedScheduleId)!}
          classInfo={classes.find(c => c.id === localSchedules.find(s => s.id === selectedScheduleId)?.classId)}
        />
      )}
    </div>
  );
};