import React from 'react';
import { Schedule } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Calendar, Clock, BookOpen, UserX, MessageSquare, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LessonHistoryCardProps {
  schedule: Schedule;
  currentScheduleId: string;
}

export const LessonHistoryCard: React.FC<LessonHistoryCardProps> = ({
  schedule,
  currentScheduleId
}) => {
  const isCurrentLesson = schedule.id === currentScheduleId;
  const hasAbsences = schedule.absences.length > 0;
  const hasPraises = (schedule.praises || []).some(p => p.stars > 0);
  const hasNotes = (schedule.specialNotes || []).some(n => n.note?.trim());

  // 현재 수업인 경우 다른 스타일 적용
  if (isCurrentLesson) {
    return (
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-blue-600 font-medium">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(schedule.date), 'PPP', { locale: ko })}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <Clock className="h-4 w-4" />
                <span>{schedule.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <BookOpen className="h-4 w-4" />
                <span>{schedule.subject}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              현재 수업
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-blue-700 font-medium">
            위에서 기록을 입력하고 있는 수업입니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
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
          
          {/* 상태 뱃지 */}
          <div className="flex items-center space-x-1">
            {hasAbsences && (
              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                <UserX className="h-3 w-3 mr-1" />
                결석
              </span>
            )}
            {hasPraises && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                <Star className="h-3 w-3 mr-1" />
                칭찬
              </span>
            )}
            {hasNotes && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <MessageSquare className="h-3 w-3 mr-1" />
                특이사항
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* 진도 내용 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">진도 내용</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {schedule.progress || '진도 내용이 없습니다.'}
          </p>
        </div>

        {/* 결석생 */}
        {hasAbsences && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <UserX className="h-4 w-4 mr-1 text-red-500" />
              결석생 ({schedule.absences.length}명)
            </h4>
            <div className="flex flex-wrap gap-1">
              {schedule.absences.map(absence => (
                <span key={absence.studentId} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                  {absence.studentName}
                  {absence.reason && (
                    <span className="ml-1 text-red-500">({absence.reason})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 칭찬 기록 */}
        {hasPraises && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              칭찬 기록
            </h4>
            <div className="flex flex-wrap gap-1">
              {(schedule.praises || [])
                .filter(praise => praise.stars > 0)
                .map(praise => (
                <span key={praise.studentId} className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">
                  {praise.studentName}
                  <div className="ml-1 flex items-center">
                    {Array.from({ length: praise.stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 특이사항 */}
        {hasNotes && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1 text-green-600" />
              특이사항
            </h4>
            <div className="space-y-1">
              {(schedule.specialNotes || [])
                .filter(note => note.note?.trim())
                .map(note => (
                <div key={note.studentId} className="flex items-start space-x-2 p-2 bg-green-50 rounded text-xs">
                  <span className="font-medium text-green-700">{note.studentName}:</span>
                  <span className="text-green-600">{note.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};