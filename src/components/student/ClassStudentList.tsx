import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Student } from '../../types';
import { Button } from '../ui/Button';
import { ArrowLeft, UserX, MessageSquare, Star, ArrowUpDown } from 'lucide-react';
// 👇 [수정] isToday, isSameWeek, getMonth 함수를 import 목록에 추가했습니다.
import { parseISO, isSameMonth, isSameWeek, isToday, getMonth } from 'date-fns';
import { StudentDetailView } from './StudentDetailView';
import { Card } from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type SortKey = 'default' | 'absences' | 'stars' | 'notes';
type Period = 'today' | 'week' | 'month' | 'semester1' | 'semester2' | 'total';

interface ClassStudentListProps {
  classId: string;
  onBack: () => void;
}

export const ClassStudentList: React.FC<ClassStudentListProps> = ({ classId, onBack }) => {
  const { classes, schedules } = useScheduleData();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [period, setPeriod] = useState<Period>('month');

  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  const classInfo = useMemo(() => classes.find(c => c.id === classId), [classId, classes]);

  const getStatsByPeriod = (studentId: string, statType: 'absences' | 'stars' | 'notes') => {
    const today = new Date();
    
    const dateFilter = (dateStr: string): boolean => {
        try {
            const date = parseISO(dateStr);
            switch(period) {
                case 'today': return isToday(date);
                case 'week': return isSameWeek(date, today, { weekStartsOn: 1 });
                case 'month': return isSameMonth(date, today);
                case 'semester1': return getMonth(date) >= 2 && getMonth(date) <= 7;
                case 'semester2': return getMonth(date) >= 8 || getMonth(date) <= 1;
                case 'total': return true;
                default: return false;
            }
        } catch (e) {
            console.error("Invalid date string provided to dateFilter:", dateStr);
            return false;
        }
    };

    return schedules.reduce((acc, schedule) => {
        if (!schedule.date || !dateFilter(schedule.date)) return acc;

        switch(statType) {
            case 'absences':
                return acc + (schedule.absences?.some(a => a.studentId === studentId) ? 1 : 0);
            case 'stars':
                return acc + (schedule.praises?.find(p => p.studentId === studentId)?.stars || 0);
            case 'notes':
                return acc + (schedule.specialNotes?.some(n => n.studentId === studentId && n.note?.trim()) ? 1 : 0);
            default: return acc;
        }
    }, 0);
  };
  
  const sortedStudents = useMemo(() => {
    const studentList = [...(classInfo?.students || [])];

    switch(sortKey) {
        case 'absences':
            return studentList.sort((a, b) => getStatsByPeriod(b.id, 'absences') - getStatsByPeriod(a.id, 'absences'));
        case 'stars':
            return studentList.sort((a, b) => getStatsByPeriod(b.id, 'stars') - getStatsByPeriod(a.id, 'stars'));
        case 'notes':
            return studentList.sort((a, b) => getStatsByPeriod(b.id, 'notes') - getStatsByPeriod(a.id, 'notes'));
        case 'default':
        default:
            return studentList.sort((a,b) => (a.number || 999) - (b.number || 999));
    }
  }, [classInfo?.students, schedules, sortKey, period]);


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

  const periodLabels: Record<Period, string> = {
      today: "오늘", week: "이번 주", month: "이번 달",
      semester1: "1학기", semester2: "2학기", total: "총 합계"
  }

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
          <div className="flex items-center space-x-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="form-input text-sm py-1.5">
                <option value="today">오늘</option>
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
                <option value="semester1">1학기</option>
                <option value="semester2">2학기</option>
                <option value="total">총 합계</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 border-t pt-4">
            <span className="text-sm font-medium mr-2">정렬:</span>
            <Button size="sm" variant={sortKey === 'default' ? 'primary' : 'outline'} onClick={() => setSortKey('default')}><ArrowUpDown className="h-4 w-4 mr-1"/>기본 (번호순)</Button>
            <Button size="sm" variant={sortKey === 'absences' ? 'primary' : 'outline'} onClick={() => setSortKey('absences')}>결석 많은 순</Button>
            <Button size="sm" variant={sortKey === 'stars' ? 'primary' : 'outline'} onClick={() => setSortKey('stars')}>칭찬 많은 순</Button>
            <Button size="sm" variant={sortKey === 'notes' ? 'primary' : 'outline'} onClick={() => setSortKey('notes')}>기록 많은 순</Button>
        </div>

        <div className="bg-white rounded-lg border">
          <ul className="divide-y">
              {sortedStudents.map(student => {
                  const starCount = getStatsByPeriod(student.id, 'stars');
                  const noteCount = getStatsByPeriod(student.id, 'notes');
                  const absenceCount = getStatsByPeriod(student.id, 'absences');
                  return (
                      <li key={student.id} onClick={() => setSelectedStudent(student)} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                          <span className="w-8 text-center text-gray-500 font-mono text-sm">{student.number || '-'}</span>
                          <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                          <div className={`flex items-center ${starCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                              <Star className="h-4 w-4 mr-1"/>
                              <span>{periodLabels[period]} 별 {starCount}개</span>
                          </div>
                          <div className={`flex items-center ${noteCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              <MessageSquare className="h-4 w-4 mr-1"/>
                              <span>{periodLabels[period]} 기록 {noteCount}건</span>
                          </div>
                          <div className={`flex items-center ${absenceCount > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                              <UserX className="h-4 w-4 mr-1"/>
                              <span>{periodLabels[period]} 결석 {absenceCount}회</span>
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