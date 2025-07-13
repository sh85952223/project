import React, { useState, useEffect, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Layout } from '../Layout';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Praise, SpecialNote } from '../../types';
import { ArrowLeft, Award, MessageSquare, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LessonHistoryCard } from './LessonHistoryCard';

// StarRating 컴포넌트
const StarRating: React.FC<{
  count: number;
  maxCount: number;
  onStarClick: (newCount: number) => void;
}> = ({ count, maxCount, onStarClick }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxCount }, (_, i) => i + 1).map(starIndex => (
        <Star
          key={starIndex}
          onClick={() => onStarClick(starIndex === count ? 0 : starIndex)}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            starIndex <= count
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export const LessonDetail: React.FC = () => {
  const { viewingScheduleId, schedules, classes, updateSchedule, closeLessonDetail } = useScheduleData();
  const [maxStarsPerStudent] = useLocalStorage<number>('settings:maxStarsPerStudent', 5);
  
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

  // 과거 수업 기록 (필터링 없이 모든 기록 표시)
  const historySchedules = useMemo(() => {
    if (!schedule || !classInfo) return [];

    // 같은 반의 모든 수업 중 현재 수업 제외
    return schedules
      .filter(s => s.classId === classInfo.id && s.id !== schedule.id)
      .sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
      });
  }, [schedules, schedule, classInfo]);

  const handleStarClick = (studentId: string, stars: number) => {
    setPraises(prev => {
      const existing = prev.find(p => p.studentId === studentId);
      if (existing) {
        if (stars === 0) return prev.filter(p => p.studentId !== studentId);
        return prev.map(p => p.studentId === studentId ? { ...p, stars } : p);
      } else if (stars > 0) {
        const student = classInfo?.students.find(s => s.id === studentId);
        return [...prev, { studentId, studentName: student?.name || '', stars }];
      }
      return prev;
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setSpecialNotes(prev => {
        const existing = prev.find(n => n.studentId === studentId);
        if (existing) {
            if (!note.trim()) return prev.filter(n => n.studentId !== studentId);
            return prev.map(n => n.studentId === studentId ? { ...n, note } : n);
        } else if (note.trim()) {
            const student = classInfo?.students.find(s => s.id === studentId);
            return [...prev, { studentId, studentName: student?.name || '', note }];
        }
        return prev;
    });
  };

  const handleSave = async () => {
    if (!viewingScheduleId) return;
    await updateSchedule(viewingScheduleId, { praises, specialNotes });
    closeLessonDetail();
  };

  if (!schedule || !classInfo) {
    return (
      <Layout>
        <div>로딩 중...</div>
      </Layout>
    );
  }
  
  const presentStudents = classInfo.students.filter(
      student => !schedule.absences.some(a => a.studentId === student.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={closeLessonDetail} className="flex items-center space-x-2 text-blue-600 px-0 hover:bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            <span>수업 목록으로 돌아가기</span>
          </Button>
        </div>

        {/* 현재 수업 기록 입력 */}
        <Card>
          <CardHeader>
              <div>
                  <h2 className="text-xl font-bold">수업 상세 기록</h2>
                  <p className="text-gray-500">{format(parseISO(schedule.date), 'PPP', { locale: ko })} {schedule.time} - {classInfo.name} ({schedule.subject})</p>
              </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 w-16">번호</th>
                  <th className="p-3 w-32">이름</th>
                  <th className="p-3">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-yellow-500"/>
                      <span>칭찬 기록 (최대 {maxStarsPerStudent}개)</span>
                    </div>
                  </th>
                  <th className="p-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-green-600"/>
                      <span>특이사항</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {presentStudents.map(student => {
                  const studentStars = praises.find(p => p.studentId === student.id)?.stars || 0;
                  return (
                      <tr key={student.id} className="border-b">
                          <td className="p-3 font-medium">{student.number}</td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">
                              <StarRating 
                                  count={studentStars}
                                  maxCount={maxStarsPerStudent}
                                  onStarClick={(newCount) => handleStarClick(student.id, newCount)}
                              />
                          </td>
                          <td className="p-3">
                              <Input 
                                value={specialNotes.find(n => n.studentId === student.id)?.note || ''}
                                onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                placeholder="특이사항 기록"
                              />
                          </td>
                      </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>모든 기록 저장</Button>
        </div>

        {/* 과거 수업 기록 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {classInfo.name} 수업 기록 ({historySchedules.length + 1}개)
            </h3>
          </div>

          {/* 수업 기록 목록 */}
          <div className="space-y-4">
            {/* 현재 수업 표시 */}
            <LessonHistoryCard
              schedule={schedule}
              currentScheduleId={schedule.id}
            />

            {/* 과거 수업 기록들 */}
            {historySchedules.length > 0 ? (
              historySchedules.map(historySchedule => (
                <LessonHistoryCard
                  key={historySchedule.id}
                  schedule={historySchedule}
                  currentScheduleId={schedule.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  이전 수업 기록이 없습니다.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};