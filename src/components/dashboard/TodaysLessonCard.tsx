import React, { useState } from 'react';
import { Schedule, ClassInfo } from '../../types';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit3, Trash2, UserX, BookText, History, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getSubjectColor } from '../../utils/colorUtils';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface TodaysLessonCardProps {
  schedule: Schedule;
  classInfo?: ClassInfo;
  backgroundColor: string;
  overallPreviousSession: Schedule | null;
  subjectPreviousSession: Schedule | null;
}

export const TodaysLessonCard: React.FC<TodaysLessonCardProps> = ({
  schedule,
  classInfo,
  backgroundColor,
  overallPreviousSession,
  subjectPreviousSession,
}) => {
  const { deleteSchedule, openProgressModal, openLessonDetail } = useScheduleData();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    // 👇 이제 `success`는 boolean 값을 가지므로, if문이 올바르게 동작합니다.
    const success = await deleteSchedule(schedule.id);
    if (success) {
      alert('수업 기록이 성공적으로 삭제되었습니다.');
    }
  };

  return (
    <>
      <Card style={{ backgroundColor }}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="w-12 text-center flex-shrink-0 border-r border-gray-300 pr-4">
              <p className="font-bold text-xl text-blue-600">{schedule.time.replace('교시', '')}</p>
              <p className="text-xs text-gray-500">교시</p>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer rounded-md p-2 -m-2 hover:bg-black/5 transition-colors duration-150"
                  onClick={() => openLessonDetail(schedule.id)}
                >
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
                    <FileText className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <p className="truncate">{schedule.progress || '진도 내용 미입력'}</p>
                  </div>
                  <div className="flex items-center text-sm text-red-600 mt-1">
                    <UserX className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <p>결석: {schedule.absences.length > 0 ? schedule.absences.map(a => a.studentName).join(', ') : '없음'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                  <Button size="sm" variant="outline" title="진도/결석 입력" onClick={() => openProgressModal(schedule.id)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="수업 삭제" onClick={() => setIsConfirmModalOpen(true)} className="text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 bg-gray-50 bg-opacity-75 p-3 rounded-lg text-sm">
                <div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <History className="h-4 w-4 mr-1.5" />
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
                      <div className="flex items-start text-gray-700"><FileText className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" /><p className="truncate">{overallPreviousSession.progress}</p></div>
                      <div className="flex items-start text-red-600"><UserX className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" /><p className="truncate">{overallPreviousSession.absences.length > 0 ? overallPreviousSession.absences.map(a => a.studentName).join(', ') : '없음'}</p></div>
                    </div>
                  ) : ( <p className="text-gray-400 pl-6 text-xs">기록 없음</p> )}
                </div>
                <div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <BookText className="h-4 w-4 mr-1.5" />
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
                      <div className="flex items-start text-gray-700"><FileText className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" /><p className="truncate">{subjectPreviousSession.progress}</p></div>
                      <div className="flex items-start text-red-600"><UserX className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" /><p className="truncate">{subjectPreviousSession.absences.length > 0 ? subjectPreviousSession.absences.map(a => a.studentName).join(', ') : '없음'}</p></div>
                    </div>
                  ) : ( <p className="text-gray-400 pl-6 text-xs">기록 없음</p> )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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