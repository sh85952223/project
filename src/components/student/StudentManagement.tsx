import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent } from '../ui/Card';
import { Users, ChevronRight } from 'lucide-react';
import { ClassStudentList } from './ClassStudentList';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ClassInfo } from '../../types';

export const StudentManagement: React.FC = () => {
  const { classes } = useScheduleData();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

  // 👇 [추가] 반 목록을 학년별로 그룹화하는 로직
  const groupedClasses = useMemo(() => {
    return classes.reduce((acc, currentClass) => {
      const grade = currentClass.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(currentClass);
      return acc;
    }, {} as Record<number, ClassInfo[]>);
  }, [classes]);

  if (selectedClassId) {
    return <ClassStudentList classId={selectedClassId} onBack={() => setSelectedClassId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">학생 관리</h1>
        <p className="text-sm text-gray-500 mt-1">학생 현황을 보려면 아래에서 반을 선택하세요.</p>
      </div>

      {/* 👇 [수정] 그룹화된 반 목록을 학년별로 렌더링합니다. */}
      {Object.keys(groupedClasses).sort().map(grade => (
        <div key={grade}>
          <h2 className="text-xl font-semibold mb-3">{grade}학년</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedClasses[Number(grade)].map(classInfo => {
              const gradeColors: { [key: number]: string } = { 1: grade1Color, 2: grade2Color, 3: grade3Color };
              const backgroundColor = gradeColors[classInfo.grade] || 'white';

              return (
                <Card 
                  key={classInfo.id} 
                  hover 
                  onClick={() => setSelectedClassId(classInfo.id)}
                  style={{ backgroundColor }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{classInfo.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Users className="h-4 w-4 mr-1.5" />
                          <span>학생 {classInfo.students.length}명</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};