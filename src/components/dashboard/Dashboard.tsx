import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassCard } from './ClassCard';
import { ScheduleModal } from './ScheduleModal';
import { ProgressInputModal } from './ProgressInputModal';
import { Plus, ArrowLeft, Edit3, Trash2, UserX, BookText, History, FileText } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ScheduleList } from './ScheduleList';
import { Schedule } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const subjectColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF',
  '#A0C4FF', '#BDB2FF', '#FFC6FF', '#E0BBE4', '#D291BC'
];

const getSubjectColor = (subject: string): string => {
  if (!subject) return '#E0E0E0';
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash += subject.charCodeAt(i);
  }
  const index = hash % subjectColors.length;
  return subjectColors[index];
};

export const Dashboard: React.FC = () => {
  const { 
    schedules, 
    classes,
    isLoading,
    openScheduleModal,
    deleteSchedule,
    openProgressModal,
    openLessonDetail
  } = useScheduleData();
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

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

  const getOverallPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime } = currentSchedule;
    const candidates = schedules.filter(s => 
      s.classId === classId && s.progress && s.id !== currentSchedule.id &&
      (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0))
    );
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return b.time.localeCompare(a.time, undefined, { numeric: true });
    })[0];
  };

  const getSubjectSpecificPreviousSession = (currentSchedule: Schedule): Schedule | null => {
    const { classId, date: currentDate, time: currentTime, subject } = currentSchedule;
    const candidates = schedules.filter(s =>
      s.classId === classId &&
      s.subject === subject &&
      s.progress &&
      s.id !== currentSchedule.id &&
      (s.date < currentDate || (s.date === currentDate && s.time.localeCompare(currentTime, undefined, { numeric: true }) < 0))
    );
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
              const overallPreviousSession = getOverallPreviousSession(schedule);
              const subjectPreviousSession = getSubjectSpecificPreviousSession(schedule);
              
              const gradeColors: { [key: number]: string } = { 1: grade1Color, 2: grade2Color, 3: grade3Color };
              const backgroundColor = gradeColors[classInfo?.grade || 0] || 'white';

              return (
                <Card key={schedule.id} style={{ backgroundColor }}>
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-12 text-center flex-shrink-0 border-r pr-4">
                          <p className="font-bold text-xl text-blue-600">{schedule.time.replace('교시','')}</p>
                          <p className="text-xs text-gray-500">교시</p>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span
                                        className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-full text-gray-800"
                                        style={{ backgroundColor: getSubjectColor(schedule.subject) }}
                                    >
                                        {schedule.subject}
                                    </span>
                                    <p className="font-semibold">{classInfo?.name}</p>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <FileText className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                    <p className="truncate">{schedule.progress || '진도 내용 미입력'}</p>
                                </div>
                                <div className="flex items-center text-sm text-red-600 mt-1">
                                    <UserX className="h-4 w-4 mr-1.5 flex-shrink-0"/>
                                    <p>결석: {schedule.absences.length > 0 ? schedule.absences.map(a => a.studentName).join(', ') : '없음'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                <Button size="sm" variant="outline" title="진도/결석 입력" onClick={() => openProgressModal(schedule.id)}>
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" title="상세 기록" onClick={() => openLessonDetail(schedule.id)}>
                                    <BookText className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" title="수업 삭제" onClick={() => deleteSchedule(schedule.id)} className="text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 bg-opacity-75 p-3 rounded-lg text-sm">
                            <div>
                                <div className="flex items-center text-gray-500 mb-2">
                                    <History className="h-4 w-4 mr-1.5"/>
                                    <h4 className="font-medium">
                                        최근 수업
                                        {overallPreviousSession && (
                                            <span className="text-xs font-normal text-gray-400 ml-1">
                                                ({format(parseISO(overallPreviousSession.date), 'M/d')} {overallPreviousSession.time} - {overallPreviousSession.subject})
                                            </span>
                                        )}
                                    </h4>
                                </div>
                                {overallPreviousSession ? (
                                    <div className="space-y-1.5 pl-1 text-xs">
                                        <div className="flex items-start text-gray-700"><FileText className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5"/><p className="truncate">{overallPreviousSession.progress}</p></div>
                                        <div className="flex items-start text-red-600"><UserX className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5"/><p className="truncate">{overallPreviousSession.absences.length > 0 ? overallPreviousSession.absences.map(a => a.studentName).join(', ') : '없음'}</p></div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 pl-6 text-xs">기록 없음</p>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center text-gray-500 mb-2">
                                    <BookText className="h-4 w-4 mr-1.5"/>
                                    <h4 className="font-medium">
                                        동일 과목 수업
                                        {subjectPreviousSession && (
                                            <span className="text-xs font-normal text-gray-400 ml-1">
                                                ({format(parseISO(subjectPreviousSession.date), 'M/d')} {subjectPreviousSession.time})
                                            </span>
                                        )}
                                    </h4>
                                </div>
                                {subjectPreviousSession ? (
                                     <div className="space-y-1.5 pl-1 text-xs">
                                        <div className="flex items-start text-gray-700"><FileText className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5"/><p className="truncate">{subjectPreviousSession.progress}</p></div>
                                        <div className="flex items-start text-red-600"><UserX className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5"/><p className="truncate">{subjectPreviousSession.absences.length > 0 ? subjectPreviousSession.absences.map(a => a.studentName).join(', ') : '없음'}</p></div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 pl-6 text-xs">기록 없음</p>
                                )}
                            </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><CardContent className="text-center py-12"><p>오늘 등록된 수업이 없습니다.</p></CardContent></Card>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">반별 현황</h2>
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(classInfo => (
              <ClassCard key={classInfo.id} classInfo={classInfo} onClick={() => handleViewClassDetail(classInfo.id)} />
            ))}
          </div>
        ) : (
          <Card><CardContent className="text-center py-12"><p>아직 등록된 반이 없습니다.</p></CardContent></Card>
        )}
      </div>
      
      <ScheduleModal />
      <ProgressInputModal />
    </div>
  );
};