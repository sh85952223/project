import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Clock, BookOpen, UserX, Edit3, Trash2, BookText } from 'lucide-react';
import { format, parseISO, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { ProgressInputModal } from './ProgressInputModal';
import { isScheduleCompleted } from '../../utils/dateUtils';
import { LessonDetailFilters, PeriodFilter, ContentFilters } from './LessonDetailFilters';

interface ScheduleListProps {
  classId: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ classId }) => {
  const { schedules, deleteSchedule, isLoading, openLessonDetail, openProgressModal } = useScheduleData();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetScheduleId, setTargetScheduleId] = useState<string | null>(null);

  // 필터 상태 (기본값: 전체)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [contentFilters, setContentFilters] = useState<ContentFilters>({
    hasAbsences: false,
    hasPraises: false,
    hasNotes: false
  });

  // 필터링된 스케줄 목록
  const filteredSchedules = useMemo(() => {
    const today = new Date();
    
    const classSchedules = schedules
      .filter(s => s.classId === classId)
      .sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
      });

    return classSchedules.filter(schedule => {
      try {
        const scheduleDate = parseISO(schedule.date);
        
        // 기간 필터
        let periodMatch = true;
        switch (periodFilter) {
          case 'today':
            periodMatch = isToday(scheduleDate);
            break;
          case 'week':
            periodMatch = isSameWeek(scheduleDate, today, { weekStartsOn: 1 });
            break;
          case 'month':
            periodMatch = isSameMonth(scheduleDate, today);
            break;
          case 'all':
            periodMatch = true;
            break;
        }

        if (!periodMatch) return false;

        // 내용 필터
        const hasAbsences = schedule.absences.length > 0;
        const hasPraises = (schedule.praises || []).some(p => p.stars > 0);
        const hasNotes = (schedule.specialNotes || []).some(n => n.note?.trim());

        // 필터가 모두 비활성화된 경우 모든 수업 표시
        if (!contentFilters.hasAbsences && !contentFilters.hasPraises && !contentFilters.hasNotes) {
          return true;
        }

        // 활성화된 필터와 일치하는지 확인
        return (
          (contentFilters.hasAbsences && hasAbsences) ||
          (contentFilters.hasPraises && hasPraises) ||
          (contentFilters.hasNotes && hasNotes)
        );
      } catch (error) {
        return false;
      }
    });
  }, [schedules, classId, periodFilter, contentFilters]);

  // 전체 수업 수
  const totalSchedules = schedules.filter(s => s.classId === classId);

  const openDeleteConfirmModal = (scheduleId: string) => {
    setTargetScheduleId(scheduleId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetScheduleId) return;
    await deleteSchedule(targetScheduleId);
  };

  if (totalSchedules.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p>등록된 수업이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* 필터 */}
        <LessonDetailFilters
          periodFilter={periodFilter}
          onPeriodFilterChange={setPeriodFilter}
          contentFilters={contentFilters}
          onContentFilterChange={setContentFilters}
          totalCount={totalSchedules.length}
          filteredCount={filteredSchedules.length}
        />

        {/* 수업 목록 */}
        <div className="space-y-4">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(schedule => (
              <Card key={schedule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(schedule.date), 'PPP', { locale: ko })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{schedule.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{schedule.subject}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isScheduleCompleted(schedule) && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">완료</span>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        title="진도/결석 입력" 
                        onClick={() => openProgressModal(schedule.id)} 
                        disabled={isLoading}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        title="상세 기록" 
                        onClick={() => openLessonDetail(schedule.id)} 
                        disabled={isLoading}
                      >
                        <BookText className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        title="수업 삭제" 
                        onClick={() => openDeleteConfirmModal(schedule.id)} 
                        className="text-red-600" 
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">진도 내용</label>
                      <p className="p-3 bg-gray-50 rounded-lg text-sm">{schedule.progress || '진도 내용이 없습니다.'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">결석생</label>
                      <div className={`flex items-start text-sm ${schedule.absences.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        <UserX className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          {schedule.absences.length > 0 ? (
                            <ul className="list-inside">
                              {schedule.absences.map(a => (
                                <li key={a.studentId}>
                                  <span className="font-semibold">{a.studentName}</span>
                                  {a.reason && <span className="text-gray-500 ml-1">({a.reason})</span>}
                                </li>
                              ))}
                            </ul>
                          ) : <p>결석생이 없습니다.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                선택한 조건에 맞는 수업이 없습니다.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="수업 기록 삭제"
        message="이 수업 기록을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
      <ProgressInputModal />
    </>
  );
};