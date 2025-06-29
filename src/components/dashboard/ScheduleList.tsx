import React, { useState } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Clock, BookOpen, UserX, Edit3, Trash2, BookText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface ScheduleListProps {
  classId: string;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ classId }) => {
  const { schedules, deleteSchedule, isLoading, openLessonDetail, openProgressModal } = useScheduleData();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [targetScheduleId, setTargetScheduleId] = useState<string | null>(null);

  const classSchedules = schedules
    .filter(s => s.classId === classId)
    .sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
    });

  const openDeleteConfirmModal = (scheduleId: string) => {
    setTargetScheduleId(scheduleId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!targetScheduleId) return;
    const success = await deleteSchedule(targetScheduleId);
    if (success) {
      alert('수업 기록이 성공적으로 삭제되었습니다.');
    }
  };

  if (classSchedules.length === 0) {
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
      <div className="space-y-4">
        {classSchedules.map(schedule => (
            <Card key={schedule.id}>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{format(parseISO(schedule.date), 'PPP', { locale: ko })}</span></div>
                          <div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>{schedule.time}</span></div>
                          <div className="flex items-center space-x-2"><BookOpen className="h-4 w-4" /><span>{schedule.subject}</span></div>
                      </div>
                      <div className="flex items-center space-x-2">
                          {schedule.progress && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">완료</span>}
                          <Button size="sm" variant="ghost" title="진도/결석 입력" onClick={() => openProgressModal(schedule.id)} disabled={isLoading}><Edit3 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" title="상세 기록" onClick={() => openLessonDetail(schedule.id)} disabled={isLoading}><BookText className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" title="수업 삭제" onClick={() => openDeleteConfirmModal(schedule.id)} className="text-red-600" disabled={isLoading}><Trash2 className="h-4 w-4" /></Button>
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
        ))}
      </div>
      <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="수업 기록 삭제"
          message="이 수업 기록을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      />
    </>
  );
};