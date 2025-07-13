import React, { useState, useEffect, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Layout } from '../Layout';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Praise, SpecialNote, Schedule } from '../../types';
import { ArrowLeft, Award, MessageSquare, Star } from 'lucide-react';
import { format, parseISO, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { LessonDetailFilters, PeriodFilter, ContentFilters } from './LessonDetailFilters';
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

  // 필터 상태
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [contentFilters, setContentFilters] = useState<ContentFilters>({
    hasAbsences: false,
    hasPraises: false,
    hasNotes: false
  });

  useEffect(() => {
    if (schedule) {
      setPraises(schedule.praises || []);
      setSpecialNotes(schedule.specialNotes || []);
    }
  }, [schedule]);

  // 과거 수업 기록 필터링
  const filteredHistorySchedules = useMemo(() => {
    if (!schedule || !classInfo) return [];

    const today = new Date();
    
    // 같은 반의 모든 수업 중 현재 수업 제외
    const historySchedules = schedules
      .filter(s => s.classId === classInfo.id && s.id !== schedule.id)
      .sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return b.time.localeCompare(a.time, undefined, { numeric: true });
      });

    return historySchedules.filter(historySchedule => {
      try {
        const scheduleDate = parseISO(historySchedule.date);
        
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
        const hasAbsences = historySchedule.absences.length > 0;
        const hasPraises = (historySchedule.praises || []).some(p => p.stars > 0);
        const hasNotes = (historySchedule.specialNotes || []).some(n => n.note?.trim());

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
  }, [schedules, schedule, classInfo, periodFilter, contentFilters]);

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

  // 전체 수업 수 (현재 수업 포함)
  const totalSchedules = schedules.filter(s => s.classId === classInfo.id);

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
              {classInfo.name} 수업 기록
            </h3>
          </div>

          {/* 필터 */}
          <LessonDetailFilters
            periodFilter={periodFilter}
            onPeriodFilterChange={setPeriodFilter}
            contentFilters={contentFilters}
            onContentFilterChange={setContentFilters}
            totalCount={totalSchedules.length}
            filteredCount={filteredHistorySchedules.length + 1} // +1은 현재 수업
          />

          {/* 수업 기록 목록 */}
          <div className="space-y-4">
            {/* 현재 수업 표시 */}
            <LessonHistoryCard
              schedule={schedule}
              classInfo={classInfo}
              currentScheduleId={schedule.id}
            />

            {/* 과거 수업 기록들 */}
            {filteredHistorySchedules.length > 0 ? (
              filteredHistorySchedules.map(historySchedule => (
                <LessonHistoryCard
                  key={historySchedule.id}
                  schedule={historySchedule}
                  classInfo={classInfo}
                  currentScheduleId={schedule.id}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  선택한 조건에 맞는 수업 기록이 없습니다.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};