import React, { useState, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Praise, SpecialNote, Student } from '../../types';
import { ArrowLeft, Award, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const StudentRecordRow: React.FC<{
  student: Student;
  praises: Praise[];
  specialNotes: SpecialNote[];
  onPraiseChange: (studentId: string, reason: string) => void;
  onNoteChange: (studentId: string, note: string) => void;
}> = ({ student, praises, specialNotes, onPraiseChange, onNoteChange }) => {
  const praise = praises.find(p => p.studentId === student.id);
  const note = specialNotes.find(n => n.studentId === student.id);

  return (
    <tr className="border-b">
      <td className="p-3 font-medium">{student.number}</td>
      <td className="p-3 font-medium">{student.name}</td>
      <td className="p-3">
        <Input 
          value={praise ? praise.reason : ''}
          onChange={(e) => onPraiseChange(student.id, e.target.value)}
          placeholder="칭찬 사유 (예: 발표)"
        />
      </td>
      <td className="p-3">
        <Input 
          value={note ? note.note : ''}
          onChange={(e) => onNoteChange(student.id, e.target.value)}
          placeholder="특이사항 기록"
        />
      </td>
    </tr>
  );
};

export const LessonDetail: React.FC = () => {
  const { viewingScheduleId, schedules, classes, updateSchedule, closeLessonDetail } = useScheduleData();
  
  const schedule = schedules.find(s => s.id === viewingScheduleId);
  const classInfo = schedule ? classes.find(c => c.id === schedule.classId) : undefined;

  const [praises, setPraises] = useState<Praise[]>([]);
  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>([]);

  useEffect(() => {
    if (schedule) {
      setPraises(schedule.praises || []);
      setSpecialNotes(schedule.specialNotes || []);
    }
  }, [schedule]);

  const handlePraiseChange = (studentId: string, reason: string) => {
    setPraises(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        return prev.map(p => p.studentId === studentId ? { ...p, reason } : p);
      } else {
        const student = classInfo?.students.find(s => s.id === studentId);
        return [...prev, { studentId, studentName: student?.name || '', reason }];
      }
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setSpecialNotes(prev => {
        const existing = prev.find(n => n.studentId === studentId);
        if (existing) {
            return prev.map(n => n.studentId === studentId ? { ...n, note } : n);
        } else {
            const student = classInfo?.students.find(s => s.id === studentId);
            return [...prev, { studentId, studentName: student?.name || '', note }];
        }
    });
  };

  const handleSave = async () => {
    if (!viewingScheduleId) return;
    const finalPraises = praises.filter(p => p.reason.trim());
    const finalNotes = specialNotes.filter(n => n.note.trim());
    await updateSchedule(viewingScheduleId, { praises: finalPraises, specialNotes: finalNotes });
    closeLessonDetail();
  };

  if (!schedule || !classInfo) {
    return <div>로딩 중이거나, 수업 정보를 찾을 수 없습니다.</div>;
  }
  
  const presentStudents = classInfo.students.filter(
      student => !schedule.absences.some(a => a.studentId === student.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={closeLessonDetail} className="flex items-center space-x-2 text-blue-600 px-0 hover:bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          <span>목록으로 돌아가기</span>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">수업 상세 기록</h2>
          <p className="text-gray-500">{format(parseISO(schedule.date), 'PPP', { locale: ko })} {schedule.time} - {classInfo.name} ({schedule.subject})</p>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 w-16">번호</th>
                <th className="p-3 w-32">이름</th>
                <th className="p-3 flex items-center"><Award className="h-4 w-4 mr-2 text-yellow-500"/>칭찬 기록</th>
                <th className="p-3 flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-green-600"/>특이사항</th>
              </tr>
            </thead>
            <tbody>
              {presentStudents.map(student => (
                <StudentRecordRow 
                  key={student.id}
                  student={student}
                  praises={praises}
                  specialNotes={specialNotes}
                  onPraiseChange={handlePraiseChange}
                  onNoteChange={handleNoteChange}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave}>모든 기록 저장</Button>
      </div>
    </div>
  );
};