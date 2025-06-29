import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Student } from '../../types';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, MessageSquare, Star, ArrowUpDown } from 'lucide-react';
import { parseISO, isSameMonth } from 'date-fns'; // format, ko 제거
import { StudentDetailView } from './StudentDetailView';
import { Card } from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type SortKey = 'default' | 'absences' | 'stars' | 'notes';

interface ClassStudentListProps {
  classId: string;
  onBack: () => void;
}

export const ClassStudentList: React.FC<ClassStudentListProps> = ({ classId, onBack }) => {
  const { classes, schedules } = useScheduleData();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  const classInfo = useMemo(() => classes.find(c => c.id === classId), [classId, classes]);

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
  
  const getMonthlyStars = (studentId: string) => {
    const today = new Date();
    return schedules.reduce((acc, schedule) => {
        if (isSameMonth(parseISO(schedule.date), today)) {
            const studentPraise = schedule.praises?.find(p => p.studentId === studentId);
            return acc + (studentPraise?.stars || 0);
        }
        return acc;
    }, 0);
  };

  const getTotalNotes = (studentId: string) => {
    return schedules.reduce((acc, schedule) => {
      if (schedule.specialNotes?.some(note => note.studentId === studentId && note.note?.trim())) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  // 👇 [추가] 이번 달 특이사항 개수를 계산하는 함수
  const getMonthlyNotes = (studentId: string) => {
    const today = new Date();
    return schedules.reduce((acc, schedule) => {
        if (isSameMonth(parseISO(schedule.date), today) && schedule.specialNotes?.some(note => note.studentId === studentId && note.note?.trim())) {
            return acc + 1;
        }
        return acc;
    }, 0);
  };

  // 👇 [추가] 정렬 로직
  const sortedStudents = useMemo(() => {
    const studentList = [...(classInfo?.students || [])];

    switch(sortKey) {
        case 'absences':
            return studentList.sort((a, b) => getMonthlyAbsences(b.id) - getMonthlyAbsences(a.id));
        case 'stars':
            return studentList.sort((a, b) => getTotalStars(b.id) - getTotalStars(a.id));
        case 'notes':
            return studentList.sort((a, b) => getTotalNotes(b.id) - getTotalNotes(a.id));
        case 'default':
        default:
            return studentList.sort((a,b) => (a.number || 999) - (b.number || 999));
    }
  }, [classInfo, schedules, sortKey]);

  if (!classInfo) {
    return <div>반 정보를 찾을 수 없습니다. <Button onClick={onBack}>뒤로가기</Button></div>;
  }
  
  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        classInfo={classInfo}
        schedules={schedules}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  const gradeColors: { [key: number]: string } = { 1: grade1Color, 2: grade2Color, 3: grade3Color };
  const backgroundColor = gradeColors[classInfo.grade] || 'white';

  return (
    <Card style={{ backgroundColor }} className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 px-0 text-blue-600 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              <span>전체 반 목록으로</span>
            </Button>
            <h1 className="text-2xl font-bold mt-2">{classInfo.name} 학생 현황</h1>
          </div>
          {/* 👇 [추가] 정렬 버튼 그룹 */}
          <div className="flex items-center space-x-2">
            <Button size="sm" variant={sortKey === 'default' ? 'primary' : 'outline'} onClick={() => setSortKey('default')}><ArrowUpDown className="h-4 w-4 mr-1"/>기본</Button>
            <Button size="sm" variant={sortKey === 'absences' ? 'primary' : 'outline'} onClick={() => setSortKey('absences')}>결석 많은 순</Button>
            <Button size="sm" variant={sortKey === 'stars' ? 'primary' : 'outline'} onClick={() => setSortKey('stars')}>칭찬 많은 순</Button>
            <Button size="sm" variant={sortKey === 'notes' ? 'primary' : 'outline'} onClick={() => setSortKey('notes')}>기록 많은 순</Button>
          </div>
        </div>
        <div className="bg-white rounded-lg border">
          <ul className="divide-y">
              {sortedStudents.map(student => {
                  const absenceCount = getMonthlyAbsences(student.id);
                  const starCount = getTotalStars(student.id);
                  const monthlyStarCount = getMonthlyStars(student.id);
                  const noteCount = getTotalNotes(student.id);
                  const monthlyNoteCount = getMonthlyNotes(student.id); // 👈 이번 달 기록 개수 계산
                  return (
                      <li key={student.id} onClick={() => setSelectedStudent(student)} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                          <span className="w-8 text-center text-gray-500 font-mono text-sm">{student.number || '-'}</span>
                          <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center ${starCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                              <Star className="h-4 w-4 mr-1"/>
                              <span>총 {starCount}개</span>
                              {monthlyStarCount > 0 && <span className="text-xs text-gray-400 ml-1">(이번 달 {monthlyStarCount}개)</span>}
                          </div>
                          {/* 👇 [수정] 이번 달 기록 개수 표시 UI 추가 */}
                          <div className={`flex items-center ${noteCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              <MessageSquare className="h-4 w-4 mr-1"/>
                              <span>기록 {noteCount}건</span>
                              {monthlyNoteCount > 0 && <span className="text-xs text-gray-400 ml-1">(이번 달 {monthlyNoteCount}건)</span>}
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
      </div>
    </Card>
  );
};