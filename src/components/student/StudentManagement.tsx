import React, { useState, useMemo, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Student, ClassInfo, Schedule } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, BookText, Calendar, ChevronDown } from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

// 학생 상세 정보 뷰
const StudentDetailView: React.FC<{ student: Student; classInfo: ClassInfo; schedules: Schedule[]; onBack: () => void; }> = ({ student, classInfo, schedules, onBack }) => {
  
  const studentRecords = useMemo(() => {
    return schedules
      .filter(schedule => {
        const wasPresent = schedule.classId === classInfo.id;
        const wasAbsent = schedule.absences.some(a => a.studentId === student.id);
        return wasPresent || wasAbsent;
      })
      .map(schedule => {
        const isAbsent = schedule.absences.find(a => a.studentId === student.id);
        return {
          date: schedule.date,
          time: schedule.time,
          subject: schedule.subject,
          progress: schedule.progress,
          isAbsent: !!isAbsent,
          absenceReason: isAbsent?.reason || '',
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
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
        <CardHeader>
          <h3 className="font-semibold">수업 참여 기록</h3>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {studentRecords.length > 0 ? studentRecords.map((record, index) => (
              <li key={index} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    {format(parseISO(record.date), 'PPP', { locale: ko })} ({record.time}) - {record.subject}
                  </p>
                  {record.isAbsent && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">결석</span>}
                </div>
                {record.isAbsent ? (
                  <p className="text-sm text-red-500 mt-1 ml-2">{record.absenceReason ? `사유: ${record.absenceReason}` : '사유 미입력'}</p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1 ml-2">진도: {record.progress || '내용 없음'}</p>
                )}
              </li>
            )) : (
              <p className="text-center text-gray-500 py-8">이 학생의 수업 기록이 없습니다.</p>
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
  // 👈 [수정] 펼쳐진 반의 ID를 저장할 Set 상태 추가
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  // 👈 [수정] 컴포넌트가 로드될 때 첫 번째 반을 기본으로 펼침
  useEffect(() => {
    if (classes.length > 0) {
      setExpandedClasses(new Set([classes[0].id]));
    }
  }, [classes]);

  const getMonthlyAbsences = (studentId: string) => {
    const today = new Date();
    return schedules.filter(schedule => 
      isSameMonth(parseISO(schedule.date), today) && 
      schedule.absences.some(absence => absence.studentId === studentId)
    ).length;
  };

  // 👈 [수정] 특정 반을 토글하는 함수
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

  // 👈 [수정] 모든 반을 펼치거나 접는 함수
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
        {/* 👈 [수정] 전체 펼치기/접기 버튼 추가 */}
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
              {/* 👈 [수정] 클릭 가능한 반 헤더 */}
              <button 
                onClick={() => handleToggleClass(classInfo.id)}
                className="w-full flex items-center justify-between p-4"
              >
                <h2 className="text-lg font-semibold">{classInfo.name}</h2>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {/* 👈 [수정] isExpanded 상태에 따라 학생 목록을 조건부 렌더링 */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <ul className="divide-y divide-gray-100 border-t border-gray-200">
                    {classInfo.students.sort((a,b) => (a.number || 999) - (b.number || 999)).map(student => {
                      const absenceCount = getMonthlyAbsences(student.id);
                      return (
                        <li key={student.id} onClick={() => setSelectedStudent({ student, classInfo })} className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-md">
                          <div className="flex items-center">
                            <span className="w-8 text-center text-gray-500 font-mono text-sm">{student.number || '-'}</span>
                            <span className="font-medium text-gray-800">{student.name}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <UserX className={`h-4 w-4 mr-1.5 ${absenceCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className={`${absenceCount > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                              이번 달 결석 {absenceCount}회
                            </span>
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