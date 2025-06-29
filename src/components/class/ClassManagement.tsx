import React, { useState, useMemo } from 'react';
import { useScheduleData } from '../../context/ScheduleContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ClassInfo } from '../../types';
import { Plus, Users, Trash2, Edit3 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
// 👇 [수정] 새로 분리한 모달 컴포넌트들을 import 합니다.
import { AddClassModal } from './AddClassModal';
import { EditClassModal } from './EditClassModal';
import { StudentManagementModal } from './StudentManagementModal';

export const ClassManagement: React.FC = () => {
  const { classes, deleteClass } = useScheduleData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  const [grade1Color] = useLocalStorage<string>('settings:grade1Color', '#f8fafc');
  const [grade2Color] = useLocalStorage<string>('settings:grade2Color', '#f8fafc');
  const [grade3Color] = useLocalStorage<string>('settings:grade3Color', '#f8fafc');

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

  const handleAddClass = () => {
    setEditingClass(null);
    setIsAddModalOpen(true);
  };

  const handleEditClass = (classInfo: ClassInfo) => {
    setEditingClass(classInfo);
    setIsEditModalOpen(true);
  };

  const handleManageStudents = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setIsStudentModalOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (window.confirm('이 반을 삭제하시겠습니까? 관련된 모든 수업 기록도 함께 삭제됩니다.')) {
      await deleteClass(classId);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">반 관리</h1>
        <Button onClick={handleAddClass} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" /> <span>반 추가</span>
        </Button>
      </div>

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
                            style={{ backgroundColor }}
                        >
                            <CardHeader>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{classInfo.name}</h3>
                                <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEditClass(classInfo)}><Edit3 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(classInfo.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <p className="text-sm text-gray-600 mb-4">학생 수: {classInfo.students.length}명</p>
                            <Button variant="outline" size="sm" onClick={() => handleManageStudents(classInfo)} className="w-full flex items-center justify-center space-x-2">
                                <Users className="h-4 w-4"/>
                                <span>학생 관리</span>
                            </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      ))}

      {isAddModalOpen && <AddClassModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />}
      {editingClass && <EditClassModal isOpen={isEditModalOpen} onClose={() => setEditingClass(null)} classInfo={editingClass} />}
      {selectedClass && <StudentManagementModal isOpen={isStudentModalOpen} onClose={() => setSelectedClass(null)} classInfo={selectedClass} />}
    </div>
  );
};