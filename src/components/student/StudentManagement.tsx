import React, { useState, useMemo, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Student, ClassInfo, Schedule } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, BookText, Calendar, ChevronDown, Award, MessageSquare, Star } from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

// 학생 상세 정보 뷰
const StudentDetailView: React.FC<{ student: Student; classInfo: ClassInfo; schedules: Schedule[]; onBack: () => void; }> = ({ student, classInfo, schedules, onBack }) => {
  
  const studentRecords = useMemo(() => {
    const records: any[] = [];

    schedules.forEach(schedule => {
        if(schedule.classId !== classInfo.id) return;

        // 결석 기록
        const absence = schedule.absences?.find(a => a.studentId === student.id);
        if(absence) {
            records.push({ type: 'absence', date: schedule.date, time: schedule.time, subject: schedule.subject, reason: absence.reason || '사유 미입력' });
        }

        // 칭찬 기록
        const praise = schedule.praises?.find(p => p.studentId === student.id);
        if(praise && praise.stars > 0) {
            records.push({ type: 'praise', date: schedule.date, time: schedule.time, subject: schedule.subject, stars: praise.stars });
        }

        // 특이사항 기록
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
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-3">
            <ArrowLeft className="h-4 w-4" />
            <span>전체 학생 목록으로 돌아가기</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
          <p className="text-gray-600">{classInfo.name}</p>
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

// 학생 관리 메인 뷰
export const StudentManagement: React.FC = () => {
  const { classes, schedules } = useScheduleData();
  const [selectedStudent, setSelectedStudent] = useState<{ student: Student; classInfo: ClassInfo } | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (classes.length > 0) {
      setExpandedClasses(new Set([classes[0].id]));
    }
  }, [classes]);

  const getMonthlyAbsences = (studentId: string) => {
    const today = new Date();
    return schedules.filter(schedule => 
      isSameMonth(parseISO(schedule.date), today) && 
      schedule.absences?.some(absence => absence.studentId === studentId)
    ).length;
  };

  const getTotalStars = (studentId: string) => {
    return schedules.reduce((acc, schedule) => {
      const studentPraise = schedule.praises?.find(p => p.studentId === studentId);
      return acc + (studentPraise?.stars || 0);
    }, 0);
  };

  const handleToggleClass = (classId: string) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleExpandAll = (expand: boolean) => {
    if (expand) {
      setExpandedClasses(new Set(classes.map(c => c.id)));
    } else {
      setExpandedClasses(new Set());
    }
  };

  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent.student}
        classInfo={selectedStudent.classInfo}
        schedules={schedules}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">학생별 현황</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{format(new Date(), 'yyyy년 M월')} 기준</span>
            </p>
        </div>
        <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleExpandAll(true)}>전체 펼치기</Button>
            <Button variant="outline" size="sm" onClick={() => handleExpandAll(false)}>전체 접기</Button>
        </div>
      </div>
      <div className="space-y-4">
        {classes.map(classInfo => {
          const isExpanded = expandedClasses.has(classInfo.id);
          return (
            <div key={classInfo.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <button 
                onClick={() => handleToggleClass(classInfo.id)}
                className="w-full flex items-center justify-between p-4"
              >
                <h2 className="text-lg font-semibold">{classInfo.name}</h2>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4">
                  <ul className="divide-y divide-gray-100 border-t border-gray-200">
                    {classInfo.students.sort((a,b) => (a.number || 999) - (b.number || 999)).map(student => {
                      const absenceCount = getMonthlyAbsences(student.id);
                      const starCount = getTotalStars(student.id);
                      return (
                        <li key={student.id} onClick={() => setSelectedStudent({ student, classInfo })} className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-md">
                          <div className="flex items-center">
                            <span className="w-8 text-center text-gray-500 font-mono text-sm">{student.number || '-'}</span>
                            <span className="font-medium text-gray-800">{student.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className={`flex items-center ${starCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                                <Star className="h-4 w-4 mr-1"/>
                                <span>총 {starCount}개</span>
                            </div>
                            <div className={`flex items-center ${absenceCount > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                <UserX className="h-4 w-4 mr-1"/>
                                <span>이번 달 결석 {absenceCount}회</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};