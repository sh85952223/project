import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, ArrowLeft, Edit3, Trash2, UserX, BookText, History } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScheduleList } from './ScheduleList';
import { Schedule } from '../../types';

export const Dashboard: React.FC = () => {
  const { 
    schedules, 
    classes,
    isLoading,
    openScheduleModal,
    deleteSchedule,
  } = useScheduleData();
  
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const today = new Date();

  const todaySchedules = schedules.filter(schedule => {
    try {
        const scheduleDate = typeof schedule.date === 'string' ? parseISO(schedule.date) : schedule.date;
        return isToday(scheduleDate);
    } catch (error) {
        console.error("Invalid date format for schedule:", schedule);
        return false;
    }
  }).sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));

  // 👈 [수정] '지난 수업'을 찾는 로직 개선
  const getPreviousClassSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime } = currentSchedule;

    const candidates = schedules.filter(s => 
      s.classId === classId && // 같은 반이어야 하고
      s.progress &&             // 진도 내용이 있어야 하며
      s.id !== currentSchedule.id && // 자기 자신은 제외하고
      // (날짜가 이전이거나) 또는 (날짜는 같은데 시간이 이전)인 경우
      (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0))
    );

    if (candidates.length === 0) return null;

    // 후보들을 날짜 내림차순, 시간 내림차순으로 정렬하여 가장 최근 수업을 찾음
    return candidates.sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
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

  if (selectedClassId) {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    
    if (!selectedClass) {
      return (
        <div className="text-center py-12">
          <p className="mb-4">해당 반을 찾을 수 없습니다.</p>
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
              const previousSession = getPreviousClassSession(schedule);

              return (
                <Card key={schedule.id}>
                  <CardContent className="p-4 space-y-3">
                    {/* 상단: 수업 정보 및 버튼 */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 text-center flex-shrink-0">
                                <p className="font-bold text-xl text-blue-600">{schedule.time.replace('교시','')}</p>
                                <p className="text-xs text-gray-500">교시</p>
                            </div>
                            <div>
                                <p className="font-semibold">{classInfo?.name} - {schedule.subject}</p>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <BookText className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                    <p className="truncate">{schedule.progress || '진도 내용 미입력'}</p>
                                </div>
                                <div className="flex items-center text-sm text-red-600 mt-1">
                                    <UserX className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                    <p>결석: {schedule.absences.length > 0 ? schedule.absences.map(a => a.studentName).join(', ') : '없음'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            <Button size="sm" variant="outline" onClick={() => handleProgressInput(schedule.id)}>
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteSchedule(schedule.id)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {/* 하단: 이전 수업 정보 */}
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex items-center text-gray-500 mb-2">
                          <History className="h-4 w-4 mr-2"/>
                          <h4 className="font-medium">
                            지난 수업 
                            {previousSession && (
                                <span className="text-xs font-normal ml-1">
                                    ({format(parseISO(previousSession.date), 'M/d')} {previousSession.time})
                                </span>
                            )}
                          </h4>
                      </div>
                      {previousSession ? (
                          <div className="space-y-1.5 pl-1">
                              <div className="flex items-center text-gray-700">
                                  <BookText className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400"/>
                                  <p className="truncate"><span className="font-semibold">진도:</span> {previousSession.progress}</p>
                              </div>
                              <div className="flex items-center text-red-600">
                                  <UserX className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                  <p className="truncate">결석: {previousSession.absences.length > 0 ? previousSession.absences.map(a => a.studentName).join(', ') : '없음'}</p>
                              </div>
                          </div>
                      ) : (
                          <p className="text-gray-400 pl-6">이전 수업 기록이 없습니다.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p>오늘 등록된 수업이 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">우측 상단의 '수업 추가' 버튼으로 새 수업을 등록해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">반별 현황</h2>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(classInfo => (
              <ClassCard
                key={classInfo.id}
                classInfo={classInfo}
                onClick={() => handleViewClassDetail(classInfo.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p>아직 등록된 반이 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">'반 관리' 탭에서 새로운 반을 추가해보세요.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <ScheduleModal />
      {selectedScheduleId && (
        <ProgressInputModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedScheduleId(null);
          }}
          scheduleId={selectedScheduleId}
        />
      )}
    </div>
  );
};