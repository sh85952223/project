import React, { useMemo } from 'react';
import { Student, ClassInfo, Schedule } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, MessageSquare, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StudentDetailViewProps {
  student: Student;
  classInfo: ClassInfo;
  schedules: Schedule[];
  onBack: () => void;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, classInfo, schedules, onBack }) => {
  const studentRecords = useMemo(() => {
    const records: any[] = [];
    schedules.forEach(schedule => {
        if(schedule.classId !== classInfo.id) return;

        const absence = schedule.absences?.find(a => a.studentId === student.id);
        if(absence) {
            records.push({ type: 'absence', date: schedule.date, time: schedule.time, subject: schedule.subject, reason: absence.reason || '사유 미입력' });
        }

        const praise = schedule.praises?.find(p => p.studentId === student.id);
        if(praise && praise.stars > 0) {
            records.push({ type: 'praise', date: schedule.date, time: schedule.time, subject: schedule.subject, stars: praise.stars });
        }

        const note = schedule.specialNotes?.find(n => n.studentId === student.id);
        if(note && note.note.trim()) {
            records.push({ type: 'note', date: schedule.date, time: schedule.time, subject: schedule.subject, note: note.note });
        }
    });
    return records.sort((a, b) => b.date.localeCompare(a.date));
  }, [schedules, student, classInfo]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 px-0 text-blue-600 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span>{classInfo.name} 목록으로 돌아가기</span>
          </Button>
          <h1 className="text-2xl font-bold mt-2">{student.name}</h1>
        </div>
      </div>
      <Card>
        <CardHeader><h3 className="font-semibold">학생 종합 기록</h3></CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {studentRecords.length > 0 ? studentRecords.map((record, index) => (
              <li key={index} className="py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {format(parseISO(record.date), 'PPP', { locale: ko })} ({record.time}) - {record.subject}
                  </p>
                  {record.type === 'absence' && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">결석</span>}
                  {record.type === 'praise' && <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">칭찬</span>}
                  {record.type === 'note' && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">기록</span>}
                </div>
                <div className="flex items-start mt-1.5 ml-2 text-sm">
                    {record.type === 'absence' && <><UserX className="h-4 w-4 mr-2 mt-0.5 text-red-500"/><p className="text-red-500">{record.reason}</p></>}
                    {record.type === 'praise' && <div className="flex items-center text-yellow-600"><Star className="h-4 w-4 mr-2 fill-current"/><p>{record.stars}개</p></div>}
                    {record.type === 'note' && <><MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-green-600"/><p className="text-green-700">{record.note}</p></>}
                </div>
              </li>
            )) : (
              <p className="text-center text-gray-500 py-8">이 학생에 대한 기록이 없습니다.</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};