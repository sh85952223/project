import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Student } from '../../types';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import { StudentDetailView } from './StudentDetailView';
import { Card } from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useStudentStats, Period } from '../../hooks/useStudentStats';
import { StudentListFilters } from './StudentListFilters';
import { StudentListItem } from './StudentListItem';

type SortKey = 'default' | 'absences' | 'stars' | 'notes';

interface ClassStudentListProps {
  classId: string;
  onBack: () => void;
}

export const ClassStudentList: React.FC<ClassStudentListProps> = ({ classId, onBack }) => {
  const { classes, schedules } = useScheduleData();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [period, setPeriod] = useState<Period>('month');
  
  const [subjects] = useLocalStorage<string[]>('settings:subjects', ['기술', '가정']);
  // 👇 [수정] 기본적으로 모든 과목이 선택되도록 초기 상태를 변경합니다.
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subjects);
  
  const [isPending, startTransition] = useTransition();
  
  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');
  
  const classInfo = useMemo(() => classes.find(c => c.id === classId), [classId, classes]);
  const { getStats } = useStudentStats(schedules);

  // 설정에서 과목 목록이 변경되면, 선택된 과목 목록도 동기화합니다.
  useEffect(() => {
    setSelectedSubjects(subjects);
  }, [subjects]);

  const sortedStudents = useMemo(() => {
    const studentList = [...(classInfo?.students || [])];
    const getStatForSort = (studentId: string, key: SortKey) => {
        if (key === 'default') return 0;
        return getStats(studentId, key, period, selectedSubjects);
    }
    if (sortKey === 'default') {
        return studentList.sort((a,b) => (a.number || 999) - (b.number || 999));
    }
    return studentList.sort((a, b) => getStatForSort(b.id, sortKey) - getStatForSort(a.id, sortKey));
  }, [classInfo?.students, getStats, sortKey, period, selectedSubjects]);

  const handleFilterChange = (newFilters: { period?: Period; subjects?: string[]; sortKey?: SortKey }) => {
    startTransition(() => {
        if (newFilters.period) setPeriod(newFilters.period);
        if (newFilters.subjects !== undefined) setSelectedSubjects(newFilters.subjects);
        if (newFilters.sortKey) setSortKey(newFilters.sortKey);
    });
  };
  
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
  };

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
        </div>
        
        <StudentListFilters
            period={period}
            selectedSubjects={selectedSubjects}
            sortKey={sortKey}
            onFilterChange={handleFilterChange}
        />

        <div className={`bg-white rounded-lg border transition-opacity duration-150 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <ul className="divide-y">
              {sortedStudents.map(student => (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    stats={{
                        stars: getStats(student.id, 'stars', period, selectedSubjects),
                        notes: getStats(student.id, 'notes', period, selectedSubjects),
                        absences: getStats(student.id, 'absences', period, selectedSubjects),
                    }}
                    periodLabel={periodLabels[period]}
                    onClick={() => setSelectedStudent(student)}
                  />
              ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};